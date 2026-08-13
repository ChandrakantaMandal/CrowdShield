from fastapi import APIRouter
from models import Metrics
from shared_data import gate_metrics


router = APIRouter(
    prefix="/api/gates",
    tags=["Gates"]
)


@router.post("/{gate_id}/metrics")
def update_gate_metrics(gate_id: str, data: Metrics):

    if gate_id not in gate_metrics:
        return {
            "message": "Gate not found",
            "gate_id": gate_id
        }

    gate_metrics[gate_id] = data.model_dump()

    return {
        "message": "Gate metrics updated",
        "gate_id": gate_id,
        "metrics": gate_metrics[gate_id]
    }