from datetime import datetime, timezone


def create_alert(risk, zone_id, recommendation):
    """
    Create an alert from a risk result.
    Returns None for SAFE levels; WARNING, HIGH, and CRITICAL all get alerts.
    """

    if risk["risk_level"] == "SAFE":
        return None

    level_messages = {
        "WARNING": "Elevated crowd activity detected.",
        "HIGH": "High crowd density detected.",
        "CRITICAL": "Critical crowd condition detected.",
    }

    alert = {
        "zone_id": zone_id,
        "risk_level": risk["risk_level"],
        "risk_score": risk["risk_score"],
        "message": level_messages.get(risk["risk_level"], "Crowd alert generated."),
        "recommendation": recommendation,
        "created_at": datetime.now(timezone.utc).isoformat()
    }

    return alert