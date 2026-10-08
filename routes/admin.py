from flask import Blueprint, render_template, request, redirect, url_for, flash
from routes.auth_decorators import admin_required
from services.db_service import DatabaseService
from models.user import User

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')

@admin_bp.route('')
@admin_required
def index(current_user):
    # Fetch user directory for admin dashboard
    raw_users = DatabaseService.execute_query("SELECT * FROM users ORDER BY id DESC", fetchall=True)
    user_list = [User(u) for u in raw_users] if raw_users else [current_user]

    metrics = {
        'total_users': len(user_list),
        'admin_count': len([u for u in user_list if u.role == 'ADMIN']),
        'user_count': len([u for u in user_list if u.role == 'USER']),
        'verified_count': len([u for u in user_list if u.email_verified])
    }

    return render_template('admin/index.html', user=current_user, users=user_list, metrics=metrics)

@admin_bp.route('/toggle-role/<int:target_user_id>', methods=['POST'])
@admin_required
def toggle_role(current_user, target_user_id):
    target = User.find_by_id(target_user_id)
    if not target:
        flash('User not found.', 'danger')
        return redirect(url_for('admin.index'))

    # Prevent admin from revoking their own admin role
    if target.id == current_user.id:
        flash('You cannot change your own admin role.', 'warning')
        return redirect(url_for('admin.index'))

    new_role = 'USER' if target.role == 'ADMIN' else 'ADMIN'
    DatabaseService.execute_query("UPDATE users SET role = %s WHERE id = %s", (new_role, target.id))
    flash(f"Updated {target.full_name}'s role to {new_role}.", 'success')
    return redirect(url_for('admin.index'))
