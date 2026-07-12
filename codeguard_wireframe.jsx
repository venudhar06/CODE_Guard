/**
 * CodeGuard AI 3.0 — UI Wireframe / Design Spec
 * This is Milestone 1 output: a static, non-functional wireframe
 * showing all screens and component hierarchy.
 * Milestone 2 will replace this with the real React implementation.
 *
 * Design direction: security tooling aesthetic — dark background,
 * monospace accents, severity-color system, terminal-inspired data density.
 */

import { useState } from "react";

// ─── Design tokens ───────────────────────────────────────────────────────────
const T = {
  bg:       "#0d1117",
  surface:  "#161b22",
  border:   "#30363d",
  muted:    "#8b949e",
  text:     "#e6edf3",
  accent:   "#58a6ff",
  critical: "#ff4d4f",
  high:     "#fa8c16",
  medium:   "#fadb14",
  low:      "#52c41a",
  success:  "#3fb950",
};

const badge = (sev) => ({
  critical: { bg: "#2d1216", color: T.critical, border: "#5c1e22" },
  high:     { bg: "#2b1a08", color: T.high,     border: "#5b3408" },
  medium:   { bg: "#2b2508", color: T.medium,   border: "#5b4f08" },
  low:      { bg: "#0d2010", color: T.low,       border: "#185224" },
}[sev]);

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_FINDINGS = [
  {
    id: "1", severity: "critical", title: "Use of eval()",
    rule_id: "CG-AST-001", detection_method: "ast", line_number: 14,
    code_snippet: "result = eval(user_input)",
    description: "eval() executes arbitrary Python from a string. Attacker-controlled input leads to RCE.",
    ai_explanation: {
      explanation: "eval() interprets its argument as Python code at runtime.",
      risk: "Remote Code Execution — an attacker can run any command on the server.",
      attack_scenario: "User submits '__import__(\"os\").system(\"rm -rf /\")' as input.",
      secure_fix: "Use ast.literal_eval() for safe value parsing, or redesign the interface to avoid eval entirely.",
      best_practice: "Never pass user-controlled data to eval(), exec(), or compile().",
      owasp_reference: "A03:2021 – Injection",
      cwe_reference: "CWE-78: OS Command Injection",
    },
  },
  {
    id: "2", severity: "high", title: "Hardcoded API key",
    rule_id: "CG-RGX-001", detection_method: "regex", line_number: 3,
    code_snippet: 'API_KEY = "sk-proj-abc123xyz"',
    description: "Secret detected in source. Credentials committed to version control are permanently exposed.",
    ai_explanation: null,
  },
  {
    id: "3", severity: "medium", title: "SQL injection risk via string formatting",
    rule_id: "CG-AST-004", detection_method: "ast", line_number: 42,
    code_snippet: 'cursor.execute(f"SELECT * FROM users WHERE id={uid}")',
    description: "String formatting in SQL queries allows injection attacks.",
    ai_explanation: null,
  },
  {
    id: "4", severity: "low", title: "HTTP URL (unencrypted)",
    rule_id: "CG-RGX-003", detection_method: "regex", line_number: 8,
    code_snippet: 'url = "http://internal-api.example.com/data"',
    description: "HTTP transmits data in plaintext. Use HTTPS for all network calls.",
    ai_explanation: null,
  },
];

const MOCK_SCORE = { score: 42, grade: "D", breakdown: { critical: 1, high: 1, medium: 1, low: 1 } };

// ─── Sub-components ───────────────────────────────────────────────────────────

const SeverityBadge = ({ sev }) => {
  const s = badge(sev);
  return (
    <span style={{
      background: s.bg, color: s.color,
      border: `1px solid ${s.border}`,
      borderRadius: 4, padding: "2px 8px",
      fontSize: 11, fontWeight: 600, textTransform: "uppercase",
      fontFamily: "monospace", letterSpacing: "0.05em",
    }}>{sev}</span>
  );
};

const ScoreRing = ({ score, grade }) => {
  const color = score >= 80 ? T.low : score >= 60 ? T.medium : score >= 40 ? T.high : T.critical;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{
        width: 80, height: 80, borderRadius: "50%",
        border: `4px solid ${color}`,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: T.surface,
      }}>
        <span style={{ fontSize: 22, fontWeight: 700, color, fontFamily: "monospace" }}>{score}</span>
        <span style={{ fontSize: 10, color: T.muted }}>/ 100</span>
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 700, color, fontFamily: "monospace" }}>Grade {grade}</div>
        <div style={{ fontSize: 12, color: T.muted }}>Security score</div>
      </div>
    </div>
  );
};

const StatCard = ({ label, count, sev }) => {
  const s = badge(sev);
  return (
    <div style={{
      background: s.bg, border: `1px solid ${s.border}`,
      borderRadius: 8, padding: "16px 20px", flex: 1, minWidth: 100,
    }}>
      <div style={{ fontSize: 28, fontWeight: 700, color: s.color, fontFamily: "monospace" }}>{count}</div>
      <div style={{ fontSize: 12, color: T.muted, marginTop: 2, textTransform: "capitalize" }}>{label}</div>
    </div>
  );
};

