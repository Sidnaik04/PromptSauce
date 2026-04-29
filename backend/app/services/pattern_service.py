from app.db import models


def extract_pattern(enhanced_prompt: str):
    text = enhanced_prompt.lower()

    tone = None
    if "simple" in text:
        tone = "simple"
    elif "formal" in text:
        tone = "formal"
    elif "concise" in text:
        tone = "concise"

    structure = None
    if "step-by-step" in text:
        structure = "step-by-step"
    elif "bullet" in text:
        structure = "bullet"

    length = None
    if "detailed" in text:
        length = "detailed"
    elif "short" in text:
        length = "short"

    return {"tone": tone, "structure": structure, "length": length}


def update_user_preferences(db, user_id: str, pattern: dict):
    pref = db.query(models.UserPreference).filter_by(user_id=user_id).first()

    if not pref:
        pref = models.UserPreference(user_id=user_id)

    if pattern["tone"]:
        pref.preferred_tone = pattern["tone"]

    if pattern["structure"]:
        pref.preferred_structure = pattern["structure"]

    if pattern["length"]:
        pref.preferred_length = pattern["length"]

    db.add(pref)
    db.commit()
