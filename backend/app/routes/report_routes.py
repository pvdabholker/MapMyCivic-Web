from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.dependencies.auth_dependency import get_current_authority
from app.dependencies.role_dependency import require_authority
from app.services.report_service import get_reports_by_role
from typing import Literal
from app.services.report_service import update_report_status

from app.services.report_service import create_report_from_cctv

router = APIRouter()


@router.get("/")
def get_reports(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_authority)
):
    """
    Get reports based on role

    Admin → all reports
    Parent → department only
    """

    current_user = require_authority(current_user)

    reports = get_reports_by_role(db, current_user)

    return reports

@router.patch("/{report_id}")
def update_status(
    report_id: str,
    status: Literal["pending", "in_progress", "resolved"],
    db: Session = Depends(get_db),
    current_user = Depends(get_current_authority)
):
    """
    Parent updates report status
    Admin is blocked
    """

    return update_report_status(db, report_id, current_user, status)

@router.post("/cctv")
def create_cctv_report(
    file: UploadFile = File(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    address: str = Form(...),
    db: Session = Depends(get_db)
):
    """
    CCTV report creation
    """

    return create_report_from_cctv(
        db,
        file,
        latitude,
        longitude,
        address
    )