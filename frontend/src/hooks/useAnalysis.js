/**
 * useAnalysis — encapsulates the upload → analyze state machine.
 * Keeps all async logic out of components.
 */
import { useState, useCallback } from "react";
import { analyzeFiles } from "../services/api";

export function useAnalysis() {
  const [view, setView]       = useState("upload"); // "upload" | "loading" | "results"
  const [results, setResults] = useState([]);        // AnalysisResult[]
  const [error, setError]     = useState(null);

  const analyze = useCallback(async (files) => {
    setError(null);
    setView("loading");
    try {
      const data = await analyzeFiles(files);
      setResults(data);
      setView("results");
    } catch (err) {
      const msg =
        err.response?.data?.detail ??
        err.message ??
        "Analysis failed. Is the backend running?";
      setError(msg);
      setView("upload");
    }
  }, []);

  const reset = useCallback(() => {
    setView("upload");
    setResults([]);
    setError(null);
  }, []);

  return { view, results, error, analyze, reset };
}
