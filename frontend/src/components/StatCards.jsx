/**
 * StatCards — four severity count cards.
 * Clicking a card filters the findings list (passes severity to parent).
 */
const CONFIG = {
  critical: { bg: "bg-critical-bg", border: "border-critical-border", text: "text-critical" },
  high:     { bg: "bg-high-bg",     border: "border-high-border",     text: "text-high"     },
  medium:   { bg: "bg-medium-bg",   border: "border-medium-border",   text: "text-medium"   },
  low:      { bg: "bg-low-bg",      border: "border-low-border",       text: "text-low"      },
};

function Card({ severity, count, active, onClick }) {
  const c = CONFIG[severity];
  return (
    <button
      onClick={onClick}
      className={`
        flex-1 min-w-[90px] rounded-xl border px-4 py-3 text-left
        transition-all duration-150 cursor-pointer
        ${c.bg} ${c.border}
        ${active ? "ring-2 ring-offset-2 ring-offset-bg ring-current" : "hover:brightness-110"}
      `}
    >
      <div className={`font-mono font-bold text-3xl leading-none ${c.text}`}>{count}</div>
      <div className="text-muted text-xs mt-1 capitalize">{severity}</div>
    </button>
  );
}

export default function StatCards({ breakdown, activeFilter, onFilter }) {
  return (
    <div className="flex gap-3 flex-wrap">
      {["critical", "high", "medium", "low"].map((sev) => (
        <Card
          key={sev}
          severity={sev}
          count={breakdown[sev] ?? 0}
          active={activeFilter === sev}
          onClick={() => onFilter(activeFilter === sev ? "all" : sev)}
        />
      ))}
    </div>
  );
}
