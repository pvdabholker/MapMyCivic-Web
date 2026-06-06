from sqlalchemy.orm import Session
from app.models.notice_model import Notice
from datetime import datetime


# CREATE NOTICE
def create_notice(db: Session, data):
    notice = Notice(
        title=data.title,
        description=data.description,
        department=data.department,
        priority=data.priority
    )

    db.add(notice)
    db.commit()
    db.refresh(notice)

    return notice


# GET ALL NOTICES
def get_all_notices(db: Session):
    return db.query(Notice).order_by(Notice.created_at.desc()).all()


# DELETE NOTICE
def delete_notice(db: Session, notice_id: str):
    notice = db.query(Notice).filter(Notice.id == notice_id).first()

    if not notice:
        return None

    db.delete(notice)
    db.commit()

    return True