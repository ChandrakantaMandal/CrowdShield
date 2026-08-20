import os
import threading
import time
from datetime import datetime, timezone
from dotenv import load_dotenv
from supabase import create_client, Client

from shared_data import STALE_AFTER_SECONDS

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://vnvcceozlcgnwikryruu.supabase.co")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")

supabase: Client | None = None

try:
    supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
except Exception as e:
    print(f"[db] Supabase client init failed: {e}")


FLUSH_INTERVAL_SECONDS = 15
MAX_BATCH_SIZE = 500

_batch_lock = threading.Lock()
_batch_buffer: list[dict] = []
_flusher_started = False
_flusher_lock = threading.Lock()


def _build_crowd_row(metrics: dict) -> dict:
    return {
        "camera_id": metrics.get("camera_id", "CAM_01"),
        "zone_id": metrics.get("zone_id", "ZONE_1"),
        "people_count": metrics.get("people_count", 0),
        "density": metrics.get("density", 0.0),
        "speed": metrics.get("average_speed", 0.0),
        "direction": metrics.get("direction", "UNKNOWN"),
        "surge_detected": metrics.get("surge_detected", False),
        "bottleneck": metrics.get("bottleneck", False),
    }


def _flush_batch_locked() -> None:
    if supabase is None or not _batch_buffer:
        return
    rows = list(_batch_buffer)

    try:
        supabase.table("crowd_data").insert(rows).execute()
        _batch_buffer.clear()
    except Exception as e:
        print(f"[db] crowd_data batch insert failed: {e}")


def _flusher_loop() -> None:
    while True:
        time.sleep(FLUSH_INTERVAL_SECONDS)
        with _batch_lock:
            _flush_batch_locked()


def _ensure_flusher() -> None:
    global _flusher_started
    if _flusher_started:
        return
    with _flusher_lock:
        if not _flusher_started:
            t = threading.Thread(target=_flusher_loop, daemon=True)
            t.start()
            _flusher_started = True


def queue_crowd_data(metrics: dict) -> dict:
    """Queue a crowd_data row for the background batcher (no network call)."""
    row = _build_crowd_row(metrics)
    with _batch_lock:
        _batch_buffer.append(row)
        if len(_batch_buffer) >= MAX_BATCH_SIZE:
            _flush_batch_locked()
    _ensure_flusher()
    return {"status": "queued", "queued_rows": len(_batch_buffer)}


def insert_crowd_data(metrics: dict) -> dict:
    return queue_crowd_data(metrics)

_READ_CACHE_TTL = 5.0
_read_cache: dict[str, tuple[float, dict]] = {}
_read_cache_lock = threading.Lock()


def _cached(key: str, producer) -> dict:
    now = time.monotonic()
    with _read_cache_lock:
        hit = _read_cache.get(key)
        if hit and (now - hit[0]) < _READ_CACHE_TTL:
            return hit[1]
    result = producer()
    with _read_cache_lock:
        _read_cache[key] = (now, result)
    return result


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

    def load():
        query = supabase.table("crowd_data").select("*").order("timestamp", desc=True).limit(limit)
        if zone_id:
            query = query.eq("zone_id", zone_id)
        response = query.execute()
        rows = response.data or []
        for row in rows:
            if "created_at" not in row and "timestamp" in row:
                row["created_at"] = row["timestamp"]
        return {"status": "ok", "data": rows}

    try:
        return _cached(f"history:{limit}:{zone_id}", load)
    except Exception as e:
        return {"status": "error", "error": str(e), "data": []}


def _is_stale(timestamp_str: str | None) -> bool:
    if not timestamp_str:
        return True
    try:
        ts = datetime.fromisoformat(timestamp_str.replace("Z", "+00:00"))
        if ts.tzinfo is None:
            ts = ts.replace(tzinfo=timezone.utc)
        age = datetime.now(timezone.utc) - ts
        return age.total_seconds() > STALE_AFTER_SECONDS
    except ValueError:
        return True


def _zeroed_zone_row(row: dict) -> dict:
    """Return a SAFE, zeroed copy of a zone row (stale/disconnected zone)."""
    return {
        "camera_id": row.get("camera_id"),
        "zone_id": row.get("zone_id"),
        "people_count": 0,
        "density": 0.0,
        "speed": 0.0,
        "direction": "UNKNOWN",
        "surge_detected": False,
        "bottleneck": False,
        "created_at": row.get("created_at") or row.get("timestamp"),
    }


def fetch_zone_metrics() -> dict:
    """Return the latest metrics row per zone_id from crowd_data.

    Rows whose timestamp is older than STALE_AFTER_SECONDS are served as
    zeroed (SAFE) rows so the dashboard clears when a feed disconnects.
    """
    if supabase is None:
        return {"error": "Supabase not connected", "data": []}

    def load():
        query = supabase.table("crowd_data").select("*").order("timestamp", desc=True).limit(500)
        response = query.execute()
        rows = response.data or []

        latest_by_zone: dict[str, dict] = {}
        for row in rows:
            if "created_at" not in row and "timestamp" in row:
                row["created_at"] = row["timestamp"]
            zone = row.get("zone_id")
            if zone and zone not in latest_by_zone:
                latest_by_zone[zone] = row

        data = [
            _zeroed_zone_row(row) if _is_stale(row.get("created_at")) else row
            for row in latest_by_zone.values()
        ]

        return {"status": "ok", "data": data}

    try:
        return _cached("zones", load)
    except Exception as e:
        return {"status": "error", "error": str(e), "data": []}


def fetch_risk_events(limit: int = 50) -> dict:
    if supabase is None:
        return {"error": "Supabase not connected", "data": []}

    def load():
        response = (
            supabase.table("risk_events")
            .select("*")
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        return {"status": "ok", "data": response.data or []}

    try:
        return _cached(f"risk:{limit}", load)
    except Exception as e:
        return {"status": "error", "error": str(e), "data": []}
def fetch_latest_crowd_from_db() -> dict | None:
    if supabase is None:
        return None
    try:
        response = (
            supabase.table("crowd_data")
            .select("*")
            .order("timestamp", desc=True)
            .limit(1)
            .execute()
        )
        rows = response.data or []
        return rows[0] if rows else None
    except Exception as e:
        print(f"[db] fetch_latest_crowd_from_db failed: {e}")
        return None


def insert_alert(alert: dict, risk_event_id: str) -> dict:

    if supabase is None:
        return {"error": "Supabase not connected"}

    recommendation = alert.get("recommendation", {})

    recommendation_message = recommendation.get(
        "message",
        ""
    )

    main_message = alert.get(
        "message",
        "Crowd alert generated."
    )

    if recommendation_message:
        final_message = (
            f"{main_message} "
            f"{recommendation_message}"
        )
    else:
        final_message = main_message

    row = {
        "risk_event_id": risk_event_id,
        "zone_id": alert.get("zone_id", "UNKNOWN"),
        "risk_level": alert.get("risk_level", "SAFE"),
        "message": final_message,
    }

    try:
        response = (
            supabase
            .table("alerts")
            .insert(row)
            .execute()
        )

        return {
            "status": "saved",
            "data": response.data
        }

    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }
def fetch_alerts(limit: int = 50) -> dict:
    if supabase is None:
        return {
            "error": "Supabase not connected",
            "data": []
        }

    def load():
        response = (
            supabase
            .table("alerts")
            .select("*")
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )

        return {
            "status": "ok",
            "data": response.data or []
        }

    try:
        return _cached(f"alerts:{limit}", load)
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "data": []
        }    
