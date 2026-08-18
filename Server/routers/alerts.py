from fastapi import APIRouter, Query

from services.alert_service import create_alert
from services.risk_engine import calculate_risk
from services.recommendation_engine import get_final_recommendation
from models import Metrics
from db import insert_risk_event, insert_alert
from shared_data import gate_locations


router = APIRouter(
    prefix="/api/alerts",
    tags=["Alerts"]
)


@router.post("/create")
def create_alert_api(metrics: Metrics, zone_id: str):

    if zone_id not in gate_locations and zone_id != "ALL":
        return {
            "message": "Invalid zone_id",
            "zone_id": zone_id
        }

    risk = calculate_risk(
        metrics.model_dump()
    )

    risk["zone_id"] = zone_id

    risk_event_result = insert_risk_event(risk)

    if risk_event_result.get("status") != "saved":
        return {
            "message": "Risk calculated but failed to save risk event",
            "risk": risk,
            "database": risk_event_result
        }

    risk_event_data = risk_event_result.get("data", [])

    if not risk_event_data:
        return {
            "message": "Risk event saved but no ID returned",
            "risk": risk
        }

    risk_event_id = risk_event_data[0]["id"]

    recommendation = get_final_recommendation(
        risk["risk_level"],
        zone_id
    )

    alert = create_alert(
        risk,
        zone_id,
        recommendation
    )

    if alert is None:
        return {
            "message": "No alert required",
            "risk": risk,
            "recommendation": recommendation,
            "risk_event_id": risk_event_id
        }

    alert_db_result = insert_alert(
        alert,
        risk_event_id
    )

    return {
        "message": "Alert created",
        "alert": alert,
        "database": {
            "risk_event": risk_event_result,
            "alert": alert_db_result
        }
    }