from fastapi import FastAPI
from app.routes import prompt
from app.db.database import engine
from app.db.models import Base

app = FastAPI(title="PromptSauce API")

app.include_router(prompt.router, prefix="/api")


def init_db():
    Base.metadata.create_all(bind=engine)


init_db()


@app.get("/")
def root():
    return {"message": "PromptSauce backend running"}
