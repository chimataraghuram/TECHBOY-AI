"""
TECHBOY AI API — Main FastAPI application entry point.

Configures the application, middleware, lifespan events,
and includes all API routers.
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.database.mongodb import close_db, connect_db


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Application lifespan manager.

    Handles MongoDB connection setup on startup
    and teardown on shutdown.
    """
    # Startup
    await connect_db()
    yield
    # Shutdown
    await close_db()


# ── Create FastAPI Application ───────────────────────────────────────────────

app = FastAPI(
    title="TECHBOY AI API",
    version="1.0.0",
    description="AI-powered personal assistant backend with multi-tool orchestration",
    lifespan=lifespan,
)

# ── CORS Middleware ──────────────────────────────────────────────────────────

settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Include Routers ──────────────────────────────────────────────────────────

# Auth router (core — always available)
from app.api.routes.auth import router as auth_router

app.include_router(auth_router, prefix="/api")

# Optional routers (created by other agents — gracefully skip if not yet available)
try:
    from app.api.routes.chat import router as chat_router
    app.include_router(chat_router, prefix="/api")
except ImportError:
    pass

try:
    from app.api.routes.email import router as email_router
    app.include_router(email_router, prefix="/api")
except ImportError:
    pass

try:
    from app.api.routes.telegram import router as telegram_router
    app.include_router(telegram_router, prefix="/api")
except ImportError:
    pass

try:
    from app.api.routes.notes import router as notes_router
    app.include_router(notes_router, prefix="/api")
except ImportError:
    pass

try:
    from app.api.routes.history import router as history_router
    app.include_router(history_router, prefix="/api")
except ImportError:
    pass


# ── Root Endpoint ────────────────────────────────────────────────────────────


@app.get("/")
async def root() -> dict:
    """Root health check endpoint."""
    return {"message": "TECHBOY AI API", "version": "1.0.0"}
