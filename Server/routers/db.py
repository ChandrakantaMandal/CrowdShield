from fastapi import APIRouter

from db import (
    fetch_crowd_history,
    fetch_zone_metrics,
    fetch_risk_events,
    fetch_alerts
)


router = APIRouter(
    prefix="/api/db",
    tags=["Database"]
)


@router.get("/crowd-history")
def get_crowd_history(limit: int = 50, zone_id: str | None = None):

    return fetch_crowd_history(
        limit=limit,
        zone_id=zone_id
    )


@router.get("/zones")
def get_zone_metrics():

    return fetch_zone_metrics()


@router.get("/risk-events")
def get_risk_events(limit: int = 50):

    return fetch_risk_events(
        limit=limit
    )


@router.get("/alerts")
def get_alerts(limit: int = 50):

    return fetch_alerts(
        limit=limit
    )