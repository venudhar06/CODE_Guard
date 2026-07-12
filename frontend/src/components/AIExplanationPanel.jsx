/**
 * AIExplanationPanel — renders AI explanation fields, or a graceful
 * fallback if AI was unavailable. AI is NEVER the source of truth.
 */
const FIELDS = [
  ["Explanation",      "explanation"],
  ["Risk",             "risk"],
  ["Attack scenario",  "attack_scenario"],
  ["Secure fix",       "secure_fix"],
  ["Best practice",    "best_practice"],
  ["OWASP",            "owasp_reference"],
  ["CWE",              "cwe_reference"],
];

export default function AIExplanationPanel({ explanation }) {
  if (!explanation) {
    return (
      <div className="border border-dashed border-border rounded-lg px-4 py-3 text-muted text-xs italic">
        AI explanation unavailable — service offline or API key not configured.
        Static analysis findings above are not affected.
      </div>
    );
  }

  return (
    <div className="bg-[#0d1f33] border border-[#1f4068] rounded-lg p-4">
      <div className="text-accent text-xs font-semibold font-mono mb-3 uppercase tracking-wider">
        ✦ AI Explanation
      </div>
      <div className="space-y-2">
        {FIELDS.map(([label, key]) => (
          <div key={key} className="flex gap-3 text-sm">
            <span className="text-muted text-xs uppercase tracking-wide min-w-[120px] pt-0.5 shrink-0">
              {label}
            </span>
            <span className="text-primary leading-relaxed">
              {explanation[key]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
