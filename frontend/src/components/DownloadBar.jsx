/**
 * DownloadBar — report download actions.
 * Calls api.downloadReport; handles its own loading/error state.
 */
import { useState } from "react";
import { downloadReport } from "../services/api";

export default function DownloadBar({ requestId, filename }) {
  const [loading, setLoading] = useState(null); // "json" | "html" | null
  const [error,   setError]   = useState(null);

  async function handleDownload(format) {
    setError(null);
    setLoading(format);
    try {
      await downloadReport(requestId, format);
    } catch {
      setError(`Failed to download ${format.toUpperCase()} report.`);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {error && (
        <span className="text-critical text-xs">{error}</span>
      )}
      <button
        onClick={() => handleDownload("json")}
        disabled={!!loading}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border rounded-lg text-primary text-xs hover:border-accent/50 transition-colors disabled:opacity-50"
      >
        {loading === "json" ? "…" : "↓"} JSON
      </button>
      <button
        onClick={() => handleDownload("html")}
        disabled={!!loading}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border rounded-lg text-primary text-xs hover:border-accent/50 transition-colors disabled:opacity-50"
      >
        {loading === "html" ? "…" : "↓"} HTML
      </button>
    </div>
  );
}
