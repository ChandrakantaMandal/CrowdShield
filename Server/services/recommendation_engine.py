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

    else:   # CRITICAL
        return [
            "Close Gate G3",
            "Open Exit E2",
            "Redirect Crowd",
            "Call Emergency Team"
        ]