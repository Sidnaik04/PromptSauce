"""
Redis client with graceful fallback to in-memory store for development/free tier.
Handles cases where REDIS_URL is not properly configured.
"""

import redis
import threading
from app.core.config import settings
from app.core.logger import logger
from typing import Optional

# In-memory fallback store for rate limiting and caching
_in_memory_store = {}
_store_lock = threading.Lock()


class FallbackRedis:
    """Redis-like interface that falls back to in-memory store if Redis is unavailable."""

    def __init__(self):
        self.redis_client: Optional[redis.Redis] = None
        self.using_redis = False
        self._initialize()

    def _initialize(self):
        """Try to connect to Redis; fall back to in-memory if fails."""
        # Check if REDIS_URL is properly configured (not the default placeholder)
        if not settings.REDIS_URL or settings.REDIS_URL == "redis_url":
            logger.warning(
                "REDIS_URL not configured (or is placeholder). Using in-memory store as fallback."
            )
            self.using_redis = False
            return

        try:
            # Try to create Redis client and test connection
            self.redis_client = redis.Redis.from_url(
                settings.REDIS_URL, decode_responses=True, socket_connect_timeout=5
            )
            # Test connection with ping
            self.redis_client.ping()
            self.using_redis = True
            logger.info("Connected to Redis successfully")
        except Exception as e:
            logger.warning(
                f"Failed to connect to Redis ({str(e)}). Falling back to in-memory store."
            )
            self.redis_client = None
            self.using_redis = False

    def incr(self, key: str) -> int:
        """Increment a key (Redis INCR equivalent)."""
        if self.using_redis and self.redis_client:
            try:
                return self.redis_client.incr(key)
            except Exception as e:
                logger.error(f"Redis incr failed: {str(e)}. Falling back to in-memory.")
                self.using_redis = False

        # In-memory fallback
        with _store_lock:
            if key not in _in_memory_store:
                _in_memory_store[key] = 0
            _in_memory_store[key] += 1
            return _in_memory_store[key]

    def expire(self, key: str, ttl: int) -> None:
        """Set expiration on a key (Redis EXPIRE equivalent)."""
        if self.using_redis and self.redis_client:
            try:
                self.redis_client.expire(key, ttl)
                return
            except Exception as e:
                logger.error(f"Redis expire failed: {str(e)}. Falling back to in-memory.")
                self.using_redis = False

        # In-memory fallback: for simplicity, we don't implement TTL
        # In production with Redis, TTL is properly handled
        pass

    def get(self, key: str) -> Optional[str]:
        """Get a value from cache."""
        if self.using_redis and self.redis_client:
            try:
                return self.redis_client.get(key)
            except Exception as e:
                logger.error(f"Redis get failed: {str(e)}. Falling back to in-memory.")
                self.using_redis = False

        with _store_lock:
            return _in_memory_store.get(key)

    def set(self, key: str, value: str, ex: Optional[int] = None) -> None:
        """Set a value in cache."""
        if self.using_redis and self.redis_client:
            try:
                self.redis_client.set(key, value, ex=ex)
                return
            except Exception as e:
                logger.error(f"Redis set failed: {str(e)}. Falling back to in-memory.")
                self.using_redis = False

        with _store_lock:
            _in_memory_store[key] = value

    def setex(self, key: str, time: int, value: str) -> None:
        """Set a value with expiration (Redis SETEX equivalent)."""
        if self.using_redis and self.redis_client:
            try:
                self.redis_client.setex(key, time, value)
                return
            except Exception as e:
                logger.error(f"Redis setex failed: {str(e)}. Falling back to in-memory.")
                self.using_redis = False

        with _store_lock:
            _in_memory_store[key] = value

    def delete(self, key: str) -> None:
        """Delete a key."""
        if self.using_redis and self.redis_client:
            try:
                self.redis_client.delete(key)
                return
            except Exception as e:
                logger.error(f"Redis delete failed: {str(e)}. Falling back to in-memory.")
                self.using_redis = False

        with _store_lock:
            _in_memory_store.pop(key, None)


# Global instance
redis_client = FallbackRedis()
