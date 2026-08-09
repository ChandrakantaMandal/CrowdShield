from pydantic import BaseModel, Field


class Metrics(BaseModel):
    camera_id: str = Field(..., min_length=1)
    zone_id: str = "ZONE_1"
    people_count: int = Field(..., ge=0)
    density: float = Field(..., ge=0)
    average_speed: float = Field(..., ge=0)
    surge_detected: bool
    bottleneck: bool
    direction: str = "UNKNOWN"