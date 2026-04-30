from sqlalchemy.orm import Session
from app.db import models
from app.core.security import hash_password, verify_password
import secrets
from datetime import datetime, timedelta


def generate_verification_token():
    """Generate a secure random verification token"""
    return secrets.token_urlsafe(32)


def generate_avatar_url(username: str):
    """Generate avatar URL with first letter of username"""
    first_letter = username[0].upper() if username else "U"
    return f"https://ui-avatars.com/api/?name={first_letter}&background=FF6A3D&color=fff&bold=true&size=128"


def create_user(db: Session, email: str, username: str, password: str):
    existing_email = db.query(models.User).filter_by(email=email).first()
    if existing_email:
        return None

    existing_username = db.query(models.User).filter_by(username=username).first()
    if existing_username:
        return None

    verification_token = generate_verification_token()
    avatar_url = generate_avatar_url(username)

    user = models.User(
        email=email,
        username=username,
        hashed_password=hash_password(password),
        profile_picture=avatar_url,
        email_verification_token=verification_token,
        is_verified=False,
    )

    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str):
    user = db.query(models.User).filter_by(email=email).first()
    if not user:
        return None

    if not verify_password(password, user.hashed_password):
        return None

    # Check if email is verified
    if not user.is_verified:
        return None

    return user


def verify_email(db: Session, verification_token: str):
    """Verify user email with token"""
    user = (
        db.query(models.User)
        .filter_by(email_verification_token=verification_token)
        .first()
    )

    if not user:
        return None

    user.is_verified = True
    user.email_verified_at = datetime.utcnow()
    user.email_verification_token = None

    db.commit()
    db.refresh(user)
    return user


def get_or_create_google_user(db: Session, email: str, picture_url: str = None):
    """Get or create user from Google OAuth with profile picture"""
    user = db.query(models.User).filter_by(email=email).first()

    if user:
        # Update profile picture if provided and not already set
        if picture_url and not user.profile_picture:
            user.profile_picture = picture_url
            db.commit()
            db.refresh(user)
        return user

    # Extract username from email for Google users
    username = email.split("@")[0]

    # Make sure username is unique for Google users
    counter = 1
    base_username = username
    while db.query(models.User).filter_by(username=username).first():
        username = f"{base_username}{counter}"
        counter += 1

    user = models.User(
        email=email,
        username=username,
        hashed_password="",
        profile_picture=picture_url or generate_avatar_url(username),
        is_verified=True,  # Google users are pre-verified
        email_verified_at=datetime.utcnow(),
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user
