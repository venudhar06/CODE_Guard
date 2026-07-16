"""
ast_rules.py — static rule definitions for AST-based detection.

Each Rule describes exactly one vulnerability pattern.
The ASTAnalyzer loads these; adding a new rule never requires touching
the walker logic.
"""

from dataclasses import dataclass

from backend.models.schemas import Severity


@dataclass(frozen=True)
class ASTRule:
    rule_id:        str
    title:          str
    description:    str
    severity:       Severity
    recommendation: str
    cwe_reference:  str


# ---------------------------------------------------------------------------
# Rule catalogue
# ---------------------------------------------------------------------------

RULES: list[ASTRule] = [

    ASTRule(
        rule_id        = "CG-AST-001",
        title          = "Use of eval()",
        description    = (
            "eval() executes arbitrary Python expressions from a string. "
            "Attacker-controlled input passed to eval() leads to Remote Code Execution."
        ),
        severity       = Severity.CRITICAL,
        recommendation = "Replace eval() with ast.literal_eval() for safe value parsing, or redesign to avoid dynamic execution entirely.",
        cwe_reference  = "CWE-95: Improper Neutralization of Directives in Dynamically Evaluated Code",
    ),

    ASTRule(
        rule_id        = "CG-AST-002",
        title          = "Use of exec()",
        description    = (
            "exec() executes arbitrary Python statements from a string or code object. "
            "Any attacker-controlled data reaching exec() enables full code execution."
        ),
        severity       = Severity.CRITICAL,
        recommendation = "Remove exec() and replace with explicit function calls or a safe dispatch table.",
        cwe_reference  = "CWE-95: Improper Neutralization of Directives in Dynamically Evaluated Code",
    ),

    ASTRule(
        rule_id        = "CG-AST-003",
        title          = "Use of os.system()",
        description    = (
            "os.system() passes a command string directly to the OS shell. "
            "Unsanitised input enables OS command injection."
        ),
        severity       = Severity.HIGH,
        recommendation = "Use subprocess.run() with a list of arguments and shell=False. Never pass user input to shell commands.",
        cwe_reference  = "CWE-78: Improper Neutralization of Special Elements used in an OS Command",
    ),

    ASTRule(
        rule_id        = "CG-AST-004",
        title          = "Use of subprocess.call()",
        description    = (
            "subprocess.call() with shell=True or string arguments may expose the application "
            "to command injection if input is not strictly validated."
        ),
        severity       = Severity.HIGH,
        recommendation = "Pass arguments as a list and set shell=False. Validate and sanitise all inputs.",
        cwe_reference  = "CWE-78: Improper Neutralization of Special Elements used in an OS Command",
    ),

    ASTRule(
        rule_id        = "CG-AST-005",
        title          = "Use of subprocess.run()",
        description    = (
            "subprocess.run() with shell=True or unvalidated string arguments can lead "
            "to command injection vulnerabilities."
        ),
        severity       = Severity.MEDIUM,
        recommendation = "Use shell=False with a list of arguments. Avoid passing user-controlled data to subprocess.",
        cwe_reference  = "CWE-78: Improper Neutralization of Special Elements used in an OS Command",
    ),

    ASTRule(
        rule_id        = "CG-AST-006",
        title          = "Use of subprocess.Popen()",
        description    = (
            "subprocess.Popen() with shell=True or string-based commands is vulnerable "
            "to shell injection if any argument originates from user input."
        ),
        severity       = Severity.HIGH,
        recommendation = "Use shell=False and pass a list. Review all data sources feeding into the command.",
        cwe_reference  = "CWE-78: Improper Neutralization of Special Elements used in an OS Command",
    ),

    ASTRule(
        rule_id        = "CG-AST-007",
        title          = "Use of pickle.loads()",
        description    = (
            "pickle.loads() deserialises arbitrary Python objects. Deserialising attacker-controlled "
            "data with pickle enables Remote Code Execution with no further conditions."
        ),
        severity       = Severity.CRITICAL,
        recommendation = "Replace pickle with a safe format such as JSON or MessagePack. Never deserialise untrusted data with pickle.",
        cwe_reference  = "CWE-502: Deserialization of Untrusted Data",
    ),

    ASTRule(
        rule_id        = "CG-AST-008",
        title          = "Unsafe use of yaml.load()",
        description    = (
            "yaml.load() without an explicit Loader argument (or with Loader=yaml.Loader / FullLoader) "
            "can deserialise arbitrary Python objects, enabling Remote Code Execution."
        ),
        severity       = Severity.HIGH,
        recommendation = "Replace yaml.load() with yaml.safe_load(), which restricts deserialisation to safe types.",
        cwe_reference  = "CWE-502: Deserialization of Untrusted Data",
    ),

    ASTRule(
        rule_id        = "CG-AST-009",
        title          = "Unsafe file write (open in write mode)",
        description    = (
            "Writing to a file path derived from user input without validation can lead to "
            "path traversal attacks, overwriting arbitrary files on the filesystem."
        ),
        severity       = Severity.MEDIUM,
        recommendation = "Validate and sanitise file paths. Use os.path.abspath() and confirm the resolved path is within an allowed directory.",
        cwe_reference  = "CWE-22: Improper Limitation of a Pathname to a Restricted Directory (Path Traversal)",
    ),

    ASTRule(
        rule_id        = "CG-AST-010",
        title          = "Potential SQL injection via string formatting",
        description    = (
            "SQL query constructed using f-string, %-formatting, or .format() with variables "
            "is susceptible to SQL injection if any variable originates from user input."
        ),
        severity       = Severity.HIGH,
        recommendation = "Use parameterised queries or an ORM. Never build SQL strings by concatenating user-supplied values.",
        cwe_reference  = "CWE-89: Improper Neutralization of Special Elements used in an SQL Command",
    ),
]

# Fast lookup by rule_id
RULE_MAP: dict[str, ASTRule] = {r.rule_id: r for r in RULES}
