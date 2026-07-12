/**
 * FindingCard — one finding row. Expand to see code snippet + AI explanation.
 * Detection method badge: "⬡ AST" or "∼ REGEX".
 */
import StatusBadge from "./StatusBadge";
import AIExplanationPanel from "./AIExplanationPanel";

const BORDER_MAP = {
  critical: "border-critical-border bg-critical-bg",
  high:     "border-high-border     bg-high-bg",
  medium:   "border-medium-border   bg-medium-bg",
  low:      "border-low-border      bg-low-bg",
};

export default function FindingCard({ finding, expanded, onToggle }) {
  const { severity, rule_id, title, detection_method,
          line_number, description, code_snippet, ai_explanation } = finding;

  const expandedBorder = BORDER_MAP[severity] ?? "border-border bg-surface";

  return (
    <div
      className={`
        border rounded-xl mb-2 transition-all duration-150
        ${expanded ? expandedBorder : "border-border bg-surface"}
      `}
    >
      {/* ── Header row ── */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        <StatusBadge severity={severity} />

        <span className="font-mono text-[11px] text-accent bg-[#1c2d3f] border border-[#1f4068] rounded px-1.5 py-0.5 shrink-0">
          {rule_id}
        </span>

        <span className="flex-1 text-primary text-sm">{title}</span>

        <span className="text-muted text-xs font-mono shrink-0">
          {detection_method === "ast" ? "⬡ AST" : "∼ REGEX"}
        </span>

        {line_number != null && (
          <span className="text-muted text-xs font-mono shrink-0">
            L{line_number}
          </span>
        )}

        <span className="text-muted text-xs ml-1 shrink-0">
          {expanded ? "▲" : "▼"}
        </span>
      </button>

      {/* ── Expanded body ── */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-border/50 space-y-3 pt-3">
          {/* Description */}
          <p className="text-muted text-sm leading-relaxed">{description}</p>

          {/* Code snippet */}
          {code_snippet && (
            <pre className="bg-bg border border-border rounded-lg px-4 py-3 font-mono text-xs text-[#a5d6ff] overflow-x-auto">
              {line_number != null && (
                <span className="text-muted mr-4 select-none">L{line_number}</span>
              )}
              {code_snippet}
            </pre>
          )}

          {/* AI Explanation */}
          <AIExplanationPanel explanation={ai_explanation} />
        </div>
      )}
    </div>
  );
}
