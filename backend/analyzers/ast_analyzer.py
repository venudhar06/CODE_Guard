"""
ast_analyzer.py — deterministic AST-based vulnerability detection.

Uses Python's built-in `ast` module exclusively. No AI, no regex.
One NodeVisitor walks the tree once; each visit_* method checks one
pattern family. Adding new patterns = adding a new visit_* method.
"""

import ast
import logging
import textwrap
from typing import Optional

from backend.analyzers.ast_rules import RULE_MAP, ASTRule
from backend.models.schemas import DetectionMethod, Finding, Severity

logger = logging.getLogger(__name__)

# SQL keywords that hint at a query string being built dynamically
_SQL_KEYWORDS = frozenset(
    {"select", "insert", "update", "delete", "drop", "create", "alter", "where"}
)

# yaml.load() Loader arguments considered unsafe (absence of Loader is also unsafe)
_UNSAFE_YAML_LOADERS = frozenset({"Loader", "FullLoader", "UnsafeLoader"})


def _make_finding(rule: ASTRule, node: ast.AST, snippet: Optional[str]) -> Finding:
    return Finding(
        rule_id         = rule.rule_id,
        title           = rule.title,
        description     = rule.description,
        severity        = rule.severity,
        detection_method= DetectionMethod.AST,
        line_number     = getattr(node, "lineno", None),
        column          = getattr(node, "col_offset", None),
        code_snippet    = snippet,
        recommendation  = rule.recommendation,
        cwe_reference   = rule.cwe_reference,
    )


