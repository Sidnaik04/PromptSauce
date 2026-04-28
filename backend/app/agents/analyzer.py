import json
from app.services.llm_service import LLMService
from app.schemas.analyzer_schema import AnalyzerOutput
from app.core.prompt_loader import load_prompt
from app.services.json_repair import repair_json, clean_json_text


class AnalyzerAgent:
    def __init__(self):
        self.llm = LLMService()
        self.prompt_template = load_prompt("app/core/prompts/analyzer_prompt.txt")

    def run(self, input_data: dict):
        prompt = self.prompt_template.format(
            prompt=input_data.get("prompt"),
            mode=input_data.get("mode"),
            context=input_data.get("context"),
            preferences=input_data.get("preferences"),
        )

        raw_output = self.llm.generate(prompt)

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
                    "intent": "unknown",
                    "domain": input_data.get("mode", "general"),
                    "missing_context": [],
                    "complexity_level": "unknown",
                    "recommended_structure": {
                        "role": "assistant",
                        "format": "structured response",
                        "constraints": [],
                    },
                }

        # Validate with Pydantic
        validated = AnalyzerOutput(**parsed)

        return validated.model_dump(), debug
