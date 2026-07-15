"""
ReportService — converts an AnalysisResult into JSON or HTML.

JSON: model serialised to dict (no third-party deps).
HTML: Jinja2 template rendered to string.

Both are returned as strings; the route layer wraps them in the
appropriate FastAPI Response.
"""

import json
import logging
from pathlib import Path

from jinja2 import Environment, FileSystemLoader, select_autoescape

from backend.models.schemas import AnalysisResult

logger = logging.getLogger(__name__)

_TEMPLATES_DIR = Path(__file__).parent.parent / "reports" / "templates"


class ReportService:
    def __init__(self) -> None:
        self._jinja = Environment(
            loader=FileSystemLoader(str(_TEMPLATES_DIR)),
            autoescape=select_autoescape(["html"]),
        )

    def to_json(self, result: AnalysisResult) -> str:
        """Serialise result to a formatted JSON string."""
        return result.model_dump_json(indent=2)

    def to_html(self, result: AnalysisResult) -> str:
        """Render result into the HTML report template."""
        try:
            template = self._jinja.get_template("report.html")
            return template.render(result=result)
        except Exception as exc:
            logger.exception("HTML render failed: %s", exc)
            # Fallback: JSON wrapped in minimal HTML
            return (
                "<html><body><pre>"
                + self.to_json(result)
                + "</pre></body></html>"
            )


# Singleton
_report_service: ReportService | None = None


def get_report_service() -> ReportService:
    global _report_service
    if _report_service is None:
        _report_service = ReportService()
    return _report_service
