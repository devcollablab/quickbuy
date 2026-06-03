"""
Gmail OAuth2 Email Sending Module
Replies on app passwords with OAuth2 support for enhanced security
"""
import base64
import json
import logging
import os
from email.mime.text import MIMEText
from pathlib import Path
from typing import Optional

import requests
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow

from app.config import settings

logger = logging.getLogger(__name__)

# Gmail API scopes
SCOPES = ['https://www.googleapis.com/auth/gmail.send']


class EmailOAuth2Manager:
    """
    Manages Gmail OAuth2 authentication and email sending.
    Falls back to SMTP with App Password if OAuth2 credentials not configured.
    """

    def __init__(self):
        self.token_path = Path(__file__).parent.parent.parent / "credentials" / "gmail_token.json"
        self.credentials_path = Path(__file__).parent.parent.parent / "credentials" / "gmail_credentials.json"
        self._credentials: Optional[Credentials] = None
        self._use_oauth2 = self._check_oauth2_available()

    def _check_oauth2_available(self) -> bool:
        """Check if OAuth2 credentials are configured."""
        # Check if credentials file exists or if we have OAuth2 env vars
        if self.credentials_path.exists():
            return True

        # Check for OAuth2 credentials in environment
        required_vars = [
            'GMAIL_OAUTH2_CLIENT_ID',
            'GMAIL_OAUTH2_CLIENT_SECRET',
            'GMAIL_OAUTH2_REFRESH_TOKEN'
        ]
        return all(getattr(settings, var, None) for var in required_vars)

    def _get_credentials_from_env(self) -> Optional[Credentials]:
        """Build credentials from environment variables."""
        try:
            client_id = getattr(settings, 'GMAIL_OAUTH2_CLIENT_ID', None)
            client_secret = getattr(settings, 'GMAIL_OAUTH2_CLIENT_SECRET', None)
            refresh_token = getattr(settings, 'GMAIL_OAUTH2_REFRESH_TOKEN', None)

            if not all([client_id, client_secret, refresh_token]):
                return None

            creds = Credentials(
                token=None,  # Will be refreshed
                refresh_token=refresh_token,
                token_uri="https://oauth2.googleapis.com/token",
                client_id=client_id,
                client_secret=client_secret,
                scopes=SCOPES
            )

            # Refresh to get access token
            creds.refresh(Request())
            return creds

        except Exception as e:
            logger.error(f"Failed to get credentials from env: {e}")
            return None

    def _get_credentials_from_file(self) -> Optional[Credentials]:
        """Get or refresh credentials from file."""
        creds = None

        # Load existing token if available
        if self.token_path.exists():
            try:
                creds = Credentials.from_authorized_user_file(
                    str(self.token_path), SCOPES
                )
            except Exception as e:
                logger.warning(f"Failed to load existing token: {e}")

        # Refresh or create new credentials
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                try:
                    creds.refresh(Request())
                except Exception as e:
                    logger.error(f"Failed to refresh token: {e}")
                    creds = None

            # Try to create new credentials from file
            if not creds and self.credentials_path.exists():
                try:
                    flow = InstalledAppFlow.from_client_secrets_file(
                        str(self.credentials_path), SCOPES
                    )
                    creds = flow.run_local_server(port=0)
                except Exception as e:
                    logger.error(f"Failed to create credentials from file: {e}")

        # Save credentials for future runs
        if creds and self.token_path.parent.exists():
            try:
                self.token_path.write_text(creds.to_json())
            except Exception as e:
                logger.warning(f"Failed to save token: {e}")

        return creds

    def get_credentials(self) -> Optional[Credentials]:
        """Get valid OAuth2 credentials."""
        if self._credentials and self._credentials.valid:
            return self._credentials

        # Try environment variables first
        self._credentials = self._get_credentials_from_env()

        # Fall back to file-based credentials
        if not self._credentials:
            self._credentials = self._get_credentials_from_file()

        return self._credentials

    def send_email_oauth2(self, to_email: str, subject: str, body: str) -> bool:
        """Send email using Gmail API with OAuth2."""
        try:
            creds = self.get_credentials()
            if not creds:
                logger.error("No OAuth2 credentials available")
                return False

            # Create MIME message
            message = MIMEText(body, 'plain', 'utf-8')
            message['to'] = to_email
            message['subject'] = subject
            message['from'] = settings.EMAIL_USER

            # Encode for Gmail API
            encoded_message = base64.urlsafe_b64encode(
                message.as_bytes()
            ).decode()

            # Send via Gmail API
            url = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send"
            headers = {
                'Authorization': f'Bearer {creds.token}',
                'Content-Type': 'application/json'
            }
            payload = {'raw': encoded_message}

            response = requests.post(url, headers=headers, json=payload, timeout=30)

            if response.status_code == 200:
                logger.info(f"Email sent successfully via OAuth2 to {to_email}")
                return True
            else:
                logger.error(f"Gmail API error: {response.status_code} - {response.text}")
                return False

        except Exception as e:
            logger.error(f"Failed to send email via OAuth2: {e}")
            return False


