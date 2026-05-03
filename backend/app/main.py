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
    allow_credentials=True,
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
