import json
import re
from app.services.llm_service import LLMService


def clean_json_text(text: str) -> str:
    """
    Removes markdown/codeblock wrappers and trims text
    """
    if not text:
        return ""

    text = re.sub(r"```json", "", text)
    text = re.sub(r"```", "", text)

    return text.strip()


def repair_json(broken_json: str) -> dict:
    llm = LLMService()

    repair_prompt = f"""
Fix the following JSON. Return ONLY valid JSON.
Do not add explanation.

JSON:
{broken_json}
"""

    fixed = llm.generate(repair_prompt)

    cleaned = clean_json_text(fixed)

    if not cleaned:
        raise ValueError("Empty response from repair LLM")

    return json.loads(cleaned)
