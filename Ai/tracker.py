
import math
import numpy as np

class Tracker:
    def __init__(self):
        self.prev_center = None
        self.current_center = None
        self.average_speed = 0
        self.flow_direction = "UNKNOWN"
        self.surge = False
    def update(self, boxes):
        if len(boxes) == 0:
            self.flow_direction = "UNKNOWN"
            return

        box = max(
            boxes,
            key=lambda b: float(b.conf[0])
        )

        x1, y1, x2, y2 = map(
            int,
            box.xyxy[0]
        )

        center_x = (x1 + x2) // 2
        center_y = (y1 + y2) // 2

        self.current_center = (
            center_x,
            center_y
        )

        if self.prev_center is not None:

            dx = (
                self.current_center[0]
                - self.prev_center[0]
            )

            dy = (
                self.current_center[1]
                - self.prev_center[1]
            )

            self.average_speed = math.sqrt(
                dx * dx + dy * dy
            )

            self.average_speed = min(
                self.average_speed,
                50
            )

            if abs(dx) > abs(dy):

                if dx > 2:
                    self.flow_direction = "RIGHT"

                elif dx < -2:
                    self.flow_direction = "LEFT"

                else:
                    self.flow_direction = "STATIONARY"

            else:

                if dy > 2:
                    self.flow_direction = "DOWN"

                elif dy < -2:
                    self.flow_direction = "UP"

                else:
                    self.flow_direction = "STATIONARY"

        self.prev_center = self.current_center


    def get_average_speed(self):
        return round(
            self.average_speed,
            2
        )


    def get_flow_direction(self):
        return self.flow_direction



    def detect_surge(self, people_count):

        return people_count >= 30


  
    def detect_bottleneck(self, boxes):

        if len(boxes) < 5:
            return False

        centers = []

        for box in boxes:

            x1, y1, x2, y2 = map(
                int,
                box.xyxy[0]
            )

            cx = (x1 + x2) // 2
            cy = (y1 + y2) // 2

            centers.append(
                (cx, cy)
            )

        centers = np.array(
            centers,
            dtype=np.float32
        )

        diff = (
            centers[:, np.newaxis, :]
            - centers[np.newaxis, :, :]
        )

        distances = np.linalg.norm(
            diff,
            axis=2
        )

        np.fill_diagonal(
            distances,
            np.inf
        )

        proximity_threshold = 110
        nearby_count = np.sum(
            distances < proximity_threshold,
            axis=1
        )
        crowded_people = np.sum(
            nearby_count >= 2
        )
        crowded_ratio = (
            crowded_people
            / len(centers)
        )
        if crowded_ratio >= 0.30:
            return True

        return False