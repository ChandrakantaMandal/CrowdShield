
import cv2
import numpy as np


class Heatmap:

    def __init__(self, width, height):
        self.width = width
        self.height = height

        self.heat = np.zeros(
            (height, width),
            dtype=np.float32
        )

    def update(self, boxes):

        current = np.zeros_like(self.heat)

        for box in boxes:

            x1, y1, x2, y2 = map(
                int,
                box.xyxy[0]
            )

            cx = (x1 + x2) // 2
            cy = (y1 + y2) // 2

            if not (
                0 <= cx < self.width
                and 0 <= cy < self.height
            ):
                continue

            person_width = max(
                x2 - x1,
                30
            )

            person_height = max(
                y2 - y1,
                50
            )

            # KEEP LARGE HEAT SPREAD
            radius_x = max(
                int(person_width * 1.5),
                35
            )

            radius_y = max(
                int(person_height * 0.6),
                35
            )

            cv2.ellipse(
                current,
                (cx, cy),
                (radius_x, radius_y),
                0,
                0,
                360,
                1.0,
                -1
            )

        current = cv2.GaussianBlur(
            current,
            (0, 0),
            sigmaX=20,
            sigmaY=20
        )

        self.heat = (
            self.heat * 0.82
            + current * 0.18
        )

    def generate(self):

        normalized = cv2.normalize(
            self.heat,
            None,
            0,
            255,
            cv2.NORM_MINMAX
        ).astype(np.uint8)

        normalized = cv2.GaussianBlur(
            normalized,
            (0, 0),
            sigmaX=12,
            sigmaY=12
        )

       

        base = np.zeros(
            (self.height, self.width, 3),
            dtype=np.uint8
        )

        base[:, :, 0] = 90    # Blue
        base[:, :, 1] = 35    # Green
        base[:, :, 2] = 0     # Red


        heat_color = cv2.applyColorMap(
            normalized,
            cv2.COLORMAP_JET
        )

        alpha = normalized.astype(
            np.float32
        ) / 255.0

        alpha = np.power(
            alpha,
            0.75
        )

        alpha = alpha[:, :, None]

        output = (
            base.astype(np.float32) * (1 - alpha)
            +
            heat_color.astype(np.float32) * alpha
        )

        output = np.clip(
            output,
            0,
            255
        ).astype(np.uint8)

        return output, normalized

    def get_hotspots(self, normalized):

      threshold = 180

      mask = cv2.threshold(
        normalized,
        threshold,
        255,
        cv2.THRESH_BINARY
    )[1]

    # Remove small noise
      kernel = np.ones(
        (9, 9),
        np.uint8
    )

      mask = cv2.morphologyEx(
        mask,
        cv2.MORPH_OPEN,
        kernel
    )

      mask = cv2.erode(
    mask,
    np.ones((21, 21), np.uint8),
    iterations=1
)

      mask = cv2.dilate(
    mask,
    np.ones((11, 11), np.uint8),
    iterations=1
)

      contours, _ = cv2.findContours(
        mask,
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE
    )

      hotspots = []

      frame_area = self.width * self.height

      min_area = frame_area * 0.005

      for contour in contours:

          area = cv2.contourArea(contour)

          if area < min_area:
             continue

          x, y, w, h = cv2.boundingRect(
            contour
          )

          roi = normalized[
            y:y + h,
            x:x + w
          ]

          if roi.size == 0:
              continue

          mean_heat = float(
            np.mean(roi)
        )

          max_heat = float(
            np.max(roi)
        )

          if max_heat < 170:
            continue

          score = (
            area *
            mean_heat *
            (max_heat / 255.0)
        )

          hotspots.append(
            (
                x,
                y,
                w,
                h,
                score
            )
        )

      hotspots.sort(
        key=lambda item: item[4],
        reverse=True
    )

      return hotspots[:3]
