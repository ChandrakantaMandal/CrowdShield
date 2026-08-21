def calculate_risk(metrics):

    score = 0
    reasons = []

    density = metrics["density"]

    if density >= 0.00005:
        score += 50
        reasons.append("Critical Crowd Density")

    elif density >= 0.00003:
        score += 35
        reasons.append("High Crowd Density")

    elif density >= 0.000015:
        score += 20
        reasons.append("Moderate Crowd Density")

    speed = metrics["average_speed"]

    if speed >= 2.5:
        score += 20
        reasons.append("Very High Crowd Movement")

    elif speed >= 1.5:
        score += 10
        reasons.append("High Crowd Movement")

    if metrics["surge_detected"]:
        score += 15
        reasons.append("Crowd Surge Detected")

    if metrics["bottleneck"]:
        score += 15
        reasons.append("Bottleneck Detected")

    if score <= 25:
        level = "SAFE"

    elif score <= 45:
        level = "WARNING"

    elif score <= 65:
        level = "HIGH"

    else:
        level = "CRITICAL"


    return {
        "risk_score": score,
        "risk_level": level,
        "reasons": reasons
    }
