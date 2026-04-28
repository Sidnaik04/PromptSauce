from pydantic import BaseModel
from typing import List, Optional


class RecommendedStructure(BaseModel):
    role: str
    format: str
    constraints: List[str]


class AnalyzerOutput(BaseModel):
    intent: str
    domain: str
    missing_context: List[str]
    complexity_level: str
    recommended_structure: RecommendedStructure
