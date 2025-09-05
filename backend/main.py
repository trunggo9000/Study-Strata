"""
Study Strata - AI-Powered Course Scheduler Backend
FastAPI application with intelligent course scheduling and academic planning.
"""

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
import os
from dotenv import load_dotenv
import logging
from contextlib import asynccontextmanager

from app.routers import courses, schedules, ai_advisor, analytics, auth
from app.core.config import settings
from app.core.database import init_db
from app.core.ai_engine import AISchedulingEngine
from app.core.cache import redis_client

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Initialize AI Engine
ai_engine = AISchedulingEngine()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for startup and shutdown events."""
    # Startup
    logger.info("Starting Study Strata Backend...")
    await init_db()
    await ai_engine.initialize()
    if redis_client:
        await redis_client.ping()
        logger.info("Redis connection established")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Study Strata Backend...")
    if redis_client:
        await redis_client.close()

# Create FastAPI application
app = FastAPI(
    title="Study Strata API",
    description="AI-Powered Academic Planning and Course Scheduling Platform",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "ai_engine_status": ai_engine.is_initialized(),
        "database_status": "connected"
    }

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(courses.router, prefix="/api/courses", tags=["Courses"])
app.include_router(schedules.router, prefix="/api/schedules", tags=["Schedules"])
app.include_router(ai_advisor.router, prefix="/api/ai", tags=["AI Advisor"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Welcome to Study Strata API",
        "version": "1.0.0",
        "docs": "/api/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
