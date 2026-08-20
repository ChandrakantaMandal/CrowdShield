from services.safe_gate_service import find_safe_gate
from fastapi import APIRouter
from pydantic import BaseModel

from shared_data import latest_metrics
from db import (
    fetch_zone_metrics,
    fetch_risk_events,
    fetch_alerts
)

from services.assistant import ask_assistant


router = APIRouter(
    prefix="/api/assistant",
    tags=["AI Assistant"]
)


class ChatRequest(BaseModel):
    message: str


@router.post("/chat")
def chat(request: ChatRequest):

    safe_gate = find_safe_gate("GATE_A")

    context = {
    "current_metrics": latest_metrics,
    "zones": fetch_zone_metrics(),
    "recent_risk_events": fetch_risk_events(limit=5),
    "recent_alerts": fetch_alerts(limit=5),
    "safe_gate": safe_gate
    }

    answer = ask_assistant(
        request.message,
        context
    )

    return {
        "status": "ok",
        "answer": answer
    }