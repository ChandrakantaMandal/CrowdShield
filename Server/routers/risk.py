from fastapi import APIRouter, Request

from models import Metrics

from services.risk_engine import calculate_risk
from services.recommendation_engine import get_recommendation

from db import (
    insert_risk_event,
    fetch_risk_events
)

from shared_data import last_risk_level
from main import _should_persist_risk_event


router = APIRouter(
    prefix="/api",
    tags=["Risk"]
)


@router.get("/risk/events")
def risk_events(limit: int = 50):
    return fetch_risk_events(limit=limit)


@router.post("/risk/calculate")
def risk(metrics: Metrics):

    result = calculate_risk(
        metrics.model_dump()
    )

    result["zone_id"] = metrics.zone_id

    if last_risk_level.get(metrics.zone_id) != result["risk_level"]:

        if _should_persist_risk_event(metrics.zone_id):
            insert_risk_event(result)

        last_risk_level[metrics.zone_id] = result["risk_level"]

    return result


@router.post("/recommendations")
def recommendation(metrics: Metrics):

    risk = calculate_risk(
        metrics.model_dump()
    )

    risk["zone_id"] = metrics.zone_id

    if last_risk_level.get(metrics.zone_id) != risk["risk_level"]:

        if _should_persist_risk_event(metrics.zone_id):
            insert_risk_event(risk)

        last_risk_level[metrics.zone_id] = risk["risk_level"]

    return {
        "risk": risk,
        "recommendations": get_recommendation(
            risk["risk_level"]
        )
    }