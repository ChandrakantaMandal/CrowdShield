from services.safe_gate_service import find_safe_gate

def get_recommendation(risk_level):

    if risk_level == "SAFE":
        return [
            "Situation Normal",
            "Continue Monitoring"
        ]

    elif risk_level == "WARNING":
        return [
            "Increase CCTV Monitoring",
            "Alert Nearby Security"
        ]

    elif risk_level == "HIGH":
        return [
            "Deploy Security Team",
            "Control Entry Gate",
            "Broadcast Warning"
        ]

    else:   
        return "Close Gate G3. Open Exit E2. Redirect Crowd. Call Emergency Team."



def get_final_recommendation(risk_level, current_gate):

    recommendations = get_recommendation(risk_level)

    if risk_level == "SAFE":
        return {
            "recommendations": recommendations
        }

    safe_gate = find_safe_gate(current_gate)

    if safe_gate is None:
        return {
            "recommendations": recommendations,
            "safe_gate": None,
            "message": "No safe gate available"
        }

    return {
        "recommendations": recommendations,
        "safe_gate": safe_gate["gate"],
        "risk_score": safe_gate["risk_score"],
        "risk_level": safe_gate["risk_level"],
        "distance": round(safe_gate["distance"], 2),
        "direction": safe_gate["direction"],
        "message": (
            f"Redirect crowd to {safe_gate['gate']}. "
            f"Move {safe_gate['direction']}."
        )
    }    