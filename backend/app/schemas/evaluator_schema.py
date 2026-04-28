from pydantic import BaseModel


class Score(BaseModel):
    clarity: int
    completeness: int
    usefulness: int


class Scores(BaseModel):
    original: Score
    enhanced: Score


class EvaluatorOutput(BaseModel):
    scores: Scores
    winner: str
    confidence: float
    reasoning: str
