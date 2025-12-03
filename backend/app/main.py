from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.session import engine
from app.db.base_class import Base
from app.api.v1.api import api_router
from app.api.v1.endpoints.dashboard import startup_ai_services, shutdown_ai_services
import app.models
import logging

logging.basicConfig(level=logging.INFO)
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3050",
        "http://127.0.0.1:3050",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "https://frontend.women-safety-app.orb.local",
        "http://frontend.women-safety-app.orb.local",
    ],
    allow_origin_regex="https?://.*", # Maximum permissiveness for local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.on_event("startup")
async def startup():
    startup_ai_services()

@app.on_event("shutdown")
async def shutdown():
    shutdown_ai_services()

@app.get("/")
def root():
    return {"message": "Welcome to Guardia API"}