"""
regex_rules.py — static rule definitions for regex-based secret detection.

Regex scanning is limited to secrets, tokens, and insecure URL patterns.
Vulnerability logic (behaviour) is handled exclusively by the AST engine.
"""

from dataclasses import dataclass
import re

from backend.models.schemas import Severity


@dataclass(frozen=True)
class RegexRule:
    rule_id:        str
    title:          str
    description:    str
    severity:       Severity
    recommendation: str
    cwe_reference:  str
    pattern:        re.Pattern  # compiled at module load — no per-call overhead


# ---------------------------------------------------------------------------
# Rule catalogue
# Patterns are line-oriented; scanner applies them line by line.
# ---------------------------------------------------------------------------

RULES: list[RegexRule] = [

    RegexRule(
        rule_id        = "CG-RGX-001",
        title          = "Hardcoded password",
        description    = (
            "A variable named 'password', 'passwd', or 'pwd' is assigned a "
            "non-empty string literal. Hardcoded credentials are exposed to anyone "
            "with access to the source code or version history."
        ),
        severity       = Severity.CRITICAL,
        recommendation = "Store credentials in environment variables or a secrets manager. Never commit secrets to source control.",
        cwe_reference  = "CWE-798: Use of Hard-coded Credentials",
        pattern        = re.compile(
            r"""(?i)(password|passwd|pwd)\s*=\s*['"][^'"]{2,}['"]""",
            re.IGNORECASE,
        ),
    ),

    RegexRule(
        rule_id        = "CG-RGX-002",
        title          = "Hardcoded API key or secret token",
        description    = (
            "A variable named 'api_key', 'apikey', 'secret', 'token', or 'auth_token' "
            "is assigned a string literal. Exposed API keys can be used to impersonate "
            "the application and abuse third-party services."
        ),
        severity       = Severity.CRITICAL,
        recommendation = "Load API keys from environment variables (os.environ) or a vault. Rotate any key that has been committed.",
        cwe_reference  = "CWE-798: Use of Hard-coded Credentials",
        pattern        = re.compile(
            r"""(?i)(api_?key|secret_?key|auth_?token|access_?token|secret)\s*=\s*['"][^'"]{4,}['"]""",
            re.IGNORECASE,
        ),
    ),

    RegexRule(
        rule_id        = "CG-RGX-003",
        title          = "Hardcoded AWS access key",
        description    = (
            "A string matching the AWS access key ID format (AKIA…) was detected. "
            "Exposed AWS credentials allow full account compromise depending on the "
            "attached IAM permissions."
        ),
        severity       = Severity.CRITICAL,
        recommendation = "Use IAM roles, instance profiles, or AWS Secrets Manager. Revoke and rotate any exposed key immediately.",
        cwe_reference  = "CWE-798: Use of Hard-coded Credentials",
        pattern        = re.compile(
            r"""(?<![A-Z0-9])(AKIA|ASIA|AROA)[A-Z0-9]{16}(?![A-Z0-9])"""
        ),
    ),

    RegexRule(
        rule_id        = "CG-RGX-004",
        title          = "Hardcoded private key or certificate",
        description    = (
            "A PEM-encoded private key header was detected in the source. "
            "Embedded private keys compromise TLS/SSH security and are permanently "
            "exposed once committed to version control."
        ),
        severity       = Severity.CRITICAL,
        recommendation = "Store private keys in secure storage (HSM, vault, secrets manager). Never embed them in source code.",
        cwe_reference  = "CWE-321: Use of Hard-coded Cryptographic Key",
        pattern        = re.compile(
            r"""-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----"""
        ),
    ),

    RegexRule(
        rule_id        = "CG-RGX-005",
        title          = "Use of HTTP (unencrypted) URL",
        description    = (
            "A hard-coded HTTP URL was found. Unencrypted HTTP transmits data in "
            "plaintext, exposing credentials, tokens, and sensitive payloads to "
            "network interception."
        ),
        severity       = Severity.LOW,
        recommendation = "Replace all HTTP URLs with HTTPS. Use HSTS where applicable.",
        cwe_reference  = "CWE-319: Cleartext Transmission of Sensitive Information",
        pattern        = re.compile(
            r"""['"]http://[^\s'"]{4,}['"]"""
        ),
    ),

    RegexRule(
        rule_id        = "CG-RGX-006",
        title          = "Hardcoded database connection string",
        description    = (
            "A database connection string containing credentials was detected. "
            "Connection strings with embedded passwords expose the database to "
            "anyone reading the source or logs."
        ),
        severity       = Severity.HIGH,
        recommendation = "Store connection strings in environment variables. Use connection pooling libraries that read from secure config.",
        cwe_reference  = "CWE-798: Use of Hard-coded Credentials",
        pattern        = re.compile(
            r"""(?i)(postgresql|mysql|mongodb|sqlite|mssql|oracle):\/\/[^:]+:[^@]+@"""
        ),
    ),

    RegexRule(
        rule_id        = "CG-RGX-007",
        title          = "Generic high-entropy secret assignment",
        description    = (
            "A variable name associated with secrets ('secret', 'private_key', "
            "'encryption_key', 'signing_key') is assigned a string of 16+ characters. "
            "This pattern commonly indicates a hardcoded cryptographic secret."
        ),
        severity       = Severity.HIGH,
        recommendation = "Replace hardcoded keys with values loaded from environment variables or a secrets manager.",
        cwe_reference  = "CWE-321: Use of Hard-coded Cryptographic Key",
        pattern        = re.compile(
            r"""(?i)(private_key|encryption_key|signing_key|jwt_secret|django_secret)\s*=\s*['"][^'"]{16,}['"]""",
            re.IGNORECASE,
        ),
    ),
]

RULE_MAP: dict[str, RegexRule] = {r.rule_id: r for r in RULES}
