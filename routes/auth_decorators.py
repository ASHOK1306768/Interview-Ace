from functools import wraps
from flask import session, redirect, url_for, flash, abort
from models.user import User

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = session.get('user_id')
        if not user_id:
            flash('Please log in to access this page.', 'warning')
            return redirect(url_for('auth.login'))
        
        current_user = User.find_by_id(user_id)
        if not current_user:
            session.clear()
            flash('Session invalid. Please log in again.', 'warning')
            return redirect(url_for('auth.login'))
            
        return f(current_user, *args, **kwargs)
    return decorated_function

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = session.get('user_id')
        if not user_id:
            flash('Admin authentication required.', 'warning')
            return redirect(url_for('auth.login'))
        
        current_user = User.find_by_id(user_id)
        if not current_user or not current_user.is_admin():
            flash('Access denied. Administrator privileges required.', 'danger')
            return redirect(url_for('dashboard.index'))
            
        return f(current_user, *args, **kwargs)
    return decorated_function
