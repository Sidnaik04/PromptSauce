import hashlib
import json

CACHE = {}


def generate_key(data: dict) -> str:
    serialized = json.dumps(data, sort_keys=True)
    return hashlib.md5(serialized.encode()).hexdigest()


def get_cached(data: dict):
    key = generate_key(data)
    return CACHE.get(key)


def set_cache(data: dict, value):
    key = generate_key(data)
    CACHE[key] = value
