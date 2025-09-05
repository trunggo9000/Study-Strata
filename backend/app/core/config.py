"""
Configuration settings for Study Strata backend.
"""

import os
from typing import List
from pydantic import BaseSettings, Field


class Settings(BaseSettings):
    """Application settings."""
    
    # API Configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Study Strata"
    VERSION: str = "1.0.0"
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080",
        "https://study-strata.netlify.app",
        "https://study-strata.vercel.app"
    ]
    
    # Database
    SUPABASE_URL: str = Field(..., env="SUPABASE_URL")
    SUPABASE_ANON_KEY: str = Field(..., env="SUPABASE_ANON_KEY")
    SUPABASE_SERVICE_KEY: str = Field(..., env="SUPABASE_SERVICE_KEY")
    
    # AI Configuration
    OPENAI_API_KEY: str = Field(..., env="OPENAI_API_KEY")
    AI_MODEL: str = "gpt-4-turbo-preview"
    AI_TEMPERATURE: float = 0.3
    MAX_TOKENS: int = 2000
    
    # Redis Configuration
    REDIS_URL: str = Field("redis://localhost:6379", env="REDIS_URL")
    CACHE_TTL: int = 3600  # 1 hour
    
    # Security
    SECRET_KEY: str = Field(..., env="SECRET_KEY")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    AI_RATE_LIMIT_PER_MINUTE: int = 10
    
    # Scheduling Algorithm Parameters
    MAX_UNITS_PER_QUARTER: int = 20
    MIN_UNITS_PER_QUARTER: int = 12
    DIFFICULTY_WEIGHT: float = 0.3
    PREREQUISITE_WEIGHT: float = 0.4
    PREFERENCE_WEIGHT: float = 0.3
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Create settings instance
settings = Settings()
