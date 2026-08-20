import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter
from slowapi.util import get_remote_address
from services.risk_engine import calculate_risk
from services.recommendation_engine import get_recommendation
from models import Metrics
from shared_data import latest_metrics
from routers.alerts import router as alerts_router
from routers.safe_gate import router as safe_gate_router
from routers.gate import router as gate_router
from routers.db import router as db_router
from routers.assistant import router as assistant_router
from routers.crowd import router as crowd_router


from shared_data import latest_metrics, last_risk_level, touch_zone, prune_stale_metrics
from db import (
    insert_crowd_data,
    insert_risk_event,
    insert_alert,
    fetch_crowd_history,
    fetch_risk_events,
    fetch_zone_metrics,
)
from services.alert_service import create_alert
from services.recommendation_engine import get_final_recommendation

limiter = Limiter(key_func=get_remote_address)

RISK_EVENT_MIN_INTERVAL_SECONDS = 15.0
_last_risk_event_ts: dict[str, float] = {}


def _should_persist_risk_event(zone_id: str) -> bool:
    now = time.monotonic()
    if now - _last_risk_event_ts.get(zone_id, 0.0) < RISK_EVENT_MIN_INTERVAL_SECONDS:
        return False
    _last_risk_event_ts[zone_id] = now
    return True

app = FastAPI(title="CrowdShield API")
app.state.limiter = limiter
app.include_router(alerts_router)
app.include_router(safe_gate_router)
app.include_router(gate_router)
app.include_router(db_router)
app.include_router(assistant_router)
app.include_router(crowd_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

@app.get("/")
@limiter.limit("30/minute")
def home(request: Request):
    return {
        "message": "CrowdShield Backend Running"
    }


def aggregate_metrics():
    prune_stale_metrics()
    zones = list(latest_metrics.values())
    if not zones:
        db_rows = fetch_zone_metrics().get("data", [])
        if db_rows:
            return {
                "zone_id": "ALL",
                "people_count": sum(z.get("people_count", 0) for z in db_rows),
                "density": sum(z.get("density", 0.0) for z in db_rows) / len(db_rows),
                "average_speed": sum(z.get("speed", 0.0) for z in db_rows) / len(db_rows),
                "direction": "UNKNOWN",
                "surge_detected": any(z.get("surge_detected", False) for z in db_rows),
                "bottleneck": any(z.get("bottleneck", False) for z in db_rows),
                "flow_conflict": any(z.get("flow_conflict", False) for z in db_rows),
                "timestamp": max((z.get("created_at") for z in db_rows if z.get("created_at")), default=None),
            }
        return {
            "zone_id": "ALL",
            "people_count": 0,
            "density": 0.0,
            "average_speed": 0.0,
            "direction": "UNKNOWN",
            "surge_detected": False,
            "bottleneck": False,
            "flow_conflict": False,
            "timestamp": None,
        }
    return {
        "zone_id": "ALL",
        "people_count": sum(z.get("people_count", 0) for z in zones),
        "density": sum(z.get("density", 0.0) for z in zones) / len(zones),
        "average_speed": sum(z.get("average_speed", 0.0) for z in zones) / len(zones),
        "direction": "UNKNOWN",
        "surge_detected": any(z.get("surge_detected", False) for z in zones),
        "bottleneck": any(z.get("bottleneck", False) for z in zones),
        "flow_conflict": any(z.get("flow_conflict", False) for z in zones),
        "timestamp": max((z.get("timestamp") for z in zones if z.get("timestamp")), default=None),
    }

@app.get("/status")
def status():
    agg = aggregate_metrics()
    return {
        "camera": "Connected",
        "people_count": agg["people_count"],
        "risk": calculate_risk(agg).get("risk_level", "SAFE"),
        "last_updated": agg["timestamp"],
    }


@limiter.limit("600/minute")
def update_metrics(request: Request, data: Metrics):

    global latest_metrics

    metrics_data = data.model_dump()
    zone_id = metrics_data["zone_id"]
    latest_metrics[zone_id] = metrics_data
    touch_zone(zone_id)

    insert_crowd_data(metrics_data)

    risk = calculate_risk(metrics_data)
    risk["zone_id"] = zone_id

    if last_risk_level.get(zone_id) != risk["risk_level"]:
        risk_event_id = None
        if _should_persist_risk_event(zone_id):
            risk_event_result = insert_risk_event(risk)

            if risk_event_result.get("status") == "saved":
                risk_event_data = risk_event_result.get("data", [])
                if risk_event_data:
                    risk_event_id = risk_event_data[0].get("id")

            if risk_event_id and risk["risk_level"] != "SAFE":
                recommendation = get_final_recommendation(risk["risk_level"], zone_id)
                alert = create_alert(risk, zone_id, recommendation)
                if alert:
                    insert_alert(alert, risk_event_id)

        last_risk_level[zone_id] = risk["risk_level"]

    return {
        "message": "Metrics Updated",
        "risk": risk,
    }
@app.get("/api/risk/events")
def risk_events(limit: int = 50):
    return fetch_risk_events(limit=limit)

@app.post("/api/risk/calculate")
@limiter.limit("30/minute")
def risk(request: Request, metrics: Metrics):

    result = calculate_risk(metrics.model_dump())
    result["zone_id"] = metrics.zone_id

    if last_risk_level.get(metrics.zone_id) != result["risk_level"]:
        if _should_persist_risk_event(metrics.zone_id):
            insert_risk_event(result)
        last_risk_level[metrics.zone_id] = result["risk_level"]

    return result
@app.post("/api/recommendations")
@limiter.limit("30/minute")
def recommendation(request: Request, metrics: Metrics):

    risk = calculate_risk(metrics.model_dump())
    risk["zone_id"] = metrics.zone_id

    if last_risk_level.get(metrics.zone_id) != risk["risk_level"]:
        if _should_persist_risk_event(metrics.zone_id):
            insert_risk_event(risk)
        last_risk_level[metrics.zone_id] = risk["risk_level"]

    actions = get_recommendation(risk["risk_level"])

    return {
        "risk": risk,
        "recommendations": actions
    }