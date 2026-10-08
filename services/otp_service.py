import secrets
import datetime
from services.db_service import DatabaseService

class OTPService:
    @staticmethod
    def generate_otp_code():
        """Generates a secure 6-digit numeric OTP."""
        return str(secrets.randbelow(900000) + 100000)

    @staticmethod
    def create_verification_otp(user_id, validity_minutes=10):
        """Generates and stores an OTP for email verification."""
        otp_code = OTPService.generate_otp_code()
        expires_at = datetime.datetime.now() + datetime.timedelta(minutes=validity_minutes)

        query = """
        INSERT INTO email_verification_otps (user_id, otp_code, expires_at)
        VALUES (%s, %s, %s)
        """
        DatabaseService.execute_query(query, (user_id, otp_code, expires_at))
        return otp_code

    @staticmethod
    def verify_email_otp(user_id, submitted_otp):
        """Verifies the submitted email verification OTP code."""
        query = """
        SELECT * FROM email_verification_otps 
        WHERE user_id = %s AND is_used = 0 
        ORDER BY id DESC LIMIT 1
        """
        otp_record = DatabaseService.execute_query(query, (user_id,), fetchone=True)

        if not otp_record:
            return False, "No active OTP request found. Please request a new code."

        # Check max attempts limit (5 attempts)
        if otp_record['attempts_count'] >= 5:
            return False, "Maximum attempt limit exceeded. Please request a new verification code."

        # Check expiration
        now = datetime.datetime.now()
        expires_at = otp_record['expires_at']
        if isinstance(expires_at, str):
            expires_at = datetime.datetime.strptime(expires_at, "%Y-%m-%d %H:%M:%S")

        if now > expires_at:
            return False, "Verification OTP has expired. Please request a new code."

        # Check OTP match
        if otp_record['otp_code'] != submitted_otp.strip():
            # Increment attempts
            update_query = "UPDATE email_verification_otps SET attempts_count = attempts_count + 1 WHERE id = %s"
            DatabaseService.execute_query(update_query, (otp_record['id'],))
            attempts_left = 4 - otp_record['attempts_count']
            return False, f"Incorrect OTP code. {max(0, attempts_left)} attempts remaining."

        # Mark OTP as used
        mark_query = "UPDATE email_verification_otps SET is_used = 1 WHERE id = %s"
        DatabaseService.execute_query(mark_query, (otp_record['id'],))

        return True, "Email verified successfully."

    @staticmethod
    def create_password_reset_token(user_id, validity_minutes=15):
        """Generates a secure password reset token and OTP."""
        reset_token = secrets.token_urlsafe(32)
        otp_code = OTPService.generate_otp_code()
        expires_at = datetime.datetime.now() + datetime.timedelta(minutes=validity_minutes)

        query = """
        INSERT INTO password_resets (user_id, reset_token, otp_code, expires_at)
        VALUES (%s, %s, %s, %s)
        """
        DatabaseService.execute_query(query, (user_id, reset_token, otp_code, expires_at))
        return reset_token, otp_code

    @staticmethod
    def verify_password_reset_otp(user_id, submitted_otp):
        """Verifies the password reset OTP."""
        query = """
        SELECT * FROM password_resets 
        WHERE user_id = %s AND otp_code = %s AND is_used = 0 
        ORDER BY id DESC LIMIT 1
        """
        record = DatabaseService.execute_query(query, (user_id, submitted_otp.strip()), fetchone=True)

        if not record:
            return False, "Incorrect or expired reset OTP code."

        now = datetime.datetime.now()
        expires_at = record['expires_at']
        if isinstance(expires_at, str):
            expires_at = datetime.datetime.strptime(expires_at, "%Y-%m-%d %H:%M:%S")

        if now > expires_at:
            return False, "Password reset code has expired. Please request a new one."

        # Mark token used
        DatabaseService.execute_query("UPDATE password_resets SET is_used = 1 WHERE id = %s", (record['id'],))
        return True, record['reset_token']
