import json
from app.services.llm_service import LLMService
from app.core.prompt_loader import load_prompt
from app.services.json_repair import repair_json, clean_json_text


class CriticAgent:
    def __init__(self):
        self.prompt_template = load_prompt("app/core/prompts/critic_prompt.txt")

    def run(self, evaluation: dict, llm: LLMService):
        evaluation_str = json.dumps(evaluation, indent=2)

        prompt = self.prompt_template.format(evaluation=evaluation_str)

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

                parsed = {
                    "is_consistent": True,
                    "issues": [],
                    "final_verdict": evaluation.get("winner", "original"),
                }

        return parsed, debug
