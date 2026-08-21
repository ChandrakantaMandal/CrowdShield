import cv2
from ultralytics import YOLO
from metrics import get_person_boxes, create_metrics
from tracker import Tracker
from heatmap import Heatmap
import time
import threading
import requests
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), "..", "Server"))

model = YOLO("models/yolov8s.pt")
cap = cv2.VideoCapture("videos/demo2.mp4")

tracker = Tracker()
last_send = time.time()
frame_count = 0
view_mode = "detection"
heatmap_frame = None
heatmap_normalized = None
hotspots = []
risk_level = "UNKNOWN"
risk_score = 0

ret, frame = cap.read()

if not ret:
    print("Failed to read video")
    cap.release()
    exit()

height, width = frame.shape[:2]
heatmap = Heatmap(width, height)

cap.set(cv2.CAP_PROP_POS_FRAMES, 0)


def send_metrics(data):
    try:
        response = requests.post(
            "http://127.0.0.1:8000/api/crowd/metrics",
            json=data,
            timeout=5
        )

        if response.status_code != 200:
            print(f"Metrics API Error: {response.status_code}")

    except requests.exceptions.RequestException as e:
        print(f"POST Error: {e}")


def calculate_risk(data):
    try:
        response = requests.post(
            "http://127.0.0.1:8000/api/risk/calculate",
            json=data,
            timeout=5
        )

        if response.status_code == 200:
            risk = response.json()

            global risk_level, risk_score

            risk_level = risk["risk_level"]
            risk_score = risk["risk_score"]

            print(
             f"Risk: {risk_level} "
                f"(Score: {risk_score})"
            )

        else:
            print(f"Risk API Error: {response.status_code}")

    except requests.exceptions.RequestException as e:
        print(f"Risk Error: {e}")


