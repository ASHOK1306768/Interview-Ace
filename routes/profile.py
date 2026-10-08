from flask import Blueprint, render_template, request, redirect, url_for, flash
from routes.auth_decorators import login_required

profile_bp = Blueprint('profile', __name__, url_prefix='/profile')

@profile_bp.route('')
@login_required
def index(current_user):
    return render_template('profile.html', user=current_user)

@profile_bp.route('/connected-accounts')
@login_required
def connected_accounts(current_user):
    return render_template('profile.html', user=current_user, active_tab='connected')

@profile_bp.route('/disconnect-github', methods=['POST'])
@login_required
def disconnect_github(current_user):
    success, message = current_user.unlink_github_account()
    if success:
        flash(message, 'success')
    else:
        flash(message, 'danger')
    return redirect(url_for('profile.connected_accounts'))
