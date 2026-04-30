from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Float,
    ForeignKey,
    DateTime,
    Boolean,
)
from sqlalchemy.sql import func
from app.db.database import Base


class Prompt(Base):
    __tablename__ = "prompts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=False)

    original_prompt = Column(Text)
    mode = Column(String)

    created_at = Column(DateTime(timezone=True), server_default=func.now())


class PromptVersion(Base):
    __tablename__ = "prompt_versions"

    id = Column(Integer, primary_key=True, index=True)
    prompt_id = Column(Integer, ForeignKey("prompts.id"))

    version_number = Column(Integer)
    enhanced_prompt = Column(Text)

    score = Column(Float, nullable=True)
    is_best = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Evaluation(Base):
    __tablename__ = "evaluations"

    id = Column(Integer, primary_key=True, index=True)
    prompt_id = Column(Integer, ForeignKey("prompts.id"))

    original_score = Column(Float)
    enhanced_score = Column(Float)
    improvement_score = Column(Float)

    feedback = Column(Text)


class Usage(Base):
    __tablename__ = "usage"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=True)

    request_count = Column(Integer, default=0)
    last_used = Column(DateTime(timezone=True), server_default=func.now())


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String, nullable=False)
    profile_picture = Column(String, nullable=True)

    google_id = Column(String, unique=True, index=True, nullable=True)
    email_verification_token = Column(String, nullable=True)
    api_key = Column(String, nullable=True)

    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    email_verified_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())


class UserPreference(Base):
    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, unique=True)

    preferred_tone = Column(String, nullable=True)
    preferred_structure = Column(String, nullable=True)
    preferred_length = Column(String, nullable=True)

    last_updated = Column(DateTime(timezone=True), server_default=func.now())


class UsageLog(Base):
    __tablename__ = "usage_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String)

    prompt_tokens = Column(Integer)
    response_tokens = Column(Integer)

    cached = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
