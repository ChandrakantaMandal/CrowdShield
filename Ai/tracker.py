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
        box = boxes[0]
        x1, y1, x2, y2 = map(int, box.xyxy[0])
        center_x = (x1 + x2) // 2
        center_y = (y1 + y2) // 2
        self.current_center = (center_x, center_y)
        if self.prev_center is not None:
            dx = self.current_center[0] - self.prev_center[0]
            dy = self.current_center[1] - self.prev_center[1]
            self.average_speed = math.sqrt(dx * dx + dy * dy)
            self.average_speed = min(self.average_speed, 50)
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
        return round(self.average_speed, 2)
    def get_flow_direction(self):
        return self.flow_direction
    def detect_surge(self, people_count):
        return people_count >= 5
    def detect_bottleneck(self, boxes):

        if len(boxes) < 2:
            return False

        centers = []
        for box in boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            cx = (x1 + x2) // 2
            cy = (y1 + y2) // 2
            centers.append((cx, cy))
        distances = []
        for i in range(len(centers)):
            for j in range(i + 1, len(centers)):
                distance = np.linalg.norm(
                    np.array(centers[i]) - np.array(centers[j])
                )

                distances.append(distance)

        average_distance = np.mean(distances)
        return average_distance < 120