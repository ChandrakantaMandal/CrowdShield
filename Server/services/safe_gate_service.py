from shared_data import gate_metrics, gate_locations
from services.risk_engine import calculate_risk
import math


def calculate_distance(gate1, gate2):

    x1 = gate_locations[gate1]["x"]
    y1 = gate_locations[gate1]["y"]

    x2 = gate_locations[gate2]["x"]
    y2 = gate_locations[gate2]["y"]

    return math.sqrt(
        (x2 - x1) ** 2 +
        (y2 - y1) ** 2
    )


def calculate_direction(current_gate, safe_gate):

    x1 = gate_locations[current_gate]["x"]
    y1 = gate_locations[current_gate]["y"]

    x2 = gate_locations[safe_gate]["x"]
    y2 = gate_locations[safe_gate]["y"]

    dx = x2 - x1
    dy = y2 - y1

    if dx == 0 and dy > 0:
        return "NORTH"

    if dx == 0 and dy < 0:
        return "SOUTH"

    if dx > 0 and dy == 0:
        return "EAST"

    if dx < 0 and dy == 0:
        return "WEST"

    if dx > 0 and dy > 0:
        return "NORTH-EAST"

    if dx < 0 and dy > 0:
        return "NORTH-WEST"

    if dx > 0 and dy < 0:
        return "SOUTH-EAST"

    if dx < 0 and dy < 0:
        return "SOUTH-WEST"

    return "UNKNOWN"


def find_safe_gate(current_gate):

    if current_gate not in gate_locations:
        return None

    safe_gates = []

    for gate_id, metrics in gate_metrics.items():

        if gate_id == current_gate:
            continue

        risk = calculate_risk(metrics)

        if risk["risk_level"] == "SAFE":

            distance = calculate_distance(
                current_gate,
                gate_id
            )

            direction = calculate_direction(
                current_gate,
                gate_id
            )

            safe_gates.append({
                "gate": gate_id,
                "risk_score": risk["risk_score"],
                "risk_level": risk["risk_level"],
                "distance": distance,
                "direction": direction
            })

    if not safe_gates:
        return None

    safe_gates.sort(
        key=lambda x: (
            x["risk_score"],
            x["distance"]
        )
    )

    return safe_gates[0]