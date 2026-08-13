def calculate_risk(metrics):
    score = 0
    reasons = []

    
    if metrics["density"] > 0.00005:
        score += 35
        reasons.append("High Crowd Density")

   
    if metrics["average_speed"] > 1.5:
        score += 20
        reasons.append("High Movement Speed")
   
    if metrics["surge_detected"]:
        score += 15
        reasons.append("Crowd Surge Detected")


    if metrics["bottleneck"]:
        score += 10
        reasons.append("Bottleneck Detected")

    if metrics.get("flow_conflict"):
        score += 10
        reasons.append("Flow Conflict Detected")

    if score <= 30:
        level = "SAFE"
    elif score <= 60:
        level = "WARNING"
    elif score < 80:
        level = "HIGH"
    else:
        level = "CRITICAL"

    return {
        "risk_score": score,
        "risk_level": level,
        "reasons": reasons
    }