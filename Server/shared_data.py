import time

latest_metrics = {}

# Tracks the last inserted risk level per zone so telemetry only writes a
# risk_event when a zone transitions between levels (avoids flooding the table).
last_risk_level = {}

# Zones whose metrics have not been updated for longer than this many seconds
# are treated as stale/disconnected and served as zeroed (SAFE) rows instead of
# their last known values. Feed sources post roughly every 1s, so 5s is safe.
STALE_AFTER_SECONDS = 5

# Monotonic timestamp of the last update received per zone.
last_seen = {}


def touch_zone(zone_id: str) -> None:
    last_seen[zone_id] = time.monotonic()


def is_zone_stale(zone_id: str, now: float | None = None) -> bool:
    now = now or time.monotonic()
    seen = last_seen.get(zone_id)
    if seen is None:
        return True
    return (now - seen) > STALE_AFTER_SECONDS


def prune_stale_metrics() -> None:
    """Drop in-memory metrics for zones that stopped reporting recently."""
    now = time.monotonic()
    for zone_id in [z for z in list(latest_metrics) if is_zone_stale(z, now)]:
        latest_metrics.pop(zone_id, None)
        last_seen.pop(zone_id, None)

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
