import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import Config

class EmailService:
    @staticmethod
    def send_email(to_email, subject, html_content):
        """Sends an HTML email using SMTP (Gmail SMTP for dev/production)."""
        # If SMTP username is not configured, print to console for dev testing
        if not Config.MAIL_USERNAME or not Config.MAIL_PASSWORD:
            print("\n==========================================")
            print(f"[EmailService Dev Mode] Email to: {to_email}")
            print(f"Subject: {subject}")
            print("------------------------------------------")
            print(html_content)
            print("==========================================\n")
            return True

        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = Config.MAIL_DEFAULT_SENDER or Config.MAIL_USERNAME
            msg['To'] = to_email

            part = MIMEText(html_content, 'html')
            msg.attach(part)

            server = smtplib.SMTP(Config.MAIL_SERVER, Config.MAIL_PORT)
            if Config.MAIL_USE_TLS:
                server.starttls()
            
            server.login(Config.MAIL_USERNAME, Config.MAIL_PASSWORD)
            server.sendmail(Config.MAIL_DEFAULT_SENDER or Config.MAIL_USERNAME, [to_email], msg.as_string())
            server.quit()
            return True
        except Exception as e:
            print(f"[EmailService Error] Failed to send email: {e}")
            return False

    @staticmethod
    def send_verification_otp(to_email, user_name, otp_code):
        subject = f"{otp_code} is your InterviewAce Verification Code"
        html = f"""
        <div style="font-family: Arial, sans-serif; background-color: #0a0b10; color: #ffffff; padding: 30px; border-radius: 12px;">
            <h2 style="color: #00f2fe; margin-bottom: 10px;">InterviewAce</h2>
            <p style="font-size: 14px; color: #cccccc;">Hello {user_name},</p>
            <p style="font-size: 14px; color: #cccccc;">Thank you for creating an account with InterviewAce. Please use the verification code below to verify your email address:</p>
            <div style="background: rgba(127, 0, 255, 0.2); border: 1px solid #7f00ff; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #00f2fe;">{otp_code}</span>
            </div>
            <p style="font-size: 12px; color: #888888;">This OTP is valid for 10 minutes. Do not share this code with anyone.</p>
        </div>
        """
        return EmailService.send_email(to_email, subject, html)

    @staticmethod
    def send_password_reset_otp(to_email, user_name, otp_code):
        subject = f"{otp_code} is your InterviewAce Password Reset Code"
        html = f"""
        <div style="font-family: Arial, sans-serif; background-color: #0a0b10; color: #ffffff; padding: 30px; border-radius: 12px;">
            <h2 style="color: #00f2fe; margin-bottom: 10px;">InterviewAce Password Reset</h2>
            <p style="font-size: 14px; color: #cccccc;">Hello {user_name},</p>
            <p style="font-size: 14px; color: #cccccc;">We received a request to reset your password. Use the verification code below to reset your password:</p>
            <div style="background: rgba(241, 7, 163, 0.2); border: 1px solid #f107a3; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #ffffff;">{otp_code}</span>
            </div>
            <p style="font-size: 12px; color: #888888;">This code is valid for 10 minutes. If you did not request a password reset, please ignore this email.</p>
        </div>
        """
        return EmailService.send_email(to_email, subject, html)
