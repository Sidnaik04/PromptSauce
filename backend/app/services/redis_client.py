"""
Redis client with fallback support.
Uses FallbackRedis which gracefully falls back to in-memory store if Redis is unavailable.
"""

from app.services.redis_fallback import redis_client
