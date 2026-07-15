from pathlib import Path
import cv2
from ultralytics import YOLO
import os
import copy

# ==========================================================
# CONFIGURATION
# ==========================================================

# Run YOLO every N seconds
DETECTION_INTERVAL = 1

# Freeze detected frame for N seconds
FREEZE_SECONDS = 2

# Confidence threshold
CONFIDENCE = 0.30

# Save detected frames
SAVE_DETECTIONS = True

# ==========================================================
# PROJECT PATHS
# ==========================================================

BASE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BASE_DIR.parent

VIDEO_PATH = PROJECT_DIR / "WhatsApp Video 2026-06-30 at 07.44.37.mp4"

OUTPUT_VIDEO = BASE_DIR / "detected_output.mp4"

MODEL_PATH = BASE_DIR / "app" / "models" / "best.pt"

DETECTION_FOLDER = BASE_DIR / "detections"

os.makedirs(DETECTION_FOLDER, exist_ok=True)

# ==========================================================
# LOAD MODEL
# ==========================================================

print("=" * 60)
print("Loading Pothole Model...")
print("=" * 60)

model = YOLO(str(MODEL_PATH))

print("✓ Model Loaded Successfully")

# ==========================================================
# OPEN VIDEO
# ==========================================================

cap = cv2.VideoCapture(str(VIDEO_PATH))

if not cap.isOpened():
    raise Exception("Unable to open video.")

width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

fps = cap.get(cv2.CAP_PROP_FPS)

if fps == 0:
    fps = 30

fps = int(round(fps))

print(f"Resolution : {width} x {height}")
print(f"FPS        : {fps}")

# ==========================================================
# ROTATE VIDEO IF PORTRAIT
# ==========================================================

rotate_video = height > width

if rotate_video:

    output_width = height
    output_height = width

    print("Portrait Video Detected")

else:

    output_width = width
    output_height = height

    print("Landscape Video Detected")

# ==========================================================
# VIDEO WRITER
# ==========================================================

OUTPUT_FPS = fps / 2      # Half speed

writer = cv2.VideoWriter(
    str(OUTPUT_VIDEO),
    cv2.VideoWriter_fourcc(*'mp4v'),
    OUTPUT_FPS,
    (output_width, output_height)
)

# ==========================================================
# GLOBAL VARIABLES
# ==========================================================

frame_number = 0

last_detections = []

freeze_frame = None

freeze_counter = 0

saved_count = 0

print("\nProcessing Video...\n")

# ==========================================================
# ROTATE FRAME
# ==========================================================

def rotate_frame(frame):
    """
    Rotate frame if the input video is portrait.
    """

    if rotate_video:
        frame = cv2.rotate(frame, cv2.ROTATE_90_CLOCKWISE)

    return frame


# ==========================================================
# RUN YOLO DETECTION
# ==========================================================

def run_detection(frame):
    """
    Run YOLO on a frame and return detections.
    """

    detections = []

    results = model.predict(
        frame,
        conf=CONFIDENCE,
        verbose=False
    )

    for result in results:

        if result.boxes is None:
            continue

        for box in result.boxes:

            x1, y1, x2, y2 = map(int, box.xyxy[0])

            confidence = float(box.conf[0])

            detections.append({
                "x1": x1,
                "y1": y1,
                "x2": x2,
                "y2": y2,
                "confidence": confidence
            })

    return detections


# ==========================================================
# DRAW DETECTIONS
# ==========================================================

def draw_detections(frame, detections):
    """
    Draw all pothole detections.
    """

    if len(detections) == 0:

        cv2.putText(
            frame,
            "No Civic Issue Detected",
            (30, 45),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 0, 255),
            3
        )

        return frame

    for detection in detections:

        x1 = detection["x1"]
        y1 = detection["y1"]
        x2 = detection["x2"]
        y2 = detection["y2"]

        confidence = detection["confidence"]

        label = f"Pothole ({confidence:.2f})"

        # Bounding Box
        cv2.rectangle(
            frame,
            (x1, y1),
            (x2, y2),
            (0, 255, 0),
            3
        )

        # Label Size
        (tw, th), _ = cv2.getTextSize(
            label,
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            2
        )

        # Label Background
        cv2.rectangle(
            frame,
            (x1, y1 - th - 12),
            (x1 + tw + 12, y1),
            (0, 255, 0),
            -1
        )

        # Label Text
        cv2.putText(
            frame,
            label,
            (x1 + 6, y1 - 7),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (0, 0, 0),
            2
        )

    return frame


# ==========================================================
# SAVE DETECTION FRAME
# ==========================================================

def save_detection_frame(frame):

    global saved_count

    if not SAVE_DETECTIONS:
        return

    saved_count += 1

    filename = DETECTION_FOLDER / f"pothole_{saved_count:03}.png"

    cv2.imwrite(
        str(filename),
        frame,
        [
            cv2.IMWRITE_PNG_COMPRESSION,
            0
        ]
    )

    print(f"✓ Detection Saved : {filename.name}")


# ==========================================================
# DRAW TIMESTAMP
# ==========================================================

def draw_timestamp(frame, frame_number):

    seconds = frame_number / fps

    text = f"Time : {seconds:.1f}s"

    cv2.putText(
        frame,
        text,
        (20, output_height - 20),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.7,
        (255, 255, 255),
        2
    )

    return frame


# ==========================================================
# FREEZE DETECTED FRAME
# ==========================================================

def freeze_detected_frame(frame):

    freeze_frames = int(FREEZE_SECONDS * fps)

    for _ in range(freeze_frames):

        writer.write(frame)

        cv2.imshow(
            "MAPMYCIVIC - Pothole Detection",
            frame
        )

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

# ==========================================================
# MAIN PROCESSING LOOP
# ==========================================================

last_detection_present = False

while True:

    ret, frame = cap.read()

    if not ret:
        break

    frame_number += 1

    # ------------------------------------------
    # Rotate if portrait
    # ------------------------------------------

    frame = rotate_frame(frame)

    # ------------------------------------------
    # Run AI once every DETECTION_INTERVAL seconds
    # ------------------------------------------

    if frame_number % (fps * DETECTION_INTERVAL) == 0:

        print(f"Running Detection @ {frame_number / fps:.1f}s")

        detections = run_detection(frame)

        last_detections = detections

        # --------------------------------------
        # New detection appeared
        # --------------------------------------

        if len(detections) > 0:

            annotated = draw_detections(
                frame.copy(),
                detections
            )

            annotated = draw_timestamp(
                annotated,
                frame_number
            )

            # Freeze only once when detection starts
            if not last_detection_present:

                print("Pothole Detected")

                save_detection_frame(annotated)

                freeze_detected_frame(annotated)

            last_detection_present = True

        else:

            last_detection_present = False

    # ------------------------------------------
    # Draw previous detections
    # ------------------------------------------

    frame = draw_detections(
        frame,
        last_detections
    )

    frame = draw_timestamp(
        frame,
        frame_number
    )

    writer.write(frame)

    cv2.imshow(
        "MAPMYCIVIC - Pothole Detection",
        frame
    )

    key = cv2.waitKey(1)

    if key == ord("q"):
        break

# ==========================================================
# CLEANUP
# ==========================================================

cap.release()

writer.release()

cv2.destroyAllWindows()

print("\n" + "=" * 60)
print("PROCESS COMPLETED")
print("=" * 60)
print(f"Output Video : {OUTPUT_VIDEO}")
print(f"Detection Images : {DETECTION_FOLDER}")
print("=" * 60)