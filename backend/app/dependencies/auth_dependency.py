from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.authority_model import Authority
import os
from dotenv import load_dotenv

load_dotenv()

security = HTTPBearer()
# Extracts "Authorization: Bearer <token>"

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"


def get_current_authority(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials
    # Extract token from header

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        # Decode JWT

        authority_id = payload.get("sub")

        if authority_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    authority = db.query(Authority).filter(Authority.id == authority_id).first()
    # Fetch authority from DB

    if authority is None:
        raise HTTPException(status_code=401, detail="User not found")

    return authority