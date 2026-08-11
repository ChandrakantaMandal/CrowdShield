const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("EXPO_PUBLIC_API_URL is not configured");
}

export interface LatestMetrics {
  camera_id: string;
  people_count: number;
  density: number;
  average_speed: number;
  surge_detected: boolean;
  bottleneck: boolean;
}

export interface CrowdHistoryRow {
  camera_id: string;
  zone_id?: string | null;
  people_count: number;
  density: number;
  speed?: number | null;
  direction?: string | null;
  surge_detected?: boolean | null;
  bottleneck?: boolean | null;
  created_at: string;
}

export interface RiskEvent {
  zone_id: string;
  risk_score: number;
  risk_level: string;
  reason: string;
  created_at: string;
}

interface ListResponse<T> {
  status: "ok" | "error";
  data?: T[];
  error?: string;
}

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getLatestMetrics(): Promise<LatestMetrics> {
  return request<LatestMetrics>("/api/crowd/metrics");
}

export async function getCrowdHistory(
  limit = 10,
  zoneId?: string
): Promise<CrowdHistoryRow[]> {
  const query = new URLSearchParams({ limit: String(limit) });
  if (zoneId) {
    query.set("zone_id", zoneId);
  }

  const body = await request<ListResponse<CrowdHistoryRow>>(
    `/api/crowd/history?${query.toString()}`
  );

  if (body.status !== "ok" || !body.data) {
    throw new Error(body.error ?? "Failed to fetch crowd history");
  }

  return body.data;
}

export async function getRiskEvents(limit = 20): Promise<RiskEvent[]> {
  const query = new URLSearchParams({ limit: String(limit) });

  const body = await request<ListResponse<RiskEvent>>(
    `/api/risk/events?${query.toString()}`
  );

  if (body.status !== "ok" || !body.data) {
    throw new Error(body.error ?? "Failed to fetch risk events");
  }

  return body.data;
}
