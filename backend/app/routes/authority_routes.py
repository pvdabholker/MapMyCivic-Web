from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.authority_schema import AuthorityLogin, TokenResponse
from app.services.authority_service import login_authority
from app.dependencies.auth_dependency import get_current_authority
from app.dependencies.role_dependency import require_admin, require_authority

router = APIRouter()


# 🔐 LOGIN
@router.post("/login", response_model=TokenResponse)
def login(data: AuthorityLogin, db: Session = Depends(get_db)):

    token = login_authority(db, data.email, data.password)

    return {
        "access_token": token,
        "token_type": "bearer"
    }


# 🔐 GET CURRENT USER
@router.get("/me")
def get_me(current_user = Depends(get_current_authority)):
    current_user = require_authority(current_user)

    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "role": current_user.role,
        "department": current_user.department
    }


# 🔐 ADMIN ONLY TEST
@router.get("/admin-only")
def admin_only(current_user = Depends(get_current_authority)):
    current_user = require_admin(current_user)

    return {"message": "Welcome Admin"}