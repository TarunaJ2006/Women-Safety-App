from fastapi import APIRouter
from app.api.v1.endpoints import emergency, contacts, settings, dashboard, login, users, responder

api_router = APIRouter()
api_router.include_router(login.router, tags=["login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(emergency.router, prefix="/emergency", tags=["Emergency"])
api_router.include_router(contacts.router, prefix="/contacts", tags=["Contacts"])
api_router.include_router(settings.router, prefix="/settings", tags=["Settings"])
api_router.include_router(responder.router, prefix="/responder", tags=["Responder"])