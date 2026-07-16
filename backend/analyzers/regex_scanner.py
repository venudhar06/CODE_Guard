"""
regex_scanner.py — deterministic regex-based secret and pattern detection.

Scans source line by line. Each line is tested against every RegexRule.
Multiple matches on the same line produce one Finding per matched rule
(rules are distinct vulnerability types, not duplicates).

Satisfies RegexScannerProtocol defined in analysis_service.py.
"""

import logging
import re

from backend.analyzers.regex_rules import RULES, RegexRule
from backend.models.schemas import DetectionMethod, Finding

logger = logging.getLogger(__name__)


def _make_finding(rule: RegexRule, line_number: int, snippet: str) -> Finding:
    return Finding(
        rule_id         = rule.rule_id,
        title           = rule.title,
        description     = rule.description,
        severity        = rule.severity,
        detection_method= DetectionMethod.REGEX,
        line_number     = line_number,
        column          = None,          # regex matches are line-level
        code_snippet    = snippet.strip(),
        recommendation  = rule.recommendation,
        cwe_reference   = rule.cwe_reference,
    )


class RegexScanner:
    """
    Production regex scanner. Satisfies RegexScannerProtocol.
    Thread-safe: no shared mutable state between scan() calls.
    """

    def scan(self, source: str, filename: str) -> list[Finding]:
        """
        Scan source line by line against all regex rules.
        Returns one Finding per (rule, line) match.
        """
        findings: list[Finding] = []
        lines = source.splitlines()

        for lineno, line in enumerate(lines, start=1):
            # Skip comment-only lines — avoid false positives in docs/examples
            stripped = line.strip()
            if stripped.startswith("#"):
                continue

            for rule in RULES:
                if rule.pattern.search(line):
                    findings.append(_make_finding(rule, lineno, line))
                    logger.debug(
                        "%s L%d: regex hit %s", filename, lineno, rule.rule_id
                    )

        logger.debug(
            "%s: regex found %d finding(s)", filename, len(findings)
        )
        return findings
