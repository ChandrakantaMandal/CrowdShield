
from fastapi import APIRouter
from shared_data import latest_metrics
from models import Metrics
from db import insert_crowd_data, fetch_crowd_history

router = APIRouter(prefix="/api/crowd", tags=["Crowd"])

@router.get("/metrics")
def get_metrics():
    return latest_metrics


@router.get("/history")
def crowd_history(limit: int = 50, zone_id: str | None = None):
    return fetch_crowd_history(limit=limit, zone_id=zone_id)


@router.post("/metrics")
def update_metrics(metrics: Metrics):
    latest_metrics.update(metrics.model_dump())
    insert_crowd_data(metrics.model_dump())
    return {
        "message": "Metrics Updated",
        "data": latest_metrics
    }