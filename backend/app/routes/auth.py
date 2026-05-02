from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.auth_schema import (
    UserCreate,
    UserLogin,
    TokenResponse,
    GoogleAuthRequest,
    EmailVerificationRequest,
    ApiKeyRequest,
)
from app.services.google_auth import verify_google_token
from app.services.auth_service import (
    get_or_create_google_user,
    create_user,
    authenticate_user,
    verify_email,
)
from app.core.security import create_access_token
from app.core.dependencies import get_current_user

router = APIRouter()


@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    new_user = create_user(db, user.email, user.username, user.password)

    if not new_user:
        raise HTTPException(
            status_code=400, detail="Email or username already registered"
        )

    response = JSONResponse(
        content={
            "message": "Registration successful. Please verify your email.",
            "verify_token": new_user.email_verification_token,
            "user": {
                "email": new_user.email,
                "username": new_user.username,
                "profile_picture": new_user.profile_picture,
                "id": new_user.id,
                "is_verified": new_user.is_verified,
            },
        }
    )
    return response


@router.post("/signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):
    new_user = create_user(db, user.email, user.username, user.password)

    if not new_user:
        raise HTTPException(
            status_code=400, detail="Email or username already registered"
        )

    # Return temp token for email verification (not a full access token)
    response = JSONResponse(
        content={
            "message": "Registration successful. Please verify your email.",
            "verify_token": new_user.email_verification_token,
            "user": {
                "email": new_user.email,
                "username": new_user.username,
                "profile_picture": new_user.profile_picture,
                "id": new_user.id,
                "is_verified": new_user.is_verified,
            },
        }
    )
    return response


@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = authenticate_user(db, user.email, user.password)

    if not db_user:
        # Check if user exists but not verified
        from app.db import models

        unverified_user = db.query(models.User).filter_by(email=user.email).first()
        if unverified_user and not unverified_user.is_verified:
            raise HTTPException(
                status_code=403,
                detail="Email not verified. Please verify your email first.",
            )
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": db_user.email})

    response = JSONResponse(
        content={
            "message": "Login successful",
            "access_token": token,
            "user": {
                "email": db_user.email,
                "username": db_user.username,
                "profile_picture": db_user.profile_picture,
                "id": db_user.id,
                "is_verified": db_user.is_verified,
            },
        }
    )
    response.set_cookie(
        key="access_token", value=token, httponly=True, secure=True, samesite="lax"
    )
    return response


@router.post("/verify-email")
def verify_email_endpoint(
    verification: EmailVerificationRequest, db: Session = Depends(get_db)
):
    user = verify_email(db, verification.verify_token)

    if not user:
        raise HTTPException(status_code=400, detail="Invalid verification token")

    token = create_access_token({"sub": user.email})

    response = JSONResponse(
        content={
            "message": "Email verified successfully",
            "access_token": token,
            "user": {
                "email": user.email,
                "username": user.username,
                "profile_picture": user.profile_picture,
                "id": user.id,
                "is_verified": user.is_verified,
            },
        }
    )
    response.set_cookie(
        key="access_token", value=token, httponly=True, secure=True, samesite="lax"
    )
    return response


@router.get("/me")
def get_me(user=Depends(get_current_user)):
    return {
        "email": user.email,
        "username": user.username,
        "profile_picture": user.profile_picture,
        "id": user.id,
        "is_verified": user.is_verified,
    }


@router.get("/api-key")
def get_api_key(user=Depends(get_current_user)):
    return {"api_key": user.api_key or ""}


@router.post("/google")
def google_auth(data: GoogleAuthRequest, db: Session = Depends(get_db)):
    google_user = verify_google_token(data.token)

    if not google_user:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    # Extract picture URL from Google token if available
    picture_url = google_user.get("picture")

    user = get_or_create_google_user(db, google_user["email"], picture_url)

    token = create_access_token({"sub": user.email})

    response = JSONResponse(
        content={
            "message": "Google auth successful",
            "access_token": token,
            "user": {
                "email": user.email,
                "username": user.username,
                "profile_picture": user.profile_picture,
                "id": user.id,
                "is_verified": user.is_verified,
            },
        }
    )
    response.set_cookie(
        key="access_token", value=token, httponly=True, secure=True, samesite="lax"
    )
    return response


@router.post("/save-api-key")
def save_api_key(
    payload: ApiKeyRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Save or update user's API key"""
    from app.db import models
    from app.core.logger import logger

    db_user = db.query(models.User).filter_by(id=user.id).first()

    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    if not payload.api_key or not payload.api_key.strip():
        raise HTTPException(status_code=400, detail="API key cannot be empty")

    db_user.api_key = payload.api_key.strip()
    db.commit()
    db.refresh(db_user)

    logger.info(f"API key saved for user: {user.id}")

    return {"message": "API key saved successfully", "user_id": user.id}
