from pydantic import BaseModel, ConfigDict, Field


class Metrics(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    camera_id: str = Field(..., min_length=1)
    zone_id: str = "ZONE_1"
    people_count: int = Field(..., ge=0)
    density: float = Field(..., ge=0)
    average_speed: float = Field(..., ge=0, validation_alias="speed")
    surge_detected: bool
    bottleneck: bool
    flow_conflict: bool = False
    direction: str = "UNKNOWN"
    timestamp: str | None = None