const FindingRow = ({ f, expanded, onToggle }) => {
  const s = badge(f.severity);
  return (
    <div style={{
      border: `1px solid ${expanded ? s.border : T.border}`,
      borderRadius: 8, marginBottom: 8,
      background: expanded ? s.bg : T.surface,
      transition: "all 0.15s",
    }}>
      {/* Header row */}
      <div
        onClick={onToggle}
        style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "12px 16px", cursor: "pointer",
        }}
      >
        <SeverityBadge sev={f.severity} />
        <span style={{
          fontFamily: "monospace", fontSize: 11,
          color: T.accent, background: "#1c2d3f",
          borderRadius: 3, padding: "1px 6px",
        }}>{f.rule_id}</span>
        <span style={{ flex: 1, color: T.text, fontSize: 14 }}>{f.title}</span>
        <span style={{ color: T.muted, fontSize: 12, fontFamily: "monospace" }}>
          {f.detection_method === "ast" ? "⬡ AST" : "∼ REGEX"}
        </span>
        {f.line_number && (
          <span style={{ color: T.muted, fontSize: 12, fontFamily: "monospace" }}>
            L{f.line_number}
          </span>
        )}
        <span style={{ color: T.muted, fontSize: 14 }}>{expanded ? "▲" : "▼"}</span>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${s.border}` }}>
          <p style={{ color: T.muted, fontSize: 13, margin: "12px 0 8px" }}>{f.description}</p>

          {/* Code snippet */}
          <pre style={{
            background: "#0d1117", border: `1px solid ${T.border}`,
            borderRadius: 6, padding: "10px 14px",
            fontFamily: "monospace", fontSize: 12,
            color: "#a5d6ff", margin: "0 0 12px", overflowX: "auto",
          }}>
            <span style={{ color: T.muted, marginRight: 12 }}>L{f.line_number}</span>
            {f.code_snippet}
          </pre>

          {/* AI Explanation panel */}
          {f.ai_explanation ? (
            <div style={{
              background: "#0d1f33", border: `1px solid #1f4068`,
              borderRadius: 8, padding: 14,
            }}>
              <div style={{ color: T.accent, fontSize: 12, fontWeight: 600, marginBottom: 10 }}>
                ✦ AI Explanation
              </div>
              {[
                ["Explanation",     f.ai_explanation.explanation],
                ["Risk",           f.ai_explanation.risk],
                ["Attack scenario", f.ai_explanation.attack_scenario],
                ["Secure fix",     f.ai_explanation.secure_fix],
                ["Best practice",  f.ai_explanation.best_practice],
                ["OWASP",          f.ai_explanation.owasp_reference],
                ["CWE",            f.ai_explanation.cwe_reference],
              ].map(([label, val]) => (
                <div key={label} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                  <span style={{
                    color: T.muted, fontSize: 11, minWidth: 120,
                    paddingTop: 1, textTransform: "uppercase",
                  }}>{label}</span>
                  <span style={{ color: T.text, fontSize: 13 }}>{val}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              color: T.muted, fontSize: 12, fontStyle: "italic",
              border: `1px dashed ${T.border}`, borderRadius: 6, padding: 10,
            }}>
              AI explanation not available — AI service offline or key not configured.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Screens ──────────────────────────────────────────────────────────────────

const UploadScreen = ({ onAnalyze }) => {
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState([]);

  return (
    <div style={{ maxWidth: 560, margin: "80px auto", textAlign: "center" }}>
      <div style={{
        fontFamily: "monospace", color: T.accent,
        fontSize: 12, letterSpacing: "0.2em",
        marginBottom: 8, textTransform: "uppercase",
      }}>CodeGuard AI 3.0</div>
      <h1 style={{ color: T.text, fontSize: 32, fontWeight: 700, margin: "0 0 8px" }}>
        Secure code review,<br />powered by static analysis.
      </h1>
      <p style={{ color: T.muted, margin: "0 0 40px", lineHeight: 1.6 }}>
        Upload Python files. Get findings, severity scores,<br />and AI-assisted explanations in seconds.
      </p>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault(); setDragging(false);
          setFiles(Array.from(e.dataTransfer.files));
        }}
        style={{
          border: `2px dashed ${dragging ? T.accent : T.border}`,
          borderRadius: 12, padding: "48px 32px",
          cursor: "pointer", marginBottom: 16,
          background: dragging ? "#0d1f33" : T.surface,
          transition: "all 0.15s",
        }}
      >
        <div style={{ fontSize: 32, marginBottom: 12 }}>⬡</div>
        <div style={{ color: T.text, marginBottom: 6 }}>
          {files.length ? `${files.length} file(s) selected` : "Drop Python files here"}
        </div>
        <div style={{ color: T.muted, fontSize: 13 }}>or click to browse · .py only · max 1 MB each</div>
      </div>

      <button
        onClick={onAnalyze}
        style={{
          background: T.accent, color: "#0d1117",
          border: "none", borderRadius: 8,
          padding: "12px 36px", fontSize: 15,
          fontWeight: 700, cursor: "pointer",
          opacity: 1,
        }}
      >
        Analyze →
      </button>
    </div>
  );
};

