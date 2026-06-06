from fastapi import HTTPException


def require_admin(user):
    # Allow only admin
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


def require_authority(user):
    # Allow admin + parent
    if user.role not in ["admin", "parent"]:
        raise HTTPException(status_code=403, detail="Access denied")
    return user