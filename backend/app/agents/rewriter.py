from app.services.llm_service import LLMService
from app.db.models import UserPreference
from app.core.prompt_loader import load_prompt
from app.core.modes import get_mode_config


class RewriterAgent:
    def __init__(self):
        self.prompt_template = load_prompt("app/core/prompts/rewriter_prompt.txt")

    def build_prompt(self, input_data: dict, analysis: dict, db=None) -> str:
        mode = input_data.get("mode")
        mode_config = get_mode_config(mode)

        role = (
            mode_config["role"]
            if mode_config
            else analysis.get("recommended_structure", {}).get("role")
        )
        constraints = (
            mode_config["constraints"]
            if mode_config
            else analysis.get("recommended_structure", {}).get("constraints")
        )

        # Convert constraints to list for manipulation
        if isinstance(constraints, str):
            constraints = [constraints] if constraints else []
        elif constraints is None:
            constraints = []
        else:
            constraints = list(constraints)

        # Get difficulty level and add extra constraints
        difficulty = analysis.get("complexity_level") or "medium"

        extra_constraints = ""
        if difficulty == "simple":
            extra_constraints = "Keep explanation short and simple."
        elif difficulty == "medium":
            extra_constraints = "Provide balanced explanation with examples."
        elif difficulty == "complex":
            extra_constraints = (
                "Provide deep explanation with structured reasoning and examples."
            )

        if extra_constraints:
            constraints.append(extra_constraints)

        # Fetch user preferences
        preference_hint = input_data.get("preferences", "")

        if db:
            user_pref = self.get_user_preferences(db, input_data.get("user_id"))

            if user_pref:
                if user_pref.preferred_tone:
                    preference_hint += f"\n- Use {user_pref.preferred_tone} tone"
                if user_pref.preferred_structure:
                    preference_hint += (
                        f"\n- Use {user_pref.preferred_structure} structure"
                    )
                if user_pref.preferred_length:
                    preference_hint += f"\n- Keep it {user_pref.preferred_length}"

        return self.prompt_template.format(
            prompt=input_data.get("prompt"),
            mode=mode,
            context=input_data.get("context"),
            preferences=preference_hint,
            intent=analysis.get("intent"),
            domain=analysis.get("domain"),
            complexity=analysis.get("complexity_level"),
            missing_context=analysis.get("missing_context"),
            recommended_structure={"role": role, "constraints": constraints},
        )

    async def arun(self, input_data: dict, analysis: dict, llm: LLMService, db=None):
        prompt = self.build_prompt(input_data, analysis, db)

        output = await llm.agenerate(prompt)

        # Ensure output is a string before stripping
        if isinstance(output, str):
            output = output.strip()
        else:
            output = str(output).strip() if output else ""

        debug = {"rewriter_prompt": prompt, "rewriter_output": output}

        return output, debug

    async def astream(self, input_data: dict, analysis: dict, llm: LLMService):
        prompt = self.build_prompt(input_data, analysis)

        async for chunk in llm.astream(prompt):
            yield chunk

    @staticmethod
    def get_user_preferences(db, user_id):
        return db.query(UserPreference).filter_by(user_id=user_id).first()
