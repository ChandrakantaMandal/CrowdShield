from fastapi import APIRouter

from shared_data import (
    latest_metrics,
    touch_zone,
    prune_stale_metrics
)

from models import Metrics

from db import (
    insert_crowd_data,
    fetch_crowd_history,
    fetch_zone_metrics
)


router = APIRouter(
    prefix="/api/crowd",
    tags=["Crowd"]
)


@router.get("/metrics")
def get_metrics():
    prune_stale_metrics()
    return latest_metrics


@router.post("/metrics")
def update_metrics(metrics: Metrics):

    data = metrics.model_dump()

    zone_id = data["zone_id"]

    latest_metrics[zone_id] = data

    touch_zone(zone_id)

    db_result = insert_crowd_data(data)

    return {
        "message": "Metrics Updated",
        "data": latest_metrics,
        "database": db_result
    }


@router.get("/history")
def crowd_history(
    limit: int = 50,
    zone_id: str | None = None
):
    return fetch_crowd_history(
        limit=limit,
        zone_id=zone_id
    )


@router.get("/zones")
def crowd_zones():
    return fetch_zone_metrics()


@router.get("/zones/live")
def crowd_zones_live():

    prune_stale_metrics()

    return list(latest_metrics.values())