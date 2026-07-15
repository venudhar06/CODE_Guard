"""
POST /api/v1/analyze  — upload Python files, return List[AnalysisResult]
GET  /api/v1/report/{request_id}?format=json|html — download report

Routing only. All business logic lives in AnalysisService / ReportService.
"""

import logging

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import HTMLResponse, JSONResponse, Response

from backend.config.settings import Settings, get_settings
from backend.models.schemas import AnalysisResult
from backend.services.analysis_service import AnalysisService, get_analysis_service
from backend.services.report_service import ReportService, get_report_service

logger = logging.getLogger(__name__)
router = APIRouter(tags=["analysis"])


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _validate_file(file: UploadFile, settings: Settings) -> None:
    """Raise 400 for non-.py files; size checked after read."""
    if not file.filename or not file.filename.endswith(".py"):
        raise HTTPException(
            status_code=400,
            detail=f"'{file.filename}' is not a Python (.py) file.",
        )


async def _read_source(file: UploadFile, settings: Settings) -> str:
    """Read file bytes, enforce size limit, decode to str."""
    raw = await file.read()
    if len(raw) > settings.max_file_size_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"'{file.filename}' exceeds the {settings.max_file_size_bytes // 1_000} KB limit.",
        )
    try:
        return raw.decode("utf-8")
    except UnicodeDecodeError:
        raise HTTPException(
            status_code=400,
            detail=f"'{file.filename}' could not be decoded as UTF-8.",
        )


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.post(
    "/analyze",
    response_model=list[AnalysisResult],
    summary="Analyse Python files for security vulnerabilities",
)
async def analyze(
    files: list[UploadFile] = File(..., description="One or more .py files"),
    settings:         Settings        = Depends(get_settings),
    analysis_service: AnalysisService = Depends(get_analysis_service),
) -> list[AnalysisResult]:
    """
    Upload 1–N Python files. Returns one AnalysisResult per file.
    Detection is deterministic (AST + Regex). AI explanation is additive.
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files provided.")

    if len(files) > settings.max_files_per_request:
        raise HTTPException(
            status_code=400,
            detail=f"Maximum {settings.max_files_per_request} files per request.",
        )

    results: list[AnalysisResult] = []

    for file in files:
        _validate_file(file, settings)
        source = await _read_source(file, settings)
        result = analysis_service.analyze(source, file.filename)
        results.append(result)

    return results


@router.get(
    "/report/{request_id}",
    summary="Download a report for a previous analysis",
)
async def get_report(
    request_id:     str,
    format:         str           = "json",
    analysis_service: AnalysisService = Depends(get_analysis_service),
    report_service:   ReportService   = Depends(get_report_service),
) -> Response:
    """
    Download the report for a completed analysis.
    format=json (default) or format=html
    """
    if format not in ("json", "html"):
        raise HTTPException(status_code=400, detail="format must be 'json' or 'html'.")

    result = analysis_service.get_result(request_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Result not found. Results are held in memory — re-upload to re-analyse.")

    filename = f"codeguard-{request_id[:8]}.{format}"

    if format == "html":
        content = report_service.to_html(result)
        return HTMLResponse(
            content=content,
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )

    content = report_service.to_json(result)
    return Response(
        content=content,
        media_type="application/json",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
