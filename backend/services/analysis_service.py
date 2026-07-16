"""
AnalysisService — orchestrates the full analysis pipeline.

Pipeline:
  raw source → ASTAnalyzer → RegexScanner → RuleEngine
             → SeverityEngine → SecurityScore → AnalysisResult

The analyzers are injected at construction time (dependency inversion).
Milestone 3 uses stubs; Milestones 4–7 replace them with real implementations
without touching this file or the route.
"""

import logging
from typing import Protocol, runtime_checkable

from backend.models.schemas import (
    AnalysisResult,
    AnalysisStatus,
    Finding,
    SecurityScore,
)

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Analyser protocols — define the interface each engine must satisfy.
# Real implementations (Milestones 4–7) fulfil these contracts.
# ---------------------------------------------------------------------------

@runtime_checkable
class ASTAnalyzerProtocol(Protocol):
    def analyze(self, source: str, filename: str) -> list[Finding]: ...


@runtime_checkable
class RegexScannerProtocol(Protocol):
    def scan(self, source: str, filename: str) -> list[Finding]: ...


@runtime_checkable
class SeverityEngineProtocol(Protocol):
    def score(self, findings: list[Finding]) -> SecurityScore: ...


# ---------------------------------------------------------------------------
# Stub implementations — replaced in Milestones 4–7
# ---------------------------------------------------------------------------

class _StubASTAnalyzer:
    def analyze(self, source: str, filename: str) -> list[Finding]:
        logger.debug("StubASTAnalyzer: returning no findings (pending M4)")
        return []


class _StubRegexScanner:
    def scan(self, source: str, filename: str) -> list[Finding]:
        logger.debug("StubRegexScanner: returning no findings (pending M5)")
        return []


class _StubSeverityEngine:
    def score(self, findings: list[Finding]) -> SecurityScore:
        return SecurityScore(score=100, grade="A", breakdown={
            "critical": 0, "high": 0, "medium": 0, "low": 0,
        })


# ---------------------------------------------------------------------------
# AnalysisService
# ---------------------------------------------------------------------------

class AnalysisService:
    """
    Orchestrates the analysis pipeline and caches results by request_id.
    Stateless between requests except for the in-memory cache.
    """

    def __init__(
        self,
        ast_analyzer:    ASTAnalyzerProtocol  | None = None,
        regex_scanner:   RegexScannerProtocol | None = None,
        severity_engine: SeverityEngineProtocol | None = None,
    ) -> None:
        self._ast      = ast_analyzer    or _StubASTAnalyzer()
        self._regex    = regex_scanner   or _StubRegexScanner()
        self._severity = severity_engine or _StubSeverityEngine()

        # request_id → AnalysisResult  (MVP: in-memory; Phase 2: Redis/DB)
        self._cache: dict[str, AnalysisResult] = {}

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def analyze(self, source: str, filename: str) -> AnalysisResult:
        """
        Run the full pipeline on a single file's source code.
        Returns a fully-populated AnalysisResult and caches it.
        """
        logger.info("Analysing file: %s", filename)

        try:
            ast_findings   = self._ast.analyze(source, filename)
            regex_findings = self._regex.scan(source, filename)
            all_findings   = ast_findings + regex_findings

            score = self._severity.score(all_findings)

            result = AnalysisResult(
                status         = AnalysisStatus.SUCCESS,
                filename       = filename,
                findings       = all_findings,
                security_score = score,
                ai_available   = False,   # AI layer added in Milestone 8
            )

        except Exception as exc:
            logger.exception("Pipeline failed for %s: %s", filename, exc)
            result = AnalysisResult(
                status   = AnalysisStatus.FAILED,
                filename = filename,
                error    = str(exc),
            )

        self._cache[result.request_id] = result
        logger.info(
            "Complete: %s | findings=%d | score=%s",
            filename,
            len(result.findings),
            result.security_score.score if result.security_score else "N/A",
        )
        return result

    def get_result(self, request_id: str) -> AnalysisResult | None:
        """Retrieve a cached result by request_id, or None if not found."""
        return self._cache.get(request_id)


# ---------------------------------------------------------------------------
# Singleton factory — one shared instance for the lifetime of the process.
# Replace engines here as milestones complete (no route changes needed).
# ---------------------------------------------------------------------------

def create_analysis_service() -> AnalysisService:
    """
    Wire up real implementations as they become available.
    Milestones 4–7 import and pass their engines here.
    """
    from backend.analyzers.ast_analyzer  import ASTAnalyzer   # M4 ✓
    from backend.analyzers.regex_scanner import RegexScanner  # M5 ✓
    return AnalysisService(
        ast_analyzer    = ASTAnalyzer(),
        regex_scanner   = RegexScanner(),
        severity_engine = None,   # M6/7: SeverityEngine()
    )


_service_instance: AnalysisService | None = None


def get_analysis_service() -> AnalysisService:
    """FastAPI dependency — returns the process-level singleton."""
    global _service_instance
    if _service_instance is None:
        _service_instance = create_analysis_service()
    return _service_instance