class _VulnerabilityVisitor(ast.NodeVisitor):
    """
    Single-pass AST visitor. Populates self.findings during traversal.
    One method per detection category keeps responsibilities isolated.
    """

    def __init__(self, source_lines: list[str]) -> None:
        self._lines    = source_lines
        self.findings: list[Finding] = []

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _snippet(self, node: ast.AST) -> Optional[str]:
        """Return the source line for this node, stripped."""
        lineno = getattr(node, "lineno", None)
        if lineno and 1 <= lineno <= len(self._lines):
            return self._lines[lineno - 1].strip()
        return None

    def _add(self, rule_id: str, node: ast.AST) -> None:
        rule = RULE_MAP.get(rule_id)
        if rule:
            self.findings.append(_make_finding(rule, node, self._snippet(node)))

    @staticmethod
    def _func_name(node: ast.Call) -> Optional[str]:
        """
        Extract a dotted call name from a Call node.
        e.g.  eval(x)          → 'eval'
              os.system(x)     → 'os.system'
              subprocess.run() → 'subprocess.run'
        """
        if isinstance(node.func, ast.Name):
            return node.func.id
        if isinstance(node.func, ast.Attribute):
            parts: list[str] = []
            cur: ast.expr = node.func
            while isinstance(cur, ast.Attribute):
                parts.append(cur.attr)
                cur = cur.value
            if isinstance(cur, ast.Name):
                parts.append(cur.id)
            return ".".join(reversed(parts))
        return None

    # ------------------------------------------------------------------
    # Visitor methods — one per detection category
    # ------------------------------------------------------------------

    def visit_Call(self, node: ast.Call) -> None:  # noqa: N802
        name = self._func_name(node)
        if not name:
            self.generic_visit(node)
            return

        # ── eval() ──────────────────────────────────────────────────
        if name == "eval":
            self._add("CG-AST-001", node)

        # ── exec() ──────────────────────────────────────────────────
        elif name == "exec":
            self._add("CG-AST-002", node)

        # ── os.system() ─────────────────────────────────────────────
        elif name == "os.system":
            self._add("CG-AST-003", node)

        # ── subprocess.call / run / Popen ───────────────────────────
        elif name in ("subprocess.call",):
            self._add("CG-AST-004", node)

        elif name in ("subprocess.run",):
            self._add("CG-AST-005", node)

        elif name in ("subprocess.Popen",):
            self._add("CG-AST-006", node)

        # ── pickle.loads() ──────────────────────────────────────────
        elif name == "pickle.loads":
            self._add("CG-AST-007", node)

        # ── yaml.load() — flag only unsafe Loader args ──────────────
        elif name == "yaml.load":
            self._check_yaml_load(node)

        # ── open() in write mode ────────────────────────────────────
        elif name == "open":
            self._check_open(node)

        # ── cursor.execute() with dynamic SQL ───────────────────────
        elif name.endswith(".execute"):
            self._check_sql_execute(node)

        self.generic_visit(node)

    # ------------------------------------------------------------------
    # Specialised checkers (called from visit_Call)
    # ------------------------------------------------------------------

    def _check_yaml_load(self, node: ast.Call) -> None:
        """
        Flag yaml.load() when:
        - No Loader keyword argument is provided (defaults to unsafe), OR
        - Loader= is set to a known unsafe loader name.
        """
        loader_kw = next(
            (kw for kw in node.keywords if kw.arg == "Loader"), None
        )
        if loader_kw is None:
            # No Loader supplied — unsafe by default
            self._add("CG-AST-008", node)
            return

        # Loader supplied — check if it is a known unsafe one
        val = loader_kw.value
        loader_name: Optional[str] = None
        if isinstance(val, ast.Name):
            loader_name = val.id
        elif isinstance(val, ast.Attribute):
            loader_name = val.attr

        if loader_name in _UNSAFE_YAML_LOADERS:
            self._add("CG-AST-008", node)

    def _check_open(self, node: ast.Call) -> None:
        """
        Flag open() calls whose mode argument contains 'w', 'a', or 'x'
        (write / append / exclusive-create).
        Only positional arg[1] or keyword mode= is checked.
        """
        mode: Optional[str] = None

        # Positional: open(path, 'w')
        if len(node.args) >= 2 and isinstance(node.args[1], ast.Constant):
            mode = str(node.args[1].value)
        else:
            # Keyword: open(path, mode='w')
            for kw in node.keywords:
                if kw.arg == "mode" and isinstance(kw.value, ast.Constant):
                    mode = str(kw.value.value)
                    break

        if mode and any(m in mode for m in ("w", "a", "x")):
            self._add("CG-AST-009", node)

    def _check_sql_execute(self, node: ast.Call) -> None:
        """
        Flag cursor.execute() where the first argument is a dynamic string:
        f-string (JoinedStr), %-formatting (BinOp with Mod), or
        .format() call — and the string contains a SQL keyword.
        """
        if not node.args:
            return

        query_arg = node.args[0]
        is_dynamic = isinstance(query_arg, (ast.JoinedStr, ast.BinOp, ast.Call))

        if not is_dynamic:
            return

        # For BinOp, check it is string % something
        if isinstance(query_arg, ast.BinOp):
            if not isinstance(query_arg.op, ast.Mod):
                return

        # Heuristic: confirm it looks like SQL by checking the snippet
        snippet = self._snippet(node)
        if snippet and any(kw in snippet.lower() for kw in _SQL_KEYWORDS):
            self._add("CG-AST-010", node)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

class ASTAnalyzer:
    """
    Production AST analyzer. Satisfies ASTAnalyzerProtocol.
    Thread-safe: no shared mutable state between analyze() calls.
    """

    def analyze(self, source: str, filename: str) -> list[Finding]:
        """
        Parse source and return all AST-detected findings.
        Returns an empty list (not an exception) on parse failure.
        """
        try:
            tree = ast.parse(source, filename=filename)
        except SyntaxError as exc:
            logger.warning("SyntaxError parsing %s: %s", filename, exc)
            return []
        except Exception as exc:
            logger.exception("Unexpected parse error for %s: %s", filename, exc)
            return []

        source_lines = source.splitlines()
        visitor = _VulnerabilityVisitor(source_lines)
        visitor.visit(tree)

        logger.debug(
            "%s: AST found %d finding(s)", filename, len(visitor.findings)
        )
        return visitor.findings
