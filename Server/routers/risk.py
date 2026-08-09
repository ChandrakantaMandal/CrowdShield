from fastapi import APIRouter
from models import Metrics
from services.risk_engine import calculate_risk
from services.recommendation_engine import get_recommendation

router = APIRouter(prefix="/api", tags=["Risk"])

@router.post("/risk/calculate")
def risk(metrics: Metrics):
    return calculate_risk(metrics.model_dump())


@router.post("/recommendations")
def recommendation(metrics: Metrics):

    risk = calculate_risk(metrics.model_dump())

    return {
        "risk": risk,
        "recommendations": get_recommendation(
            risk["risk_level"]
        )
    }