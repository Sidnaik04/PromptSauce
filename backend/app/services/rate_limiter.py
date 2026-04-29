import time
from app.services.redis_client import redis_client

REQUEST_LIMIT = 20
WINDOW_SIZE = 60  # seconds


def is_rate_limited(user_id: str):
    current_window = int(time.time() // WINDOW_SIZE)
    key = f"rate:{user_id}:{current_window}"

    count = redis_client.incr(key)

    if count == 1:
        redis_client.expire(key, WINDOW_SIZE)

    if count > REQUEST_LIMIT:
        return True, count

    return False, count
