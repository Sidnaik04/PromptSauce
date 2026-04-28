from sqlalchemy import Column, Integer, String, Text, Float, ForeignKey, DateTime 
from sqlalchemy.sql import func
from app.db.database import Base

class Prompt(Base):
    __tablename__ = "prompts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=True)

    original_prompt = Column(Text)
    enhanced_prompt = Column(Text)
    mode = Column(String)

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