from typing import TypedDict, Dict, Any


class GraphState(TypedDict, total=False):
    # Input
    input: Dict[str, Any]

    # Analyzer
    analysis: Dict[str, Any]

    # Rewriter
    enhanced_prompt: str

    # Evaluator
    evaluation: Dict[str, Any]

    # Critic
    critic: Dict[str, Any]

    # Debug
    debug: Dict[str, Any]

    # Control
    evaluate: bool

    llm: Any

    mode: str

    difficulty: str

    explanation: str
    
    insights: str 