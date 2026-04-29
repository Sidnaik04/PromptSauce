from pydantic import BaseModel
from typing import Dict


class Score(BaseModel):
    clarity: int
    completeness: int
    usefulness: int


class Scores(BaseModel):
    original: Score
    enhanced: Score


class EvaluatorOutput(BaseModel):
    scores: Dict[str, Dict[str, int]]
    winner: str
    confidence: float
    reasoning: str
