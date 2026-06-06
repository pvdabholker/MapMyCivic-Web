import uuid
import cv2
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.models.report_model import Report
from app.services.report_service import map_department
from app.utils.ai_validator import detect_live_civic_issues
from app.utils.cloudinary import upload_media


# ================= DATABASE =================
db: Session = SessionLocal()


# ================= PHONE STREAM =================
stream_url = "http://10.118.53.94:8080/video"


# ================= CCTV LOCATION =================
LATITUDE = 19.0760
LONGITUDE = 72.8777
ADDRESS = "Live CCTV Stream"


# ================= START LIVE DETECTION =================
reports = detect_live_civic_issues(stream_url)

print("\n============================")
print("🚀 STARTING DATABASE SAVE")
print("============================")
print(f"📦 Total Reports Collected: {len(reports)}")
print("============================\n")


# ================= SAVE REPORTS =================
for detection in reports:

    try:

        print("\n==============================")
        print("🚀 NEW DETECTION RECEIVED")
        print("==============================")

        issue_type = detection["issue_type"]
        severity = detection["severity"]
        confidence = detection["confidence"]
        frame = detection["frame"]

        print(f"📌 Issue Type   : {issue_type}")
        print(f"⚠ Severity     : {severity}")
        print(f"🎯 Confidence   : {confidence}")

        # ================= DUPLICATE CHECK =================
        print("\n🔍 Checking duplicate issues...")

        duplicate = db.query(Report).filter(
            Report.issue_type == issue_type,
            Report.latitude.between(
                LATITUDE - 0.001,
                LATITUDE + 0.001
            ),
            Report.longitude.between(
                LONGITUDE - 0.001,
                LONGITUDE + 0.001
            )
        ).first()

        if duplicate:

            print("\n⚠ DUPLICATE ISSUE FOUND")
            print("⏭ Skipping database save...\n")

            continue

        print("✅ No duplicate found")

        # ================= SAVE TEMP FRAME =================
        frame_path = f"temp/{uuid.uuid4()}.jpg"

        print("\n🖼 Saving frame locally...")

        cv2.imwrite(frame_path, frame)

        print(f"✅ Frame saved: {frame_path}")

        # ================= UPLOAD IMAGE =================
        print("\n☁ Uploading image to Cloudinary...")

        image_url = upload_media(frame_path)

        print("✅ Upload completed")
        print(f"🌐 Cloudinary URL: {image_url}")

        # ================= MAP DEPARTMENT =================
        department = map_department(issue_type)

        print(f"\n🏢 Department Assigned: {department}")

        # ================= CREATE REPORT =================
        print("\n📝 Creating PostgreSQL report object...")

        report = Report(
            image_url=image_url,
            issue_type=issue_type,
            severity=severity,
            description=f"Live CCTV Detection ({confidence})",
            latitude=LATITUDE,
            longitude=LONGITUDE,
            address=ADDRESS,
            status="pending",
            is_valid_issue="valid",
            department=department
        )

        print("✅ Report object created")

        # ================= SAVE DB =================
        print("\n💾 Saving to PostgreSQL...")

        db.add(report)

        print("✅ Added to session")

        db.commit()

        print("✅ Database commit successful")

        db.refresh(report)

        print("✅ Database refresh successful")

        print("\n==============================")
        print("🎉 REPORT SAVED SUCCESSFULLY")
        print("==============================")

        print(f"🆔 Report ID    : {report.id}")
        print(f"📌 Issue Type   : {report.issue_type}")
        print(f"⚠ Severity     : {report.severity}")
        print(f"🏢 Department   : {report.department}")
        print(f"📍 Address      : {report.address}")
        print(f"🕒 Status       : {report.status}")

        print("\n====================================\n")

    except Exception as e:

        print("\n❌ ERROR OCCURRED")
        print("================================")

        import traceback
        traceback.print_exc()

        print("================================\n")

print("\n✅ Live CCTV report generation completed")