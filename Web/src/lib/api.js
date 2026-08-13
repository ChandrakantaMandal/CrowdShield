const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(path, options) {
  const response = await fetch(`${API_BASE_URL}${path}`, options);

  if (!response.ok) {
    throw new Error(`API ${response.status}: ${path}`);
  }

  return response.json();
}

export async function fetchCrowdMetrics() {
  return request("/api/crowd/metrics");
}

export async function fetchRiskEvents(limit = 50) {
  const data = await request(`/api/risk/events?limit=${limit}`);
  return Array.isArray(data) ? data : data?.data || [];
}

export async function fetchCrowdHistory(limit = 50, zoneId) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (zoneId) params.set("zone_id", zoneId);
  const data = await request(`/api/crowd/history?${params.toString()}`);
  return Array.isArray(data) ? data : data?.data || [];
}

export async function fetchZoneMetrics() {
  const data = await request("/api/crowd/zones");
  return Array.isArray(data) ? data : data?.data || [];
}

export function riskLevelFromScore(score) {
  if (score <= 30) return "SAFE";
  if (score <= 60) return "WARNING";
  if (score <= 80) return "HIGH";
  return "CRITICAL";
}

export function formatTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
