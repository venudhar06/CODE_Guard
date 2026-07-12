/**
 * SearchFilter — search input + severity pill filters.
 * Fully controlled: parent owns search/filter state.
 */
const FILTERS = ["all", "critical", "high", "medium", "low"];

export default function SearchFilter({ search, filter, onSearch, onFilter }) {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <input
        type="text"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Search findings, rules…"
        className="
          flex-1 min-w-[200px] bg-surface border border-border rounded-lg
          px-4 py-2 text-primary text-sm placeholder:text-muted
          focus:outline-none focus:border-accent transition-colors
        "
      />
      <div className="flex gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => onFilter(f)}
            className={`
              px-3 py-1.5 rounded-md text-xs font-medium capitalize
              border transition-colors duration-150
              ${filter === f
                ? "bg-accent text-bg border-accent font-bold"
                : "bg-surface text-muted border-border hover:border-accent/50"}
            `}
          >
            {f}
          </button>
        ))}
      </div>
    </div>
  );
}
