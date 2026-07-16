"""
Core Pydantic schemas — typed contracts between every pipeline stage.
All inter-module communication uses these models, never raw dicts.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Enumerations
# ---------------------------------------------------------------------------

class Severity(str, Enum):
    CRITICAL = "critical"
    HIGH     = "high"
    MEDIUM   = "medium"
    LOW      = "low"


class DetectionMethod(str, Enum):
    AST   = "ast"
    REGEX = "regex"


class AnalysisStatus(str, Enum):
    SUCCESS         = "success"
    PARTIAL         = "partial"   # analysis ok, AI unavailable
    FAILED          = "failed"


# ---------------------------------------------------------------------------
# Pipeline stage contracts
# ---------------------------------------------------------------------------

class AIExplanation(BaseModel):
    """Produced by AIService. Never drives detection logic."""
    explanation:      str
    risk:             str
    attack_scenario:  str
    secure_fix:       str
    best_practice:    str
    owasp_reference:  str
    cwe_reference:    str


class Finding(BaseModel):
    """One detected vulnerability. Produced by RuleEngine + SeverityEngine."""
    id:               str        = Field(default_factory=lambda: str(uuid.uuid4()))
    rule_id:          str
    title:            str
    description:      str
    severity:         Severity
    detection_method: DetectionMethod
    line_number:      Optional[int]   = None
    column:           Optional[int]   = None
    code_snippet:     Optional[str]   = None
    recommendation:   Optional[str]   = None
    cwe_reference:    Optional[str]   = None
    ai_explanation:   Optional[AIExplanation] = None  # None if AI unavailable


class SecurityScore(BaseModel):
    """Calculated by SeverityEngine from all findings."""
    score:     int   = Field(..., ge=0, le=100)
    grade:     str                               # A / B / C / D / F
    breakdown: dict[str, int]                    # severity → count


class AnalysisResult(BaseModel):
    """Top-level response returned by the API."""
    request_id:     str             = Field(default_factory=lambda: str(uuid.uuid4()))
    status:         AnalysisStatus
    filename:       str
    analyzed_at:    datetime        = Field(default_factory=datetime.utcnow)
    findings:       list[Finding]   = []
    security_score: Optional[SecurityScore] = None
    ai_available:   bool            = True
    error:          Optional[str]   = None
