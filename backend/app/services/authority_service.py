from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.authority_model import Authority
from app.utils.security import verify_password, create_access_token


def login_authority(db: Session, email: str, password: str):
    
    authority = db.query(Authority).filter(Authority.email == email).first()
    # Find authority by email

    if not authority:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    if not verify_password(password, authority.password_hash):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    token = create_access_token(
        {
            "sub": str(authority.id),
            "role": authority.role
        }
    )
    # Create JWT with id + role

    return token