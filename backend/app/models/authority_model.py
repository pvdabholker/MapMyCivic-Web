from sqlalchemy import Column, String, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime

from app.db.database import Base


class Authority(Base):
    __tablename__ = "authorities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    # Unique ID for each authority

    email = Column(String, unique=True, nullable=False)
    # Login email (no username)

    password_hash = Column(String, nullable=False)
    # Store hashed password (never plain)

    role = Column(String, nullable=False)
    # "admin" or "parent"

    department = Column(String, nullable=True)
    # Only for parent (admin = None)

    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    # Timestamp