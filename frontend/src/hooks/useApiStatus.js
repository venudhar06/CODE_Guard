/**
 * useApiStatus — polls /health and returns live connection status.
 */
import { useState, useEffect } from "react";
import { checkHealth } from "../services/api";

export function useApiStatus() {
  const [online, setOnline] = useState(null); // null = checking

  useEffect(() => {
    let cancelled = false;

    async function check() {
      const ok = await checkHealth();
      if (!cancelled) setOnline(ok);
    }

    check();
    const id = setInterval(check, 15_000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  return online;
}
