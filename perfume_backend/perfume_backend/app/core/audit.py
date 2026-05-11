"""
Audit logging module for security and compliance.
Logs all critical security events and actions.
"""
import json
import logging
from datetime import datetime
from enum import Enum
from typing import Optional, Dict, Any
from fastapi import Request

# Configure audit logger
audit_logger = logging.getLogger("audit")
audit_logger.setLevel(logging.INFO)

# Create handler if not exists
if not audit_logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter('%(message)s')
    handler.setFormatter(formatter)
    audit_logger.addHandler(handler)


class AuditEvent(Enum):
    """Security events that are logged."""
    # Authentication events
    USER_REGISTERED = "user_registered"
    USER_LOGIN = "user_login"
    USER_LOGIN_FAILED = "user_login_failed"
    USER_LOGOUT = "user_logout"
    PASSWORD_CHANGED = "password_changed"
    PASSWORD_RESET_REQUESTED = "password_reset_requested"
    PASSWORD_RESET_COMPLETED = "password_reset_completed"
    OTP_SENT = "otp_sent"
    OTP_VERIFIED = "otp_verified"
    OTP_FAILED = "otp_failed"
    TOKEN_REFRESHED = "token_refreshed"
    TOKEN_REVOKED = "token_revoked"

    # Authorization events
    ACCESS_DENIED = "access_denied"
    ADMIN_ACTION = "admin_action"

    # Order events
    ORDER_CREATED = "order_created"
    ORDER_PAYMENT_VERIFIED = "order_payment_verified"
    ORDER_STATUS_CHANGED = "order_status_changed"
    ORDER_CANCELLED = "order_cancelled"

    # Payment events
    PAYMENT_INITIATED = "payment_initiated"
    PAYMENT_COMPLETED = "payment_completed"
    PAYMENT_FAILED = "payment_failed"
    PAYMENT_REFUNDED = "payment_refunded"

    # Product events
    PRODUCT_CREATED = "product_created"
    PRODUCT_UPDATED = "product_updated"
    PRODUCT_DELETED = "product_deleted"
    PRODUCT_VIEWED = "product_viewed"

    # Cart events
    CART_ITEM_ADDED = "cart_item_added"
    CART_ITEM_UPDATED = "cart_item_updated"
    CART_ITEM_REMOVED = "cart_item_removed"
    CART_CHECKOUT_STARTED = "cart_checkout_started"

    # User profile events
    PROFILE_CREATED = "profile_created"
    PROFILE_UPDATED = "profile_updated"
    PROFILE_DELETED = "profile_deleted"

    # Security events
    SUSPICIOUS_ACTIVITY = "suspicious_activity"
    RATE_LIMIT_EXCEEDED = "rate_limit_exceeded"
    INVALID_TOKEN = "invalid_token"
    TOKEN_REUSE_DETECTED = "token_reuse_detected"


def log_audit(
    event_type: AuditEvent,
    user_id: Optional[int],
    ip_address: Optional[str],
    details: Dict[str, Any],
    success: bool = True,
    request: Optional[Request] = None
):
    """
    Log an audit event.

    Args:
        event_type: Type of audit event
        user_id: ID of the user performing the action
        ip_address: IP address of the client
        details: Additional event details
        success: Whether the action was successful
        request: FastAPI request object (optional)
    """
    event_data = {
        "timestamp": datetime.utcnow().isoformat(),
        "event_type": event_type.value,
        "user_id": user_id,
        "ip_address": ip_address,
        "success": success,
        "details": details
    }

    # Add request metadata if available
    if request:
        event_data["user_agent"] = request.headers.get("user-agent", "")
        event_data["referrer"] = request.headers.get("referer", "")

    audit_logger.info(json.dumps(event_data))


def get_client_ip(request: Request) -> str:
    """Extract client IP from request, handling proxies."""
    # Check for X-Forwarded-For header (common with reverse proxies)
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()

    # Check for X-Real-IP header
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip

    # Fall back to direct connection
    if request.client:
        return request.client.host

    return "unknown"


# Convenience functions for common events

def log_user_login(
    request: Request,
    user_id: int,
    success: bool = True,
    failure_reason: Optional[str] = None
):
    """Log user login attempt."""
    event = AuditEvent.USER_LOGIN if success else AuditEvent.USER_LOGIN_FAILED
    details = {"failure_reason": failure_reason} if failure_reason else {}
    log_audit(event, user_id, get_client_ip(request), details, success, request)


def log_order_created(
    request: Request,
    user_id: int,
    order_id: int,
    amount: float,
    payment_method: str = "razorpay"
):
    """Log order creation."""
    log_audit(
        AuditEvent.ORDER_CREATED,
        user_id,
        get_client_ip(request),
        {
            "order_id": order_id,
            "amount": amount,
            "payment_method": payment_method
        },
        True,
        request
    )


def log_payment_verified(
    request: Request,
    user_id: int,
    order_id: int,
    payment_id: str,
    amount: float
):
    """Log successful payment verification."""
    log_audit(
        AuditEvent.PAYMENT_COMPLETED,
        user_id,
        get_client_ip(request),
        {
            "order_id": order_id,
            "payment_id": payment_id,
            "amount": amount
        },
        True,
        request
    )


def log_admin_action(
    request: Request,
    admin_id: int,
    action: str,
    target_type: str,
    target_id: Optional[int] = None,
    details: Optional[Dict] = None
):
    """Log admin actions."""
    log_audit(
        AuditEvent.ADMIN_ACTION,
        admin_id,
        get_client_ip(request),
        {
            "action": action,
            "target_type": target_type,
            "target_id": target_id,
            "details": details or {}
        },
        True,
        request
    )


def log_suspicious_activity(
    request: Request,
    user_id: Optional[int],
    activity_type: str,
    details: Dict[str, Any]
):
    """Log suspicious activity."""
    log_audit(
        AuditEvent.SUSPICIOUS_ACTIVITY,
        user_id,
        get_client_ip(request),
        {"activity_type": activity_type, **details},
        False,
        request
    )


def log_token_reuse(
    request: Request,
    user_id: int,
    token_id: Optional[int] = None
):
    """Log token reuse detection (potential theft)."""
    log_audit(
        AuditEvent.TOKEN_REUSE_DETECTED,
        user_id,
        get_client_ip(request),
        {"token_id": token_id, "severity": "high"},
        False,
        request
    )


def log_access_denied(
    request: Request,
    user_id: Optional[int],
    resource: str,
    reason: str
):
    """Log access denied events."""
    log_audit(
        AuditEvent.ACCESS_DENIED,
        user_id,
        get_client_ip(request),
        {"resource": resource, "reason": reason},
        False,
        request
    )
