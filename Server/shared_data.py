latest_metrics = {}

# Tracks the last inserted risk level per zone so telemetry only writes a
# risk_event when a zone transitions between levels (avoids flooding the table).
last_risk_level = {}

# Per-gate crowd metrics consumed by the safe-gate recommendation service.
gate_metrics = {
    "GATE_A": {
        "camera_id": "CAM_A",
        "people_count": 0,
        "density": 0.0,
        "average_speed": 0.0,
        "surge_detected": False,
        "bottleneck": False
    },
    "GATE_B": {
        "camera_id": "CAM_B",
        "people_count": 0,
        "density": 0.0,
        "average_speed": 0.0,
        "surge_detected": False,
        "bottleneck": False
    },
    "GATE_C": {
        "camera_id": "CAM_C",
        "people_count": 0,
        "density": 0.0,
        "average_speed": 0.0,
        "surge_detected": False,
        "bottleneck": False
    },
    "GATE_D": {
        "camera_id": "CAM_D",
        "people_count": 0,
        "density": 0.0,
        "average_speed": 0.0,
        "surge_detected": False,
        "bottleneck": False
    }
}

gate_locations = {
    "GATE_A": {"x": 0, "y": 0},
    "GATE_B": {"x": 100, "y": 0},
    "GATE_C": {"x": 50, "y": 50},
    "GATE_D": {"x": 100, "y": 100}
}
