"""
POST /api/v1/analyze
Accepts one or more Python files; returns AnalysisResult per file.
Business logic lives in services — this file is routing only.
"""

# Implemented in Milestone 3.
# Contract defined here so the frontend can be built against it in Milestone 2.

# POST /api/v1/analyze
#   Request : multipart/form-data  — field name "files", 1–N .py files
#   Response: application/json     — List[AnalysisResult]
#   Errors  : 400 (bad file), 413 (too large), 422 (validation)
#
# GET /api/v1/report/{request_id}?format=json|html
#   Response: file download

# Stub router so main.py import doesn't fail during frontend milestone.
from fastapi import APIRouter

router = APIRouter(tags=["analysis"])
