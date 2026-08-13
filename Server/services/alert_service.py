from datetime import datetime


def create_alert(risk, zone_id, recommendation):
    """
    Create an alert from a risk result.

    This is currently an in-memory alert.
    Later it can be stored in Supabase.
    """

    if risk["risk_level"] != "CRITICAL":
        return None

    alert = {
        "zone_id": zone_id,
        "risk_level": risk["risk_level"],
        "risk_score": risk["risk_score"],
        "message": "Critical crowd condition detected.",
        "recommendation": recommendation,
        "created_at": datetime.utcnow().isoformat()
    }

    return alert