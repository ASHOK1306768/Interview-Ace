from flask import Blueprint, render_template, request, redirect, url_for, flash, session
from models.user import User
from services.otp_service import OTPService
from services.email_service import EmailService
from services.db_service import DatabaseService
import re
import datetime

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

def is_valid_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    if 'user_id' in session:
        return redirect(url_for('dashboard.index'))

    if request.method == 'POST':
        full_name = request.form.get('full_name', '').strip()
        username = request.form.get('username', '').strip()
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        confirm_password = request.form.get('confirm_password', '')

        # Frontend & Backend Input Validation
        if not full_name or not username or not email or not password:
            flash('All fields are required.', 'danger')
            return render_template('register.html', full_name=full_name, username=username, email=email)

        if not is_valid_email(email):
            flash('Please enter a valid email address.', 'danger')
            return render_template('register.html', full_name=full_name, username=username, email=email)

        if len(username) < 3:
            flash('Username must be at least 3 characters long.', 'danger')
            return render_template('register.html', full_name=full_name, username=username, email=email)

        if len(password) < 6:
            flash('Password must be at least 6 characters long.', 'danger')
            return render_template('register.html', full_name=full_name, username=username, email=email)

        if password != confirm_password:
            flash('Passwords do not match.', 'danger')
            return render_template('register.html', full_name=full_name, username=username, email=email)

        # Check existing email / username
        if User.find_by_email(email):
            flash('An account with this email address is already registered.', 'danger')
            return render_template('register.html', full_name=full_name, username=username, email=email)

        if User.find_by_username(username):
            flash('Username is already taken. Please choose another username.', 'danger')
            return render_template('register.html', full_name=full_name, username=username, email=email)

        # Create user (email_verified=0, account_status='pending_verification')
        new_user = User.create(
            full_name=full_name,
            username=username,
            email=email,
            password=password,
            email_verified=0
        )

        if new_user:
            # Generate OTP & Send Email
            otp_code = OTPService.create_verification_otp(new_user.id)
            EmailService.send_verification_otp(new_user.email, new_user.full_name, otp_code)

            session['pending_user_id'] = new_user.id
            flash('Account created! A 6-digit verification code has been sent to your email.', 'success')
            return redirect(url_for('auth.verify_otp'))
        else:
            flash('An error occurred while creating your account. Please try again.', 'danger')

    return render_template('register.html')


@auth_bp.route('/verify-otp', methods=['GET', 'POST'])
def verify_otp():
    pending_id = session.get('pending_user_id')
    if not pending_id:
        flash('No pending email verification found. Please register or log in.', 'warning')
        return redirect(url_for('auth.login'))

    user = User.find_by_id(pending_id)
    if not user:
        session.pop('pending_user_id', None)
        return redirect(url_for('auth.register'))

    if request.method == 'POST':
        submitted_otp = request.form.get('otp', '').strip()

        if not submitted_otp or len(submitted_otp) != 6:
            flash('Please enter the complete 6-digit OTP code.', 'danger')
            return render_template('verify_otp.html', email=user.email)

        # Verify OTP code
        success, message = OTPService.verify_email_otp(user.id, submitted_otp)

        if success:
            user.mark_email_verified()
            session.pop('pending_user_id', None)
            
            # Log user in
            session['user_id'] = user.id
            user.update_last_login()

            flash('Email verified successfully! Welcome to InterviewAce.', 'success')
            return redirect(url_for('dashboard.index'))
        else:
            flash(message, 'danger')

    return render_template('verify_otp.html', email=user.email)


@auth_bp.route('/resend-otp', methods=['POST'])
def resend_otp():
    pending_id = session.get('pending_user_id')
    if not pending_id:
        flash('Session expired. Please log in again.', 'warning')
        return redirect(url_for('auth.login'))

    user = User.find_by_id(pending_id)
    if user:
        otp_code = OTPService.create_verification_otp(user.id)
        EmailService.send_verification_otp(user.email, user.full_name, otp_code)
        flash('A new 6-digit OTP code has been sent to your email.', 'info')
    
    return redirect(url_for('auth.verify_otp'))


