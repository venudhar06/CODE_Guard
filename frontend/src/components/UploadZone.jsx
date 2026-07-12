/**
 * UploadZone — drag-and-drop + click-to-browse file picker.
 * Validates: .py only, max 1 MB each, max 5 files.
 */
import { useState, useRef } from "react";

const MAX_SIZE  = 1_000_000; // 1 MB
const MAX_FILES = 5;

export default function UploadZone({ onAnalyze, error }) {
  const [dragging, setDragging]   = useState(false);
  const [files, setFiles]         = useState([]);
  const [localError, setLocalError] = useState(null);
  const inputRef = useRef(null);

  function validate(incoming) {
    if (incoming.length > MAX_FILES)
      return `Max ${MAX_FILES} files per request.`;
    for (const f of incoming) {
      if (!f.name.endsWith(".py"))
        return `"${f.name}" is not a .py file.`;
      if (f.size > MAX_SIZE)
        return `"${f.name}" exceeds 1 MB limit.`;
    }
    return null;
  }

  function handleFiles(incoming) {
    const list = Array.from(incoming);
    const err  = validate(list);
    if (err) { setLocalError(err); return; }
    setLocalError(null);
    setFiles(list);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  function handleSubmit() {
    if (!files.length) { setLocalError("Select at least one .py file."); return; }
    onAnalyze(files);
  }

  const displayError = localError ?? error;

  return (
    <div className="max-w-xl mx-auto mt-20 px-4 text-center">
      {/* Heading */}
      <p className="font-mono text-accent text-xs tracking-[0.2em] uppercase mb-3">
        CodeGuard AI 3.0
      </p>
      <h1 className="text-3xl font-bold text-primary leading-tight mb-3">
        Secure code review,<br />powered by static analysis.
      </h1>
      <p className="text-muted text-sm leading-relaxed mb-10">
        Upload Python files. Get findings, severity scores,
        and AI-assisted explanations in seconds.
      </p>

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-xl px-8 py-12 cursor-pointer mb-4
          transition-all duration-150 select-none
          ${dragging
            ? "border-accent bg-[#0d1f33]"
            : files.length
              ? "border-success bg-[#0d2010]"
              : "border-border bg-surface hover:border-accent/50"
          }
        `}
      >
        <div className="text-3xl mb-3">{files.length ? "✓" : "⬡"}</div>
        <div className="text-primary text-sm mb-1">
          {files.length
            ? `${files.length} file${files.length > 1 ? "s" : ""} selected`
            : "Drop Python files here"}
        </div>
        <div className="text-muted text-xs">
          {files.length
            ? files.map((f) => f.name).join(", ")
            : "or click to browse · .py only · max 1 MB · up to 5 files"}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".py"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Error */}
      {displayError && (
        <div className="mb-4 text-critical text-sm bg-critical-bg border border-critical-border rounded-lg px-4 py-2">
          {displayError}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-center">
        {files.length > 0 && (
          <button
            onClick={() => { setFiles([]); setLocalError(null); }}
            className="px-5 py-2.5 rounded-lg border border-border text-muted text-sm hover:border-accent/50 transition-colors"
          >
            Clear
          </button>
        )}
        <button
          onClick={handleSubmit}
          className="px-8 py-2.5 rounded-lg bg-accent text-bg font-bold text-sm hover:bg-accent/90 transition-colors"
        >
          Analyze →
        </button>
      </div>
    </div>
  );
}
