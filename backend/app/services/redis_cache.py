import hashlib
import json
from app.services.redis_client import redis_client

CACHE_TTL = 3600  # 1 hour


def generate_key(data: dict) -> str:
    serialized = json.dumps(data, sort_keys=True)
    return hashlib.md5(serialized.encode()).hexdigest()


def get_cached(data: dict):
    key = generate_key(data)
    value = redis_client.get(key)

    if value:
        return json.loads(value)

    return None


def set_cache(data: dict, value):
    key = generate_key(data)
    redis_client.setex(key, CACHE_TTL, json.dumps(value))
