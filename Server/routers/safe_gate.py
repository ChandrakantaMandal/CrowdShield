from fastapi import APIRouter
from services.safe_gate_service import find_safe_gate


router = APIRouter(
    prefix="/api/safe-gate",
    tags=["Safe Gate"]
)


@router.get("/{current_gate}")
def get_safe_gate(current_gate: str):

    safe_gate = find_safe_gate(current_gate)

    if safe_gate is None:
        return {
            "message": "No safe gate available",
            "current_gate": current_gate
        }

    return {
        "current_gate": current_gate,
        "safe_gate": safe_gate["gate"],
        "risk_score": safe_gate["risk_score"],
        "risk_level": safe_gate["risk_level"],
        "distance": round(safe_gate["distance"], 2),
        "direction": safe_gate["direction"],
        "message": (
            f"Move {safe_gate['direction']} "
            f"towards {safe_gate['gate']}"
        )
    }