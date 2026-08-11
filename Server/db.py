import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://vnvcceozlcgnwikryruu.supabase.co")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")

supabase: Client | None = None

try:
    supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
except Exception as e:
    print(f"[db] Supabase client init failed: {e}")


def insert_crowd_data(metrics: dict) -> dict:
    if supabase is None:
        return {"error": "Supabase not connected"}

    row = {
        "camera_id": metrics.get("camera_id", "CAM_01"),
        "zone_id": metrics.get("zone_id", "ZONE_1"),
        "people_count": metrics.get("people_count", 0),
        "density": metrics.get("density", 0.0),
        "speed": metrics.get("average_speed", 0.0),
        "direction": metrics.get("direction", "UNKNOWN"),
        "surge_detected": metrics.get("surge_detected", False),
        "bottleneck": metrics.get("bottleneck", False),
    }

    try:
        response = supabase.table("crowd_data").insert(row).execute()
        return {"status": "saved", "data": response.data}
    except Exception as e:
        return {"status": "error", "error": str(e)}


def insert_risk_event(risk: dict) -> dict:
    if supabase is None:
        return {"error": "Supabase not connected"}

    reasons = risk.get("reasons", [])
    reason_text = ", ".join(reasons) if isinstance(reasons, list) else str(reasons)

    row = {
        "zone_id": risk.get("zone_id", "ZONE_1"),
        "risk_score": risk.get("risk_score", 0),
        "risk_level": risk.get("risk_level", "SAFE"),
        "reason": reason_text,
    }

    try:
        response = supabase.table("risk_events").insert(row).execute()
        return {"status": "saved", "data": response.data}
    except Exception as e:
        return {"status": "error", "error": str(e)}


def fetch_crowd_history(limit: int = 50, zone_id: str | None = None) -> dict:
    if supabase is None:
        return {"error": "Supabase not connected", "data": []}

    try:
        query = supabase.table("crowd_data").select("*").order("timestamp", desc=True).limit(limit)
        if zone_id:
            query = query.eq("zone_id", zone_id)
        response = query.execute()
        rows = response.data or []
        for row in rows:
            if "created_at" not in row and "timestamp" in row:
                row["created_at"] = row["timestamp"]
        return {"status": "ok", "data": rows}
    except Exception as e:
        return {"status": "error", "error": str(e), "data": []}


def fetch_zone_metrics() -> dict:
    """Return the latest metrics row per zone_id from crowd_data."""
    if supabase is None:
        return {"error": "Supabase not connected", "data": []}

    try:
        query = supabase.table("crowd_data").select("*").order("timestamp", desc=True)
        response = query.execute()
        rows = response.data or []

        latest_by_zone: dict[str, dict] = {}
        for row in rows:
            if "created_at" not in row and "timestamp" in row:
                row["created_at"] = row["timestamp"]
            zone = row.get("zone_id")
            if zone and zone not in latest_by_zone:
                latest_by_zone[zone] = row

        return {"status": "ok", "data": list(latest_by_zone.values())}
    except Exception as e:
        return {"status": "error", "error": str(e), "data": []}


def fetch_risk_events(limit: int = 50) -> dict:
    if supabase is None:
        return {"error": "Supabase not connected", "data": []}

    try:
        response = (
            supabase.table("risk_events")
            .select("*")
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        return {"status": "ok", "data": response.data or []}
    except Exception as e:
        return {"status": "error", "error": str(e), "data": []}
