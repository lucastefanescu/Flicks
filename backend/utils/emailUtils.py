#pylint: skip-file
import os
from email.message import EmailMessage
import aiosmtplib

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USERNAME = os.getenv("GMAIL_USERNAME")
SMTP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD")

async def sendResetEmail(email: str, reset_token: str):
    #Change Link to the deployment server URL. Keep /reset-password/{reset_token} endpoint.
    reset_link = f"http://localhost:3000/resetPassword/{reset_token}"

    message = EmailMessage()
    message["From"] = SMTP_USERNAME
    message["To"] = email
    message["Subject"] = "Flicks Password Reset Request"
    message.set_content(f"Click the following link to reset your password: {reset_link}")

    try:
        await aiosmtplib.send(
            message,
            hostname=SMTP_SERVER,
            port=SMTP_PORT,
            username=SMTP_USERNAME,
            password=SMTP_PASSWORD,
            start_tls=True,
        )
        return {"message": "Password reset email sent successfully"}
    except Exception as e:
        raise Exception(f"Error sending email: {str(e)}")
