from pydantic import BaseModel, Field
from typing import Optional, Dict

class Preferences(BaseModel):
    tone: Optional[str] = None
    output_format: Optional[str] = None
    
class Metadata(BaseModel):
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    
class PromptRequest(BaseModel):
    prompt: str
    mode: str
    context: Optional[str] = None
    preferences: Optional[Preferences] = None
    metadata: Optional[Metadata] = None
    evaluate: bool = False
    
class Metadata(BaseModel):
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    api_key: Optional[str] = None