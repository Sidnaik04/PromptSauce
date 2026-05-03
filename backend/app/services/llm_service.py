from typing import Optional, Generator
from app.core.config import settings
from tenacity import retry, stop_after_attempt, wait_exponential, RetryError


class LLMService:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.provider = settings.LLM_PROVIDER

        if not self.api_key or not str(self.api_key).strip():
            raise ValueError(
                "Gemini API key is not configured. Set GEMINI_API_KEY on the backend or save an API key for the user."
            )

    def _get_client(self):
        if self.provider == "gemini":
            from langchain_google_genai import ChatGoogleGenerativeAI

            return ChatGoogleGenerativeAI(
                model="gemini-2.5-flash", google_api_key=self.api_key, temperature=0.3
            )
        else:
            raise ValueError("Unsupported LLM provider")

    @retry(
        stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10)
    )
    def generate(self, prompt: str) -> str:
        client = self._get_client()
        try:
            response = client.invoke(prompt)
            return response.content

        except RetryError as e:
            raise Exception("LLM service unavailable") from e

        except Exception as e:
            raise Exception("Unexpected LLM error") from e

    @retry(
        stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10)
    )
    async def agenerate(self, prompt: str) -> str:
        client = self._get_client()
        try:
            response = await client.ainvoke(prompt)
            return response.content

        except RetryError as e:
            raise Exception("LLM service unavailable") from e

        except Exception as e:
            raise Exception("Unexpected LLM error") from e

    async def astream(self, prompt: str):
        client = self._get_client()
        try:
            async for chunk in client.astream(prompt):
                yield chunk.content

        except Exception:
            yield "Streaming failed."

    def stream(self, prompt: str):
        client = self._get_client()
        try:
            for chunk in client.stream(prompt):
                yield chunk.content

        except Exception:
            yield "Streaming failed."
