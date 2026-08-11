from fastapi import APIRouter
from models import Metrics
from services.risk_engine import calculate_risk
from services.recommendation_engine import get_recommendation
from db import insert_risk_event, fetch_risk_events

router = APIRouter(prefix="/api", tags=["Risk"])

@router.get("/risk/events")
def risk_events(limit: int = 50):
    return fetch_risk_events(limit=limit)


@router.post("/risk/calculate")
def risk(metrics: Metrics):
    result = calculate_risk(metrics.model_dump())
    insert_risk_event(result)
    return result


@router.post("/recommendations")
def recommendation(metrics: Metrics):

    risk = calculate_risk(metrics.model_dump())

    insert_risk_event(risk)

    return {
        "risk": risk,
        "recommendations": get_recommendation(
            risk["risk_level"]
        )
    }