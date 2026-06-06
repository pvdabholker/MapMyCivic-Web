from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.notice_schema import NoticeCreate
from app.services.notice_service import (
    create_notice,
    get_all_notices,
    delete_notice
)

router = APIRouter()


# CREATE
@router.post("/")
def create(data: NoticeCreate, db: Session = Depends(get_db)):
    return create_notice(db, data)


# GET ALL
@router.get("/")
def get_all(db: Session = Depends(get_db)):
    return get_all_notices(db)


# DELETE
@router.delete("/{notice_id}")
def delete(notice_id: str, db: Session = Depends(get_db)):
    return delete_notice(db, notice_id)

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.notice_model import Notice

router = APIRouter()


# ================= GET ALL =================
@router.get("/")
def get_notices(db: Session = Depends(get_db)):
    return db.query(Notice).order_by(Notice.created_at.desc()).all()


# ================= CREATE =================
@router.post("/")
def create_notice(data: dict, db: Session = Depends(get_db)):

    notice = Notice(
        title=data["title"],
        description=data["description"],
        department=data["department"],
        priority=data.get("priority", "normal")
    )

    db.add(notice)
    db.commit()
    db.refresh(notice)

    return notice


# ================= DELETE =================
@router.delete("/{notice_id}")
def delete_notice(notice_id: str, db: Session = Depends(get_db)):

    notice = db.query(Notice).filter(Notice.id == notice_id).first()

    if not notice:
        return {"error": "Not found"}

    db.delete(notice)
    db.commit()

    return {"message": "Deleted"}