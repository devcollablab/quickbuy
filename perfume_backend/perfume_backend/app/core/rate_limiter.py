from slowapi import Limiter
from slowapi.util import get_remote_address

# Configure rate limiter with custom key function for authenticated users
def rate_limit_key(request):
    """Generate rate limit key based on user ID if authenticated, else IP."""
    # Try to get user ID from request state (set by auth middleware)
    user_id = getattr(request.state, "user_id", None)
    if user_id:
        return f"user:{user_id}"
    return get_remote_address(request)

limiter = Limiter(
    key_func=rate_limit_key,
    default_limits=["100/minute"],  # Default limit for all routes
    strategy="fixed-window"  # Use fixed window for simplicity
)

# Stricter limits for sensitive endpoints
STRICT_LIMIT = "10/minute"
AUTH_LIMIT = "5/minute"
PAYMENT_LIMIT = "5/minute"