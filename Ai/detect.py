import cv2
from ultralytics import YOLO
from metrics import get_person_boxes, create_metrics
from tracker import Tracker
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

            print(
                f"Risk: {risk['risk_level']} "
                f"(Score: {risk['risk_score']})"
            )

        else:
            print(f"Risk API Error: {response.status_code}")

    except requests.exceptions.RequestException as e:
        print(f"Risk Error: {e}")

while True:

    success, frame = cap.read()

    if not success:
        break

    results = model(frame, conf=0.40, verbose=False)

    metrics = create_metrics(frame, results)

    people_count = metrics["people_count"]
    density = metrics["density"]

    boxes = get_person_boxes(results)

    tracker.update(boxes)

    average_speed = tracker.get_average_speed()
    surge_detected = tracker.detect_surge(people_count)
    bottleneck = tracker.detect_bottleneck(boxes)

    if time.time() - last_send > 1:

        data = {
            "camera_id": "CAM_01",
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
   
    for box in boxes:

        x1, y1, x2, y2 = map(int, box.xyxy[0])
        confidence = float(box.conf[0])

        if confidence < 0.65:
            continue

        width = x2 - x1
        height = y2 - y1

        if width < 80 or height < 120:
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

 
    cv2.imshow("CrowdShield AI", frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()        