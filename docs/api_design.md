# CodeGuard AI 3.0 — API Design

## Base URL
`http://localhost:8000/api/v1`

---

## Endpoints

### POST /analyze
Upload one or more Python files for analysis.

**Request**
```
Content-Type: multipart/form-data
Field: files (1–5 × .py files, max 1 MB each)
```

**Response `200 OK`**
```json
[
  {
    "request_id": "uuid",
    "status": "success | partial | failed",
    "filename": "example.py",
    "analyzed_at": "2024-01-01T00:00:00Z",
    "ai_available": true,
    "security_score": {
      "score": 42,
      "grade": "D",
      "breakdown": { "critical": 1, "high": 1, "medium": 1, "low": 1 }
    },
    "findings": [
      {
        "id": "uuid",
        "rule_id": "CG-AST-001",
        "title": "Use of eval()",
        "description": "...",
        "severity": "critical",
        "detection_method": "ast",
        "line_number": 14,
        "column": 4,
        "code_snippet": "result = eval(user_input)",
        "ai_explanation": {
          "explanation": "...",
          "risk": "...",
          "attack_scenario": "...",
          "secure_fix": "...",
          "best_practice": "...",
          "owasp_reference": "A03:2021 – Injection",
          "cwe_reference": "CWE-78"
        }
      }
    ]
  }
]
```

**Errors**
| Code | Reason |
|------|--------|
| 400  | Non-.py file or empty upload |
| 413  | File exceeds 1 MB |
| 422  | Validation error |
| 500  | Internal analysis failure |

---

### GET /report/{request_id}?format=json
Download full report. `format` = `json` (default) or `html`.

**Response `200 OK`**
- `format=json` → `application/json` file download
- `format=html` → `text/html` file download

---

### GET /health
Liveness check.

```json
{ "status": "ok", "version": "1.0.0" }
```

---

## Design decisions

- **Versioned routes** `/api/v1/` from day 1 — Phase 2 gets `/api/v2/` without breakage.
- **`status: partial`** when analysis succeeds but AI is unavailable — frontend shows findings without AI panel, never crashes.
- **`ai_explanation: null`** per-finding (not per-request) — allows mixed results if AI times out mid-batch.
- **List response** even for single file — frontend always iterates, never branches on shape.