@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if 'user_id' in session:
        return redirect(url_for('dashboard.index'))

    if request.method == 'POST':
        identifier = request.form.get('identifier', '').strip()
        password = request.form.get('password', '')

        if not identifier or not password:
            flash('Please provide both email/username and password.', 'danger')
            return render_template('login.html', identifier=identifier)

        # Brute Force Protection Rate Limit Check
        client_ip = request.remote_addr or '127.0.0.1'
        recent_failures = DatabaseService.execute_query(
            "SELECT count(*) as cnt FROM login_attempts WHERE ip_address = %s AND success = 0",
            (client_ip,), fetchone=True
        )
        
        fail_count = recent_failures.get('cnt', 0) if isinstance(recent_failures, dict) else recent_failures
        if fail_count and fail_count >= 5:
            flash('Too many failed login attempts. Please wait 5 minutes before trying again.', 'danger')
            return render_template('login.html', identifier=identifier)

        # Find user by Email or Username
        user = User.find_by_email_or_username(identifier)

        # STRICT PASSWORD CHECKING
        if not user or not user.verify_password(password):
            # Log failure
            DatabaseService.execute_query(
                "INSERT INTO login_attempts (ip_address, email_or_username, success) VALUES (%s, %s, 0)",
                (client_ip, identifier)
            )
            flash('Incorrect password or email/username. Access denied.', 'danger')
            return render_template('login.html', identifier=identifier, has_error=True)

        # Log successful attempt
        DatabaseService.execute_query(
            "INSERT INTO login_attempts (ip_address, email_or_username, success) VALUES (%s, %s, 1)",
            (client_ip, identifier)
        )

        # Check if email is verified
        if not user.email_verified:
            session['pending_user_id'] = user.id
            otp_code = OTPService.create_verification_otp(user.id)
            EmailService.send_verification_otp(user.email, user.full_name, otp_code)
            flash('Please verify your email address to log in. A new OTP has been sent.', 'warning')
            return redirect(url_for('auth.verify_otp'))

        # Create Authenticated Session
        session.clear()
        session['user_id'] = user.id
        user.update_last_login()

        flash(f'Welcome back, {user.full_name}!', 'success')
        
        if user.is_admin():
            return redirect(url_for('admin.index'))
        return redirect(url_for('dashboard.index'))

    return render_template('login.html')


@auth_bp.route('/logout')
def logout():
    session.clear()
    flash('You have been logged out successfully.', 'info')
    return redirect(url_for('auth.login'))


@auth_bp.route('/forgot-password', methods=['GET', 'POST'])
def forgot_password():
    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        user = User.find_by_email(email)

        if user:
            reset_token, otp_code = OTPService.create_password_reset_token(user.id)
            EmailService.send_password_reset_otp(user.email, user.full_name, otp_code)
            session['reset_user_id'] = user.id
            session['reset_token'] = reset_token
            flash('A password reset verification code has been sent to your email.', 'info')
            return redirect(url_for('auth.reset_password'))

        # Generic response to prevent user enumeration
        flash('If an account exists with that email, a password reset code has been sent.', 'info')
        return redirect(url_for('auth.reset_password'))

    return render_template('forgot_password.html')


@auth_bp.route('/reset-password', methods=['GET', 'POST'])
def reset_password():
    user_id = session.get('reset_user_id')
    if not user_id:
        flash('Password reset session expired. Please request a new code.', 'warning')
        return redirect(url_for('auth.forgot_password'))

    user = User.find_by_id(user_id)

    if request.method == 'POST':
        submitted_otp = request.form.get('otp', '').strip()
        new_password = request.form.get('new_password', '')
        confirm_password = request.form.get('confirm_password', '')

        if len(new_password) < 6:
            flash('New password must be at least 6 characters long.', 'danger')
            return render_template('reset_password.html')

        if new_password != confirm_password:
            flash('Passwords do not match.', 'danger')
            return render_template('reset_password.html')

        success, message = OTPService.verify_password_reset_otp(user.id, submitted_otp)

        if success:
            user.update_password(new_password)
            session.pop('reset_user_id', None)
            session.pop('reset_token', None)
            flash('Password reset successful! You can now log in with your new password.', 'success')
            return redirect(url_for('auth.login'))
        else:
            flash(message, 'danger')

    return render_template('reset_password.html')
