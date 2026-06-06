from ultralytics import YOLO
import cv2
import time

# =====================================================
# LOAD MODELS
# =====================================================

MODELS = {

    "Potholes": YOLO(
        "app/models/best.pt",
        task="detect"
    ),

    "Garbage": YOLO(
        "app/models/garbage.pt",
        task="detect"
    ),

    "Water Logging": YOLO(
        "app/models/road-flood.pt",
        task="detect"
    ),

    # =================================================
    # CURRENTLY DISABLED
    # =================================================

    # "Damaged Sign Board": YOLO(
    #     "app/models/signboard.pt",
    #     task="detect"
    # )
}

# =====================================================
# MODEL-SPECIFIC CONFIDENCE THRESHOLDS
# =====================================================

MODEL_THRESHOLDS = {

    "Potholes": 0.80,

    "Garbage": 0.70,

    "Water Logging": 0.85
}

# =====================================================
# MINIMUM BOX AREA
# Helps remove tiny false detections
# =====================================================

MIN_BOX_AREA = 5000

# =====================================================
# DETECTION COOLDOWN
# =====================================================

COOLDOWN_SECONDS = 15

# =====================================================
# COLORS (BGR)
# =====================================================

COLORS = {

    "Potholes": (0, 0, 255),

    "Garbage": (0, 255, 0),

    "Water Logging": (255, 0, 0)
}

# =====================================================
# SEVERITY FUNCTION
# =====================================================

def get_severity(box_area, img_area):

    ratio = box_area / img_area

    if ratio < 0.05:

        return "low"

    elif ratio < 0.15:

        return "medium"

    else:

        return "critical"


# =====================================================
# DRAW DETECTIONS
# =====================================================

def draw_detection_box(frame, detection):

    x1 = detection["x1"]
    y1 = detection["y1"]
    x2 = detection["x2"]
    y2 = detection["y2"]

    issue_type = detection["issue_type"]

    confidence = detection["confidence"]

    severity = detection["severity"]

    color = COLORS.get(
        issue_type,
        (255, 255, 255)
    )

    label = (
        f"{issue_type} | "
        f"{confidence:.2f} | "
        f"{severity}"
    )

    # =================================================
    # DRAW RECTANGLE
    # =================================================

    cv2.rectangle(

        frame,

        (x1, y1),

        (x2, y2),

        color,

        2
    )

    # =================================================
    # LABEL SIZE
    # =================================================

    (text_width, text_height), _ = cv2.getTextSize(

        label,

        cv2.FONT_HERSHEY_SIMPLEX,

        0.6,

        2
    )

    # =================================================
    # LABEL BACKGROUND
    # =================================================

    cv2.rectangle(

        frame,

        (x1, y1 - text_height - 10),

        (x1 + text_width, y1),

        color,

        -1
    )

    # =================================================
    # LABEL TEXT
    # =================================================

    cv2.putText(

        frame,

        label,

        (x1, y1 - 5),

        cv2.FONT_HERSHEY_SIMPLEX,

        0.6,

        (0, 0, 0),

        2
    )

    return frame


# =====================================================
# PROCESS MODEL DETECTIONS
# =====================================================

def process_model_results(

    results,

    frame,

    issue_type
):

    detections = []

    # =================================================
    # NO DETECTIONS
    # =================================================

    if not results:

        return detections

    if results[0].boxes is None:

        return detections

    if len(results[0].boxes) == 0:

        return detections

    threshold = MODEL_THRESHOLDS[issue_type]

    # =================================================
    # PROCESS BOXES
    # =================================================

    for box in results[0].boxes:

        conf = float(box.conf[0])

        # =================================================
        # CONFIDENCE FILTER
        # =================================================

        if conf < threshold:

            continue

        # =================================================
        # BOX COORDINATES
        # =================================================

        x1, y1, x2, y2 = box.xyxy[0]

        x1 = int(x1)
        y1 = int(y1)
        x2 = int(x2)
        y2 = int(y2)

        # =================================================
        # BOX AREA
        # =================================================

        box_area = (x2 - x1) * (y2 - y1)

        # =================================================
        # REMOVE SMALL FALSE DETECTIONS
        # =================================================

        if box_area < MIN_BOX_AREA:

            print(
                f"❌ SMALL FALSE DETECTION REMOVED | "
                f"{issue_type}"
            )

            continue

        # =================================================
        # IMAGE AREA
        # =================================================

        h, w = frame.shape[:2]

        img_area = h * w

        # =================================================
        # SEVERITY
        # =================================================

        severity = get_severity(

            box_area,

            img_area
        )

        # =================================================
        # SAVE DETECTION
        # =================================================

        detections.append({

            "issue_type": issue_type,

            "severity": severity,

            "confidence": round(conf, 2),

            "frame": frame.copy(),

            "x1": x1,

            "y1": y1,

            "x2": x2,

            "y2": y2
        })

        print(
            f"✅ DETECTED: {issue_type} | "
            f"CONF: {conf:.2f} | "
            f"SEVERITY: {severity}"
        )

    return detections


