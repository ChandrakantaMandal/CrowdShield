from fastapi import APIRouter

from shared_data import latest_metrics
from models import Metrics
from db import insert_crowd_data


router = APIRouter(
    prefix="/api/crowd",
    tags=["Crowd"]
)


@router.get("/metrics")
def get_metrics():
    return latest_metrics


@router.post("/metrics")
def update_metrics(metrics: Metrics):

    data = metrics.model_dump()

    latest_metrics.update(data)

    db_result = insert_crowd_data(data)

    return {
        "message": "Metrics Updated",
        "data": latest_metrics,
        "database": db_result
    }
