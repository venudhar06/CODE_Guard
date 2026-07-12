/**
 * ScorePanel — renders the circular security score and letter grade.
 * Score color maps: ≥80 green, ≥60 yellow, ≥40 orange, <40 red.
 */
export default function ScorePanel({ score, grade }) {
  const color =
    score >= 80 ? "#52c41a" :
    score >= 60 ? "#fadb14" :
    score >= 40 ? "#fa8c16" : "#ff4d4f";

  return (
    <div className="flex items-center gap-5 bg-surface border border-border rounded-xl px-6 py-4">
      {/* Ring */}
      <div
        className="w-20 h-20 rounded-full flex flex-col items-center justify-center shrink-0"
        style={{ border: `4px solid ${color}` }}
      >
        <span className="font-mono font-bold text-2xl leading-none" style={{ color }}>
          {score}
        </span>
        <span className="text-muted text-[10px] mt-0.5">/ 100</span>
      </div>

      {/* Grade */}
      <div>
        <div className="font-mono font-bold text-3xl leading-none" style={{ color }}>
          Grade {grade}
        </div>
        <div className="text-muted text-xs mt-1">Security score</div>
        <div className="text-muted text-[11px] mt-0.5">
          {score >= 80 ? "Good posture" :
           score >= 60 ? "Review required" :
           score >= 40 ? "High risk" : "Critical — fix immediately"}
        </div>
      </div>
    </div>
  );
}
