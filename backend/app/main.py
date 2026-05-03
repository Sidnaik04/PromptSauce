from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import prompt
from app.db.database import engine
from app.db.models import Base
from app.routes import auth
from app.routes import history
from app.routes import usage

app = FastAPI(title="PromptSauce API")

# CORS middleware configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(prompt.router, prefix="/api")
app.include_router(auth.router, prefix="/auth")
app.include_router(history.router, prefix="/history")
app.include_router(usage.router, prefix="/usage")


def init_db():
    Base.metadata.create_all(bind=engine)


init_db()


@app.get("/")
def root():
    return {"message": "PromptSauce backend running"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/health/debug")
def health_debug():
    """Diagnostic endpoint to verify environment setup (masked secrets)."""
    from app.core.config import settings

    # Mask API key - show only last 4 chars
    gemini_key_present = bool(settings.GEMINI_API_KEY)
    gemini_key_mask = ""
    if gemini_key_present:
        try:
            key_str = str(settings.GEMINI_API_KEY)
            gemini_key_mask = (
                f"****{key_str[-4:]}" if len(key_str) > 4 else ("*" * len(key_str))
            )
        except Exception:
            gemini_key_mask = "(invalid-key)"

    return {
        "status": "ok",
        "environment": settings.ENV,
        "debug": settings.DEBUG,
        "llm_provider": settings.LLM_PROVIDER,
        "gemini_api_key_present": gemini_key_present,
        "gemini_api_key_mask": gemini_key_mask if gemini_key_present else "(not set)",
        "database_url_present": bool(settings.DATABASE_URL),
        "redis_url_present": bool(settings.REDIS_URL),
    }
