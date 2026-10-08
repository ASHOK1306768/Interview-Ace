from flask import Blueprint, render_template
from routes.auth_decorators import login_required

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/dashboard')

@dashboard_bp.route('')
@login_required
def index(current_user):
    return render_template('dashboard.html', user=current_user)
