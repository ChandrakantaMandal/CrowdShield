from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from services.risk_engine import calculate_risk
from services.recommendation_engine import get_recommendation
from models import Metrics
from shared_data import latest_metrics
from routers.alerts import router as alerts_router
from routers.safe_gate import router as safe_gate_router
from routers.gate import router as gate_router
from routers.db import router as db_router


from shared_data import latest_metrics, last_risk_level
from db import (
    insert_crowd_data,
    insert_risk_event,
    fetch_crowd_history,
    fetch_risk_events,
    fetch_zone_metrics,
)

app = FastAPI(title="CrowdShield API")
app.include_router(alerts_router)
app.include_router(safe_gate_router)
app.include_router(gate_router)
app.include_router(db_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {
        "message": "CrowdShield Backend Running"
    }


def aggregate_metrics():
    zones = list(latest_metrics.values())
    if not zones:
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

@app.get("/api/crowd/metrics")
def get_metrics():
    return aggregate_metrics()

@app.get("/api/crowd/history")
def crowd_history(limit: int = 50, zone_id: str | None = None):
    return fetch_crowd_history(limit=limit, zone_id=zone_id)

@app.get("/api/crowd/zones")
def crowd_zones():
    return fetch_zone_metrics()

@app.get("/api/crowd/zones/live")
def crowd_zones_live():
    # Live in-memory per-zone rows (no Supabase dependency)
    return list(latest_metrics.values())

@app.post("/api/crowd/metrics")
def update_metrics(data: Metrics):

    global latest_metrics

    metrics_data = data.model_dump()
    zone_id = metrics_data["zone_id"]
    latest_metrics[zone_id] = metrics_data

    insert_crowd_data(metrics_data)

    risk = calculate_risk(metrics_data)
    risk["zone_id"] = zone_id

    if last_risk_level.get(zone_id) != risk["risk_level"]:
        insert_risk_event(risk)
        last_risk_level[zone_id] = risk["risk_level"]

    return {
        "message": "Metrics Updated",
        "risk": risk,
    }
@app.get("/api/risk/events")
def risk_events(limit: int = 50):
    return fetch_risk_events(limit=limit)

@app.post("/api/risk/calculate")
def risk(metrics: Metrics):

    result = calculate_risk(metrics.model_dump())
    result["zone_id"] = metrics.zone_id

    insert_risk_event(result)

    return result
@app.post("/api/recommendations")
def recommendation(metrics: Metrics):

    risk = calculate_risk(metrics.model_dump())
    risk["zone_id"] = metrics.zone_id

    insert_risk_event(risk)

    actions = get_recommendation(risk["risk_level"])

    return {
        "risk": risk,
        "recommendations": actions
    }