while True:

    success, frame = cap.read()

    if not success:
        break

    if view_mode == "heatmap":
        base_frame = frame.copy()
        base_frame = frame.copy()

    frame_count += 1

    results = model(
    frame,
    conf=0.20,
    imgsz=640,
    verbose=False
    )

    metrics = create_metrics(frame, results)

    people_count = metrics["people_count"]
    density = metrics["density"]

    boxes = get_person_boxes(results)

    if view_mode == "heatmap":
        heatmap.update(boxes)

    tracker.update(boxes)

    average_speed = tracker.get_average_speed()
    surge_detected = tracker.detect_surge(people_count)
    bottleneck = tracker.detect_bottleneck(boxes)

    if time.time() - last_send > 1:

        data = {
            "camera_id": "CAM_01",
            "zone_id": "ZONE_C",
            "people_count": int(people_count),
            "density": float(density),
            "average_speed": float(average_speed),
            "surge_detected": bool(surge_detected),
            "bottleneck": bool(bottleneck)
        }

        threading.Thread(
            target=send_metrics,
            args=(data,),
            daemon=True
        ).start()

        threading.Thread(
            target=calculate_risk,
            args=(data,),
            daemon=True
        ).start()

        last_send = time.time()

    if view_mode == "detection":

        for box in boxes:

            x1, y1, x2, y2 = map(int, box.xyxy[0])
            confidence = float(box.conf[0])

            if confidence < 0.20:
                continue

            cv2.rectangle(
            frame,
            (x1, y1),
            (x2, y2),
            (0, 255, 0),
            2
        )

            cv2.putText(
            frame,
            f"Person {confidence:.2f}",
            (x1, y1 - 10),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (0, 255, 0),
            2
        )

        y = 40
        gap = 40

        cv2.putText(
        frame,
        f"People Count: {people_count}",
        (20, y),
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        (0, 255, 0),
        2
    )

        y += gap

        cv2.putText(
        frame,
        f"Density: {density:.6f}",
        (20, y),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        (255, 255, 0),
        2
    )

        y += gap

        cv2.putText(
        frame,
        f"Speed: {average_speed:.2f}",
        (20, y),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        (255, 255, 255),
        2
    )

        y += gap

        cv2.putText(
        frame,
        f"Surge: {surge_detected}",
        (20, y),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        (0, 255, 255),
        2
    )

        y += gap

        cv2.putText(
        frame,
        f"Bottleneck: {bottleneck}",
        (20, y),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        (0, 255, 255),
        2
    )

    if view_mode == "heatmap" and (
    frame_count % 8 == 0 or heatmap_frame is None
):
        heatmap_frame, heatmap_normalized = heatmap.generate()
        hotspots = heatmap.get_hotspots(heatmap_normalized)

    if view_mode == "heatmap":

        heatmap_overlay = cv2.addWeighted(
        frame,
        0.35,
        heatmap_frame,
        0.65,
        0
    )

        for index, (x, y, w, h, area) in enumerate(hotspots[:3]):

            cv2.rectangle(
            heatmap_overlay,
            (x, y),
            (x + w, y + h),
            (0, 0, 255),
            3
        )

            cv2.putText(
            heatmap_overlay,
            f"HOT ZONE {index + 1}",
            (x, max(y - 10, 25)),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (0, 0, 255),
            2
        )

        overlay = heatmap_overlay.copy()

        cv2.rectangle(
        overlay,
        (15, 15),
        (390, 240),
        (15, 15, 25),
        -1
    )

        heatmap_overlay = cv2.addWeighted(
        overlay,
        0.35,
        heatmap_overlay,
        0.65,
        0
    )

        cv2.putText(
        heatmap_overlay,
        "CROWD SHIELD AI",
        (30, 48),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.9,
        (255, 255, 255),
        2
    )

        cv2.putText(
        heatmap_overlay,
        f"PEOPLE        {people_count}",
        (30, 82),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.65,
        (0, 255, 0),
        2
    )

        cv2.putText(
        heatmap_overlay,
        f"DENSITY       {density:.6f}",
        (30, 112),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.65,
        (0, 255, 255),
        2
    )

        cv2.putText(
        heatmap_overlay,
        f"SURGE         {'YES' if surge_detected else 'NO'}",
        (30, 142),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.65,
        (0, 255, 255),
        2
    )

        cv2.putText(
        heatmap_overlay,
        f"HOT ZONES     {len(hotspots[:3])}",
        (30, 172),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.65,
        (0, 0, 255),
        2
    )
        risk_color = (0, 255, 0)

        if risk_level.upper() == "WARNING":
            risk_color = (0, 255, 255)

        elif risk_level.upper() == "CRITICAL":
            risk_color = (0, 0, 255)

        cv2.putText(
            heatmap_overlay,
            f"RISK          {risk_level}",
         (30, 202),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.65,
            risk_color,
            2
        )

        legend_x = width - 330
        legend_y = height - 65

        cv2.rectangle(
        heatmap_overlay,
        (legend_x, legend_y),
        (width - 15, height - 15),
        (15, 15, 25),
        -1
    )

        cv2.putText(
        heatmap_overlay,
        "LOW",
        (legend_x + 15, legend_y + 32),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.5,
        (255, 0, 0),
        2
    )

        cv2.putText(
        heatmap_overlay,
        "MEDIUM",
        (legend_x + 80, legend_y + 32),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.5,
        (0, 255, 0),
        2
    )

        cv2.putText(
        heatmap_overlay,
        "HIGH",
        (legend_x + 175, legend_y + 32),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.5,
        (0, 255, 255),
        2
    )

        cv2.putText(
        heatmap_overlay,
        "CRITICAL",
        (legend_x + 240, legend_y + 32),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.5,
        (0, 0, 255),
        2
    )

        display_frame = heatmap_overlay

    else:
        display_frame = frame
    cv2.imshow("CrowdShield AI", display_frame)

    key = cv2.waitKey(1) & 0xFF

    if key == ord("h") or key == ord("H"):
        view_mode = "heatmap"

    elif key == ord("d") or key == ord("D"):
        view_mode = "detection"

    elif key == ord("q") or key == ord("Q"):
        break


cap.release()
cv2.destroyAllWindows()