from fastapi import FastAPI
from app.routes import prompt
from app.db.database import engine
from app.db.models import Base
from app.routes import auth

app = FastAPI(title="PromptSauce API")

app.include_router(prompt.router, prefix="/api")
app.include_router(auth.router, prefix="/auth")


def init_db():
    Base.metadata.create_all(bind=engine)


init_db()


@app.get("/")
def root():
    return {"message": "PromptSauce backend running"}
