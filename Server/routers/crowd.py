
from fastapi import APIRouter
from shared_data import latest_metrics
from models import Metrics

router = APIRouter(prefix="/api/crowd", tags=["Crowd"])

@router.get("/metrics")
def get_metrics():
    return latest_metrics


@router.post("/metrics")
def update_metrics(metrics: Metrics):
    latest_metrics.update(metrics.model_dump())
    return {
        "message": "Metrics Updated",
        "data": latest_metrics
    }