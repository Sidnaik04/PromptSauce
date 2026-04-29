MODES = {
    "programming": {
        "role": "Expert Software Engineer",
        "style": "technical, precise",
        "constraints": [
            "Provide code examples",
            "Explain logic step-by-step",
            "Use best practices",
        ],
    },
    "study": {
        "role": "Experienced Teacher",
        "style": "simple, clear",
        "constraints": [
            "Explain in beginner-friendly way",
            "Use examples and analogies",
            "Break into steps",
        ],
    },
    "writing": {
        "role": "Professional Writer",
        "style": "engaging, structured",
        "constraints": [
            "Focus on clarity and flow",
            "Use proper tone",
            "Avoid repetition",
        ],
    },
    "business": {
        "role": "Business Consultant",
        "style": "strategic, concise",
        "constraints": [
            "Focus on actionable insights",
            "Use structured reasoning",
            "Consider risks",
        ],
    },
    "email": {
        "role": "Professional Communicator",
        "style": "formal, concise",
        "constraints": [
            "Keep it clear and polite",
            "Use proper formatting",
            "Avoid unnecessary words",
        ],
    },
    "interview": {
        "role": "Interview Coach",
        "style": "practical, direct",
        "constraints": [
            "Provide structured answers",
            "Include examples",
            "Focus on impact",
        ],
    },
    "fitness": {
        "role": "Fitness Trainer",
        "style": "motivational, practical",
        "constraints": [
            "Provide actionable steps",
            "Focus on safety",
            "Keep it realistic",
        ],
    },
    "legal": {
        "role": "Legal Advisor",
        "style": "formal, precise",
        "constraints": [
            "Avoid definitive legal claims",
            "Provide general guidance",
            "Use clear language",
        ],
    },
    "advice": {
        "role": "Life Advisor",
        "style": "empathetic, practical",
        "constraints": [
            "Be supportive",
            "Offer actionable suggestions",
            "Avoid judgment",
        ],
    },
    "psychology": {
        "role": "Psychology Expert",
        "style": "analytical, empathetic",
        "constraints": [
            "Explain reasoning clearly",
            "Avoid diagnoses",
            "Focus on patterns",
        ],
    },
    "data_analysis": {
        "role": "Data Analyst",
        "style": "analytical, structured",
        "constraints": [
            "Use logical reasoning",
            "Include insights",
            "Explain conclusions",
        ],
    },
}


def get_mode_config(mode: str):
    if mode == "auto":
        return None  # handled later
    return MODES.get(mode, MODES["study"])


MODE_EVAL = {
    "programming": ["correctness", "clarity", "code_quality"],
    "study": ["clarity", "explanation_depth", "usefulness"],
    "writing": ["clarity", "tone", "engagement"],
    "business": ["clarity", "actionability", "strategic_thinking"],
    "email": ["clarity", "tone", "conciseness"],
    "interview": ["clarity", "impact", "structure"],
    "fitness": ["clarity", "practicality", "safety"],
    "legal": ["clarity", "accuracy", "caution"],
    "advice": ["clarity", "empathy", "usefulness"],
    "psychology": ["clarity", "insight", "responsibility"],
    "data_analysis": ["clarity", "reasoning", "insight"],
}


def get_eval_criteria(mode: str):
    return MODE_EVAL.get(mode, ["clarity", "completeness", "usefulness"])
