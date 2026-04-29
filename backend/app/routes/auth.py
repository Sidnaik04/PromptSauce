from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.auth_schema import UserCreate, UserLogin, TokenResponse
from app.schemas.auth_schema import GoogleAuthRequest
from app.services.google_auth import verify_google_token
from app.services.auth_service import get_or_create_google_user
from app.services.auth_service import create_user, authenticate_user
from app.core.security import create_access_token
from app.core.dependencies import get_current_user

router = APIRouter()


@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    new_user = create_user(db, user.email, user.password)

    if not new_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    token = create_access_token({"sub": new_user.email})

    response = JSONResponse(content={"message": "Registration successful"})
    response.set_cookie(
        key="access_token", value=token, httponly=True, secure=True, samesite="lax"
    )
    return response


@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = authenticate_user(db, user.email, user.password)

    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": db_user.email})

    response = JSONResponse(content={"message": "Login successful"})
    response.set_cookie(
        key="access_token", value=token, httponly=True, secure=True, samesite="lax"
    )
    return response


@router.get("/me")
def get_me(user=Depends(get_current_user)):
    return {"email": user.email, "id": user.id}


@router.post("/google")
def google_auth(data: GoogleAuthRequest, db: Session = Depends(get_db)):
    google_user = verify_google_token(data.token)

    if not google_user:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    user = get_or_create_google_user(db, google_user["email"])

    token = create_access_token({"sub": user.email})

    response = JSONResponse(content={"message": "Google auth successful"})
    response.set_cookie(
        key="access_token", value=token, httponly=True, secure=True, samesite="lax"
    )
    return response