# Global email manager instance
email_manager = EmailOAuth2Manager()


def send_email_secure(to_email: str, subject: str, body: str) -> bool:
    """
    Send email using the most secure method available.
    Priority: OAuth2 > SMTP with App Password
    """
    # Try OAuth2 first
    if email_manager._use_oauth2:
        logger.debug("Attempting to send email via OAuth2")
        if email_manager.send_email_oauth2(to_email, subject, body):
            return True
        logger.warning("OAuth2 failed, falling back to SMTP")

    # Fall back to SMTP
    return _send_email_smtp(to_email, subject, body)


def _send_email_smtp(to_email: str, subject: str, body: str) -> bool:
    """
    Fallback SMTP method using App Password.
    This still uses a password, but it's an App Password, not the main Gmail password.
    """
    import smtplib
    from email.mime.text import MIMEText

    try:
        msg = MIMEText(body, 'plain', 'utf-8')
        msg['Subject'] = subject
        msg['From'] = settings.EMAIL_USER
        msg['To'] = to_email

        # Use TLS with certificate verification
        server = smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT)
        server.starttls()
        server.login(settings.EMAIL_USER, settings.EMAIL_PASSWORD)
        server.send_message(msg)
        server.quit()

        logger.info(f"Email sent successfully via SMTP to {to_email}")
        return True

    except Exception as e:
        logger.error(f"Failed to send email via SMTP: {e}")
        return False


def send_otp_email(to_email: str, otp: str, brand_name: str = "XYZ Perfumes") -> bool:
    """
    Send OTP email using secure method.
    Includes rate limiting check via Redis if available.
    """
    from app.config import redis_client

    # Rate limiting check
    try:
        rate_key = f"email_rate:{to_email}"
        email_count = redis_client.get(rate_key)

        if email_count and int(email_count) >= 5:  # Max 5 emails per hour
            logger.warning(f"Rate limit exceeded for {to_email}")
            return False

        # Increment counter with 1 hour TTL
        pipe = redis_client.pipeline()
        pipe.incr(rate_key)
        pipe.expire(rate_key, 3600)
        pipe.execute()
    except Exception:
        # Redis unavailable, continue anyway
        pass

    # Prepare email content
    subject = f"{brand_name} - OTP Verification"
    body = f"""
    Hello,

    Your One-Time Password (OTP) is: {otp}

    This code is valid for 5 minutes.
    Do not share this code with anyone.

    If you didn't request this OTP, please ignore this email.

    Best regards,
    {brand_name} Team
    """

    return send_email_secure(to_email, subject, body)


def send_password_reset_email(to_email: str, otp: str, brand_name: str = "XYZ Perfumes") -> bool:
    """Send password reset OTP email."""
    subject = f"{brand_name} - Password Reset Request"
    body = f"""
    Hello,

    You requested a password reset for your {brand_name} account.

    Your password reset code is: {otp}

    This code is valid for 5 minutes.
    If you didn't request this, please ignore this email or contact support.

    Best regards,
    {brand_name} Team
    """

    return send_email_secure(to_email, subject, body)


def send_welcome_email(to_email: str, brand_name: str = "XYZ Perfumes") -> bool:
    """Send welcome email after successful verification."""
    subject = f"Welcome to {brand_name}!"
    body = f"""
    Hello,

    Welcome to {brand_name}! Your account has been successfully verified.

    You can now:
    - Browse our exclusive perfume collection
    - Add items to your cart
    - Place orders securely

    Thank you for joining us!

    Best regards,
    {brand_name} Team
    """

    return send_email_secure(to_email, subject, body)


def send_order_confirmation_email(
    to_email: str,
    order_id: int,
    total_amount: float,
    items: list,
    brand_name: str = "XYZ Perfumes"
) -> bool:
    """
    Send order confirmation email after successful order placement.

    Args:
        to_email: Customer email address
        order_id: Order ID
        total_amount: Total order amount
        items: List of order items with name, quantity, price
        brand_name: Brand name for email
    """
    subject = f"{brand_name} - Order #{order_id} Confirmed!"

    # Build items list for email
    items_text = ""
    for item in items:
        items_text += f"  - {item['name']} (Qty: {item['quantity']}) - ₹{item['price']} each\n"

    body = f"""
    Hello,

    Thank you for your order! Your order has been successfully placed.

    Order Details:
    ==============
    Order ID: #{order_id}
    Total Amount: ₹{total_amount:.2f}

    Items Ordered:
    {items_text}

    Payment Status: PAID
    Order Status: PENDING

    We will process your order shortly and update you once it's shipped.

    If you have any questions about your order, please contact our support team.

    Best regards,
    {brand_name} Team
    """

    return send_email_secure(to_email, subject, body)
