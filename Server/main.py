from fastapi import FastAPI
from services.risk_engine import calculate_risk
from services.recommendation_engine import get_recommendation
from models import Metrics
from shared_data import latest_metrics
from db import insert_crowd_data, insert_risk_event

app = FastAPI(title="CrowdShield API")
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

    insert_crowd_data(latest_metrics)

    return {
        "message": "Metrics Updated"
    }
@app.post("/api/risk/calculate")
def risk(metrics: Metrics):

    result = calculate_risk(metrics.model_dump())

    insert_risk_event(result)

    return result
@app.post("/api/recommendations")
def recommendation(metrics: Metrics):

    risk = calculate_risk(metrics.model_dump())

    insert_risk_event(risk)

    actions = get_recommendation(risk["risk_level"])

    return {
        "risk": risk,
        "recommendations": actions
    }