"""
Redis caching utilities for Study Strata backend.
"""

import json
import logging
from typing import Any, Optional, Dict
import redis.asyncio as redis
from .config import settings

logger = logging.getLogger(__name__)

class CacheManager:
    """Manages Redis caching operations."""
    
    def __init__(self):
        self.redis_client: Optional[redis.Redis] = None
    
    async def initialize(self):
        """Initialize Redis connection."""
        try:
            self.redis_client = redis.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True
            )
            await self.redis_client.ping()
            logger.info("Redis cache initialized successfully")
        except Exception as e:
            logger.warning(f"Redis cache initialization failed: {e}")
            self.redis_client = None
    
    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache."""
        if not self.redis_client:
            return None
        
        try:
            value = await self.redis_client.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            logger.error(f"Cache get error for key {key}: {e}")
            return None
    
    async def set(self, key: str, value: Any, ttl: int = None) -> bool:
        """Set value in cache."""
        if not self.redis_client:
            return False
        
        try:
            ttl = ttl or settings.CACHE_TTL
            serialized_value = json.dumps(value, default=str)
            await self.redis_client.setex(key, ttl, serialized_value)
            return True
        except Exception as e:
            logger.error(f"Cache set error for key {key}: {e}")
            return False
    
    async def delete(self, key: str) -> bool:
        """Delete key from cache."""
        if not self.redis_client:
            return False
        
        try:
            await self.redis_client.delete(key)
            return True
        except Exception as e:
            logger.error(f"Cache delete error for key {key}: {e}")
            return False
    
    async def clear_pattern(self, pattern: str) -> int:
        """Clear all keys matching pattern."""
        if not self.redis_client:
            return 0
        
        try:
            keys = await self.redis_client.keys(pattern)
            if keys:
                return await self.redis_client.delete(*keys)
            return 0
        except Exception as e:
            logger.error(f"Cache clear pattern error for {pattern}: {e}")
            return 0

# Global cache manager instance
cache_manager = CacheManager()

# Convenience functions
async def get_cached(key: str) -> Optional[Any]:
    """Get value from cache."""
    return await cache_manager.get(key)

async def set_cached(key: str, value: Any, ttl: int = None) -> bool:
    """Set value in cache."""
    return await cache_manager.set(key, value, ttl)

async def delete_cached(key: str) -> bool:
    """Delete key from cache."""
    return await cache_manager.delete(key)

# Cache key generators
def course_cache_key(course_id: str) -> str:
    """Generate cache key for course data."""
    return f"course:{course_id}"

def schedule_cache_key(user_id: str, params_hash: str) -> str:
    """Generate cache key for schedule data."""
    return f"schedule:{user_id}:{params_hash}"

def student_progress_cache_key(user_id: str) -> str:
    """Generate cache key for student progress."""
    return f"student_progress:{user_id}"

# Initialize cache on import
redis_client = cache_manager
