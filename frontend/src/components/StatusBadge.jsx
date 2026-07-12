/**
 * StatusBadge — severity pill. One responsibility: render a coloured label.
 */
const CONFIG = {
  critical: "bg-critical-bg text-critical border-critical-border",
  high:     "bg-high-bg     text-high     border-high-border",
  medium:   "bg-medium-bg   text-medium   border-medium-border",
  low:      "bg-low-bg      text-low       border-low-border",
};

export default function StatusBadge({ severity }) {
  return (
    <span
      className={`
        inline-block border rounded px-2 py-0.5
        font-mono text-[11px] font-semibold uppercase tracking-wider
        ${CONFIG[severity] ?? "bg-surface text-muted border-border"}
      `}
    >
      {severity}
    </span>
  );
}
