from pydantic import BaseModel

class Metrics(BaseModel):
    camera_id: str
    people_count: int
    density: float
    average_speed: float
    surge_detected: bool
    bottleneck: bool