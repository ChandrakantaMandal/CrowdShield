import { supabase } from "./supabase";

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

export async function getLatestMetrics(): Promise<LatestMetrics> {
  if (!supabase) {
    throw new Error("Supabase not configured — check EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY");
  }

  const { data, error } = await supabase
    .from("crowd_data")
    .select("camera_id, people_count, density, speed, surge_detected, bottleneck")
    .order("timestamp", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    camera_id: data.camera_id,
    people_count: data.people_count,
    density: data.density,
    average_speed: data.speed ?? 0,
    surge_detected: data.surge_detected,
    bottleneck: data.bottleneck,
  };
}

export async function getCrowdHistory(
  limit = 10,
  zoneId?: string
): Promise<CrowdHistoryRow[]> {
  if (!supabase) {
    throw new Error("Supabase not configured — check EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY");
  }

  let query = supabase
    .from("crowd_data")
    .select("camera_id, zone_id, people_count, density, speed, direction, surge_detected, bottleneck, timestamp")
    .order("timestamp", { ascending: false })
    .limit(limit);

  if (zoneId) {
    query = query.eq("zone_id", zoneId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({
    camera_id: row.camera_id,
    zone_id: row.zone_id,
    people_count: row.people_count,
    density: row.density,
    speed: row.speed,
    direction: row.direction,
    surge_detected: row.surge_detected,
    bottleneck: row.bottleneck,
    created_at: row.timestamp,
  }));
}

export async function getRiskEvents(limit = 20): Promise<RiskEvent[]> {
  if (!supabase) {
    throw new Error("Supabase not configured — check EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY");
  }

  const { data, error } = await supabase
    .from("risk_events")
    .select("*")
    .neq("risk_level", "SAFE")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as RiskEvent[];
}