# =====================================================
# VIDEO FRAME DETECTION
# =====================================================

def detect_issues_from_frames(frames):

    """
    Used by:
    create_report_from_cctv()

    Returns:
    {
        issue_type: (
            frame,
            severity,
            confidence
        )
    }
    """

    issues = {}

    for frame in frames:

        frame = cv2.resize(
            frame,
            (640, 640)
        )

        # =================================================
        # RUN ALL MODELS
        # =================================================

        for issue_type, model in MODELS.items():

            threshold = MODEL_THRESHOLDS[issue_type]

            results = model.predict(

                source=frame,

                conf=threshold,

                iou=0.4,

                augment=True,

                verbose=False
            )

            detections = process_model_results(

                results,

                frame,

                issue_type
            )

            # =================================================
            # PROCESS DETECTIONS
            # =================================================

            for detection in detections:

                conf = detection["confidence"]

                # =================================================
                # KEEP BEST CONFIDENCE
                # =================================================

                if (

                    issue_type not in issues

                    or

                    conf > issues[issue_type][2]
                ):

                    annotated_frame = draw_detection_box(

                        frame.copy(),

                        detection
                    )

                    issues[issue_type] = (

                        annotated_frame,

                        detection["severity"],

                        detection["confidence"]
                    )

    # =====================================================
    # NO ISSUE FOUND
    # =====================================================

    if len(issues) == 0:

        print("❌ NO CIVIC ISSUE DETECTED")

    return issues


# =====================================================
# LIVE CCTV DETECTION
# =====================================================

def detect_live_civic_issues(stream_url):

    """
    LIVE CCTV Detection

    Returns:
    [
        {
            "issue_type": str,
            "severity": str,
            "confidence": float,
            "frame": frame
        }
    ]
    """

    cap = cv2.VideoCapture(stream_url)

    if not cap.isOpened():

        raise Exception(
            "Unable to connect to CCTV stream"
        )

    # =================================================
    # COOLDOWN SYSTEM
    # =================================================

    last_detected = {}

    detected_reports = []

    print("✅ Live CCTV Detection Started")

    while True:

        ret, frame = cap.read()

        if not ret:

            print("❌ Frame read failed")

            break

        # =================================================
        # RESIZE FRAME
        # =================================================

        frame = cv2.resize(
            frame,
            (640, 640)
        )

        annotated_frame = frame.copy()

        issue_found = False

        # =================================================
        # RUN ALL MODELS
        # =================================================

        for issue_type, model in MODELS.items():

            threshold = MODEL_THRESHOLDS[issue_type]

            results = model.predict(

                source=frame,

                conf=threshold,

                iou=0.4,

                augment=True,

                verbose=False
            )

            detections = process_model_results(

                results,

                frame,

                issue_type
            )

            # =================================================
            # PROCESS DETECTIONS
            # =================================================

            for detection in detections:

                issue_found = True

                current_time = time.time()

                # =================================================
                # COOLDOWN CHECK
                # =================================================

                if issue_type in last_detected:

                    if (

                        current_time

                        -

                        last_detected[issue_type]

                        < COOLDOWN_SECONDS
                    ):

                        continue

                # =================================================
                # DRAW BOX
                # =================================================

                annotated_frame = draw_detection_box(

                    annotated_frame,

                    detection
                )

                # =================================================
                # SAVE DETECTION
                # =================================================

                detection_data = {

                    "issue_type": detection["issue_type"],

                    "severity": detection["severity"],

                    "confidence": detection["confidence"],

                    "frame": annotated_frame.copy()
                }

                detected_reports.append(
                    detection_data
                )

                # =================================================
                # UPDATE COOLDOWN
                # =================================================

                last_detected[issue_type] = current_time

                # =================================================
                # LOGS
                # =================================================

                print("\n======================")

                print(
                    f"Issue      : "
                    f"{detection['issue_type']}"
                )

                print(
                    f"Severity   : "
                    f"{detection['severity']}"
                )

                print(
                    f"Confidence : "
                    f"{detection['confidence']}"
                )

                print("======================\n")

        # =================================================
        # NO ISSUES FOUND
        # =================================================

        if not issue_found:

            cv2.putText(

                annotated_frame,

                "No Civic Issue Detected",

                (20, 40),

                cv2.FONT_HERSHEY_SIMPLEX,

                1,

                (0, 255, 0),

                2
            )

        # =================================================
        # SHOW LIVE SCREEN
        # =================================================

        cv2.imshow(

            "Live Civic Issue Detection",

            annotated_frame
        )

        # =================================================
        # EXIT ON ESC
        # =================================================

        if cv2.waitKey(1) & 0xFF == 27:

            break

    cap.release()

    cv2.destroyAllWindows()

    return detected_reports