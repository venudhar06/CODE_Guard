/**
 * ResultsDashboard — composes the full results view for one AnalysisResult.
 * If multiple files were uploaded, renders a tab per file.
 */
import { useState } from "react";
import ScorePanel    from "./ScorePanel";
import StatCards     from "./StatCards";
import SearchFilter  from "./SearchFilter";
import FindingCard   from "./FindingCard";
import DownloadBar   from "./DownloadBar";

function SingleResult({ result }) {
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState("all");
  const [expanded, setExpanded] = useState(null);

  const visible = (result.findings ?? []).filter((f) => {
    const matchFilter = filter === "all" || f.severity === filter;
    const term = search.toLowerCase();
    const matchSearch =
      !term ||
      f.title.toLowerCase().includes(term) ||
      f.rule_id.toLowerCase().includes(term) ||
      f.description.toLowerCase().includes(term);
    return matchFilter && matchSearch;
  });

  return (
    <div className="space-y-4">
      {/* Score + stats row */}
      <div className="flex flex-wrap gap-3 items-start">
        {result.security_score && (
          <ScorePanel
            score={result.security_score.score}
            grade={result.security_score.grade}
          />
        )}
        {result.security_score && (
          <StatCards
            breakdown={result.security_score.breakdown}
            activeFilter={filter}
            onFilter={setFilter}
          />
        )}
      </div>

      {/* AI unavailable notice */}
      {result.status === "partial" && (
        <div className="text-xs text-medium bg-medium-bg border border-medium-border rounded-lg px-4 py-2">
          ⚠ AI service unavailable — static analysis findings are complete and accurate.
        </div>
      )}

      {/* Search + filter */}
      <SearchFilter
        search={search}
        filter={filter}
        onSearch={setSearch}
        onFilter={setFilter}
      />

      {/* Findings */}
      {visible.length === 0 ? (
        <div className="text-center py-12 text-muted border border-dashed border-border rounded-xl">
          {result.findings?.length === 0
            ? "✓ No vulnerabilities detected in this file."
            : "No findings match your search or filter."}
        </div>
      ) : (
        visible.map((f) => (
          <FindingCard
            key={f.id}
            finding={f}
            expanded={expanded === f.id}
            onToggle={() => setExpanded(expanded === f.id ? null : f.id)}
          />
        ))
      )}
    </div>
  );
}

export default function ResultsDashboard({ results, onReset }) {
  const [tab, setTab] = useState(0);
  const current = results[tab];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
      {/* Top bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={onReset}
          className="border border-border rounded-lg px-3 py-1.5 text-muted text-xs hover:border-accent/50 transition-colors"
        >
          ← New analysis
        </button>

        {/* File tabs */}
        {results.length > 1 && (
          <div className="flex gap-1 flex-wrap">
            {results.map((r, i) => (
              <button
                key={r.request_id}
                onClick={() => setTab(i)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors border ${
                  tab === i
                    ? "bg-accent/10 border-accent text-accent"
                    : "bg-surface border-border text-muted hover:border-accent/50"
                }`}
              >
                {r.filename}
              </button>
            ))}
          </div>
        )}

        {results.length === 1 && (
          <span className="text-muted text-xs font-mono flex-1 truncate">
            {current.filename}
          </span>
        )}

        <div className="ml-auto">
          <DownloadBar requestId={current.request_id} filename={current.filename} />
        </div>
      </div>

      {/* Single result panel */}
      <SingleResult key={current.request_id} result={current} />
    </div>
  );
}
