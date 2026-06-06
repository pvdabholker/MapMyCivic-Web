import os
import cv2
import uuid
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException

from app.models.report_model import Report
from app.utils.ai_validator import detect_issues_from_frames
from app.utils.cloudinary import upload_media


# ================= ROLE-BASED FETCH =================

def get_reports_by_role(db: Session, user):
    """
    Admin → all reports
    Parent → only their department
    """

    query = db.query(Report)

    if user.role == "admin":
        return query.order_by(Report.created_at.desc()).all()

    elif user.role == "parent":
        return query.filter(
            Report.department == user.department
        ).order_by(Report.created_at.desc()).all()

    return []


# ================= STATUS UPDATE =================

def update_report_status(db, report_id, user, status):
    """
    Parent can update status ONLY for their department
    Admin cannot update
    """

    report = db.query(Report).filter(Report.id == report_id).first()

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    if user.role == "admin":
        raise HTTPException(status_code=403, detail="Admin cannot modify reports")

    if user.role == "parent" and report.department != user.department:
        raise HTTPException(status_code=403, detail="Not your department")

    report.status = status

    db.commit()
    db.refresh(report)

    return report


# ================= FRAME EXTRACTION =================

def extract_frames(video_path):
    """
    Extract 1 frame per second (max 10 frames)
    """

    cap = cv2.VideoCapture(video_path)

    fps = int(cap.get(cv2.CAP_PROP_FPS)) or 1

    frames = []
    count = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        if count % fps == 0:
            frame = cv2.resize(frame, (640, 640))
            frames.append(frame)

        count += 1

    cap.release()

    if not frames:
        raise HTTPException(400, "No frames extracted from video")

    return frames[:10]


# ================= DEPARTMENT MAPPING =================

def map_department(issue_type):

    mapping = {
        "Potholes": "Public Works Department",
        "Garbage": "Waste Management",
        "Water Logging": "Water Management",
        "Damaged Sign Board": "Municipal Corporation"
    }

    return mapping.get(issue_type, "Municipal Corporation")

# ================= MAIN CCTV REPORT FUNCTION =================

def create_report_from_cctv(
    db: Session,
    file,
    latitude,
    longitude,
    address
):
    """
    Full pipeline:
    Video → Frames → AI → Best frame → Duplicate → Upload → Save
    """

    os.makedirs("temp", exist_ok=True)

    temp_path = f"temp/{uuid.uuid4()}.mp4"

    # ================= SAVE FILE =================
    contents = file.file.read()

    if not contents:
        raise HTTPException(400, "Empty file uploaded")

    # Optional: size limit (10MB)
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(400, "File too large")

    with open(temp_path, "wb") as f:
        f.write(contents)

    try:
        # ================= EXTRACT FRAMES =================
        frames = extract_frames(temp_path)

        # ================= AI DETECTION =================
        detected_issues = detect_issues_from_frames(frames)

        print("Detected issues:", list(detected_issues.keys()))

        if not detected_issues:
            raise HTTPException(400, "No valid issue detected")

        created_reports = []

        for issue_type, (best_frame, conf) in detected_issues.items():

            # ================= DUPLICATE CHECK =================
            duplicate = db.query(Report).filter(
                func.lower(Report.issue_type) == issue_type.lower(),
                Report.latitude.between(latitude - 0.001, latitude + 0.001),
                Report.longitude.between(longitude - 0.001, longitude + 0.001)
            ).first()

            if duplicate:
                print(f"Duplicate skipped: {issue_type}")
                continue

            frame_path = f"temp/{uuid.uuid4()}.jpg"

            try:
                # ================= SAVE FRAME =================
                cv2.imwrite(frame_path, best_frame)

                # ================= UPLOAD =================
                image_url = upload_media(frame_path)

                # ================= DEPARTMENT =================
                department = map_department(issue_type)

                # ================= SEVERITY (optional improvement) =================
                severity = "critical" if conf > 0.8 else "medium"

                # ================= SAVE DB =================
                report = Report(
                    image_url=image_url,
                    issue_type=issue_type,
                    severity=severity,
                    description=f"Detected via CCTV ({conf:.2f})",
                    latitude=latitude,
                    longitude=longitude,
                    address=address,
                    status="pending",
                    is_valid_issue="valid",
                    department=department
                    # ⚠️ Remove source if column not present
                    # source="cctv"
                )

                db.add(report)
                created_reports.append(report)

            finally:
                # ================= CLEAN FRAME =================
                if os.path.exists(frame_path):
                    os.remove(frame_path)

        # ================= FINAL COMMIT =================
        if not created_reports:
            raise HTTPException(400, "All detected issues are duplicates")

        db.commit()

        for r in created_reports:
            db.refresh(r)

        return created_reports

    finally:
        # ================= CLEAN VIDEO =================
        if os.path.exists(temp_path):
            os.remove(temp_path)