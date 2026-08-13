from fastapi import FastAPI
from services.risk_engine import calculate_risk
from services.recommendation_engine import get_recommendation
from models import Metrics
from shared_data import latest_metrics
from routers.alerts import router as alerts_router
from routers.safe_gate import router as safe_gate_router
from routers.gate import router as gate_router
from routers.db import router as db_router


app = FastAPI(title="CrowdShield API")
app.include_router(alerts_router)
app.include_router(safe_gate_router)
app.include_router(gate_router)
app.include_router(db_router)

@app.get("/")
def home():
    return {
        "message": "CrowdShield Backend Running"
    }


@app.get("/status")
def status():
    return {
        "camera": "Connected",
        "people_count": 0,
        "risk": "SAFE"
    }

@app.get("/api/crowd/metrics")
def get_metrics():
    return latest_metrics
@app.post("/api/crowd/metrics")
def update_metrics(data: Metrics):

    global latest_metrics

    latest_metrics = data.model_dump()

    return {
        "message": "Metrics Updated"
    }
@app.post("/api/risk/calculate")
def risk(metrics: Metrics):

    result = calculate_risk(metrics.model_dump())

    return result
@app.post("/api/recommendations")
def recommendation(metrics: Metrics):

    risk = calculate_risk(metrics.model_dump())

    actions = get_recommendation(risk["risk_level"])

    return {
        "risk": risk,
        "recommendations": actions
    }