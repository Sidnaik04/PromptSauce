import json
from app.services.llm_service import LLMService
from app.schemas.evaluator_schema import EvaluatorOutput
from app.core.prompt_loader import load_prompt
from app.services.json_repair import repair_json, clean_json_text
from app.core.modes import get_eval_criteria


class EvaluatorAgent:
    def __init__(self):
        self.prompt_template = load_prompt("app/core/prompts/evaluator_prompt.txt")

    def run(self, original: str, enhanced: str, mode: str, llm: LLMService):
        criteria = get_eval_criteria(mode)

        criteria_text = "\n- " + "\n- ".join(criteria)

        prompt = self.prompt_template.format(
            original=original, enhanced=enhanced, criteria=criteria_text
        )

        raw_output = llm.generate(prompt)

        debug = {"raw_output": raw_output}

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

                fallback_scores = {c: 5 for c in criteria}

                parsed = {
                    "scores": {
                        "original": fallback_scores,
                        "enhanced": fallback_scores,
                    },
                    "winner": "original",
                    "confidence": 0.5,
                    "reasoning": "Fallback due to parsing failure",
                }

        validated = EvaluatorOutput(**parsed)

        return validated.model_dump(), debug
