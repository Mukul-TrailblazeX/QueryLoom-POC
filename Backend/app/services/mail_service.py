from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType

from app.core.config import get_settings

settings = get_settings()


conf = ConnectionConfig(
    MAIL_USERNAME=settings.mail_username,
    MAIL_PASSWORD=settings.mail_password,
    MAIL_FROM=settings.mail_from,
    MAIL_PORT=settings.mail_port,
    MAIL_SERVER=settings.mail_server,
    MAIL_STARTTLS=settings.mail_starttls,
    MAIL_SSL_TLS=settings.mail_ssl_tls,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=settings.mail_validate_certs,
)


async def send_password_reset_otp(email: str, full_name: str, otp_code: str, expiry_minutes: int) -> None:
    message = MessageSchema(
        subject="Your Kriyanto password reset code",
        recipients=[email],
        body=(
            f"Hi {full_name},\n\n"
            f"Your Kriyanto password reset OTP is: {otp_code}\n"
            f"This code will expire in {expiry_minutes} minutes.\n\n"
            "If you did not request this reset, you can ignore this email."
        ),
        subtype=MessageType.plain,
    )
    fm = FastMail(conf)
    await fm.send_message(message)
