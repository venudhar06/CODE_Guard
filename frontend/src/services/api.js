/**
 * api.js — single source of truth for all backend communication.
 * Components never call fetch/axios directly.
 */
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 60_000, // AI calls can be slow
});

/**
 * Upload Python files for analysis.
 * @param {File[]} files
 * @returns {Promise<AnalysisResult[]>}
 */
export async function analyzeFiles(files) {
  const form = new FormData();
  files.forEach((f) => form.append("files", f));
  const { data } = await client.post("/analyze", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

/**
 * Download report for a given request_id.
 * @param {string} requestId
 * @param {"json"|"html"} format
 */
export async function downloadReport(requestId, format = "json") {
  const response = await client.get(`/report/${requestId}`, {
    params: { format },
    responseType: "blob",
  });
  const ext  = format === "html" ? "html" : "json";
  const url  = URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href  = url;
  link.download = `codeguard-report-${requestId.slice(0, 8)}.${ext}`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Health check — used to show API status in nav.
 * Returns true if backend is reachable.
 * @returns {Promise<boolean>}
 */
export async function checkHealth() {
  try {
    await axios.get("http://localhost:8000/api/health", { timeout: 3000 });
    return true;
  } catch {
    return false;
  }
}