const ResultsScreen = ({ onReset }) => {
  const [expanded, setExpanded] = useState("1");
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState("all");

  const visible = MOCK_FINDINGS.filter(f =>
    (filter === "all" || f.severity === filter) &&
    (f.title.toLowerCase().includes(search.toLowerCase()) ||
     f.rule_id.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 16px" }}>
      {/* Header bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={onReset} style={{
          background: "none", border: `1px solid ${T.border}`,
          borderRadius: 6, padding: "6px 12px", color: T.muted,
          cursor: "pointer", fontSize: 13,
        }}>← New analysis</button>
        <span style={{ color: T.muted, fontSize: 13, fontFamily: "monospace", flex: 1 }}>
          example_vulnerable.py
        </span>
        <button style={{
          background: T.surface, border: `1px solid ${T.border}`,
          borderRadius: 6, padding: "6px 14px", color: T.text,
          cursor: "pointer", fontSize: 13,
        }}>↓ JSON</button>
        <button style={{
          background: T.surface, border: `1px solid ${T.border}`,
          borderRadius: 6, padding: "6px 14px", color: T.text,
          cursor: "pointer", fontSize: 13,
        }}>↓ HTML</button>
      </div>

      {/* Score + stat cards */}
      <div style={{
        display: "flex", gap: 16, marginBottom: 24,
        flexWrap: "wrap", alignItems: "center",
      }}>
        <div style={{
          background: T.surface, border: `1px solid ${T.border}`,
          borderRadius: 12, padding: "16px 24px", flex: "0 0 auto",
        }}>
          <ScoreRing score={MOCK_SCORE.score} grade={MOCK_SCORE.grade} />
        </div>
        {["critical", "high", "medium", "low"].map(s => (
          <StatCard key={s} sev={s} label={s} count={MOCK_SCORE.breakdown[s]} />
        ))}
      </div>

      {/* Search + filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search findings…"
          style={{
            flex: 1, background: T.surface, border: `1px solid ${T.border}`,
            borderRadius: 8, padding: "8px 14px", color: T.text,
            fontSize: 14, outline: "none",
          }}
        />
        {["all", "critical", "high", "medium", "low"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            background: filter === f ? T.accent : T.surface,
            border: `1px solid ${filter === f ? T.accent : T.border}`,
            borderRadius: 6, padding: "6px 12px",
            color: filter === f ? "#0d1117" : T.muted,
            cursor: "pointer", fontSize: 12,
            fontWeight: filter === f ? 700 : 400,
            textTransform: "capitalize",
          }}>{f}</button>
        ))}
      </div>

      {/* Findings list */}
      {visible.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "48px",
          color: T.muted, border: `1px dashed ${T.border}`,
          borderRadius: 12,
        }}>
          No findings match your filter.
        </div>
      ) : (
        visible.map(f => (
          <FindingRow
            key={f.id} f={f}
            expanded={expanded === f.id}
            onToggle={() => setExpanded(expanded === f.id ? null : f.id)}
          />
        ))
      )}
    </div>
  );
};

// ─── App shell ────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState("upload"); // "upload" | "loading" | "results"

  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.text, fontFamily: "system-ui, sans-serif" }}>
      {/* Nav */}
      <nav style={{
        borderBottom: `1px solid ${T.border}`,
        padding: "12px 24px",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <span style={{ fontFamily: "monospace", color: T.accent, fontWeight: 700 }}>⬡ CodeGuard</span>
        <span style={{ color: T.muted, fontSize: 13 }}>AI 3.0</span>
        <span style={{
          marginLeft: "auto", fontSize: 11,
          color: T.success, fontFamily: "monospace",
        }}>● API connected</span>
      </nav>

      {/* Loading state demo */}
      {view === "loading" && (
        <div style={{ textAlign: "center", paddingTop: 120 }}>
          <div style={{ color: T.accent, fontFamily: "monospace", marginBottom: 16 }}>
            Analyzing…
          </div>
          <div style={{ color: T.muted, fontSize: 13 }}>
            AST parse → Rule engine → Severity → AI explanation
          </div>
          <button
            onClick={() => setView("results")}
            style={{
              marginTop: 24, background: "none",
              border: `1px solid ${T.border}`, borderRadius: 6,
              padding: "8px 16px", color: T.muted,
              cursor: "pointer",
            }}
          >
            (Skip to results →)
          </button>
        </div>
      )}

      {view === "upload" && (
        <UploadScreen onAnalyze={() => { setView("loading"); setTimeout(() => setView("results"), 800); }} />
      )}
      {view === "results" && <ResultsScreen onReset={() => setView("upload")} />}
    </div>
  );
}
