from fastapi import FastAPI
from app.routes import prompt

app = FastAPI(title="PromptSauce API")

app.include_router(prompt.router, prefix="/api")


@app.get("/")
def root():
    return {"message": "PromptSauce backend running"}
