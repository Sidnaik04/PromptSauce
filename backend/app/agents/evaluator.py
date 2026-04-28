import json
from app.services.llm_service import LLMService
from app.schemas.evaluator_schema import EvaluatorOutput
from app.core.prompt_loader import load_prompt
from app.services.json_repair import repair_json, clean_json_text


class EvaluatorAgent:
    def __init__(self):
        self.llm = LLMService()
        self.prompt_template = load_prompt("app/core/prompts/evaluator_prompt.txt")

    def run(self, original: str, enhanced: str):
        prompt = self.prompt_template.format(
            original=original,
            enhanced=enhanced
        )

        raw_output = self.llm.generate(prompt)

        debug = {
            "raw_output": raw_output
        }

        try:
            cleaned = clean_json_text(raw_output)
            parsed = json.loads(cleaned)

        except Exception as e:
            debug["parse_error"] = str(e)

            try:
                parsed = repair_json(raw_output)
                debug["repaired"] = parsed
            except Exception as repair_error:
                debug["repair_failed"] = str(repair_error)

                parsed = {
                    "scores": {
                        "original": {"clarity": 5, "completeness": 5, "usefulness": 5},
                        "enhanced": {"clarity": 5, "completeness": 5, "usefulness": 5}
                    },
                    "winner": "original",
                    "confidence": 0.5,
                    "reasoning": "Fallback due to parsing failure"
                }

        validated = EvaluatorOutput(**parsed)

        return validated.model_dump(), debug