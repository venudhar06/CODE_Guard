/**
 * LoadingScreen — shown while backend analysis is in progress.
 * Shows pipeline stages so users understand what's happening.
 */
import { useState, useEffect } from "react";

const STAGES = [
  "Parsing AST…",
  "Running regex scanner…",
  "Applying rule engine…",
  "Calculating severity…",
  "Generating AI explanations…",
  "Building report…",
];

export default function LoadingScreen() {
  const [stageIdx, setStageIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStageIdx((i) => Math.min(i + 1, STAGES.length - 1));
    }, 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      {/* Spinner */}
      <div className="w-14 h-14 rounded-full border-4 border-surface border-t-accent animate-spin" />

      <div className="text-center">
        <div className="font-mono text-accent text-sm mb-2">
          {STAGES[stageIdx]}
        </div>
        <div className="text-muted text-xs">
          AST → Regex → Rules → Severity → AI
        </div>
      </div>

      {/* Stage dots */}
      <div className="flex gap-2">
        {STAGES.map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
              i <= stageIdx ? "bg-accent" : "bg-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
