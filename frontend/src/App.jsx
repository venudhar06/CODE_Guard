/**
 * App.jsx — root component.
 * Owns view state machine: "upload" | "loading" | "results".
 * No routing library needed for MVP (single-page, state-based nav).
 */
import Navbar           from "./components/Navbar";
import UploadZone       from "./components/UploadZone";
import LoadingScreen    from "./components/LoadingScreen";
import ResultsDashboard from "./components/ResultsDashboard";
import { useAnalysis }  from "./hooks/useAnalysis";

export default function App() {
  const { view, results, error, analyze, reset } = useAnalysis();

  return (
    <div className="min-h-screen bg-bg text-primary">
      <Navbar />

      {view === "upload"  && <UploadZone onAnalyze={analyze} error={error} />}
      {view === "loading" && <LoadingScreen />}
      {view === "results" && (
        <ResultsDashboard results={results} onReset={reset} />
      )}
    </div>
  );
}
