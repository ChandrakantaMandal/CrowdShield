latest_metrics = {}

# Tracks the last inserted risk level per zone so telemetry only writes a
# risk_event when a zone transitions between levels (avoids flooding the table).
last_risk_level = {}
