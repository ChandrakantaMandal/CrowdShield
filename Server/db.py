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
        "zone_id": "ZONE_1",
        "risk_score": risk.get("risk_score", 0),
        "risk_level": risk.get("risk_level", "SAFE"),
        "reason": reason_text,
    }

    try:
        response = supabase.table("risk_events").insert(row).execute()
        return {"status": "saved", "data": response.data}
    except Exception as e:
        return {"status": "error", "error": str(e)}
