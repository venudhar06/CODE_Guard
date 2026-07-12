import { useApiStatus } from "../hooks/useApiStatus";

export default function Navbar() {
  const online = useApiStatus();

  const statusColor =
    online === null ? "text-muted" :
    online          ? "text-success" : "text-critical";

  const statusLabel =
    online === null ? "Connecting…" :
    online          ? "API connected" : "API offline";

  const dot =
    online === null ? "○" :
    online          ? "●" : "●";

  return (
    <nav className="border-b border-border px-6 py-3 flex items-center gap-3">
      <span className="font-mono text-accent font-bold text-sm tracking-wide">
        ⬡ CodeGuard
      </span>
      <span className="text-muted text-xs">AI 3.0</span>

      <span className={`ml-auto font-mono text-xs ${statusColor}`}>
        {dot} {statusLabel}
      </span>
    </nav>
  );
}
