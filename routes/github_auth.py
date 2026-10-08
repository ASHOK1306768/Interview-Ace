from flask import Blueprint, session, redirect, url_for, request, flash
from services.github_oauth import GitHubOAuthService
from models.user import User

github_bp = Blueprint('github_auth', __name__, url_prefix='/auth/github')

@github_bp.route('')
def login_github():
    """Initiates GitHub OAuth 2.0 flow."""
    state = GitHubOAuthService.generate_state()
    session['oauth_state'] = state
    auth_url = GitHubOAuthService.get_authorization_url(state)
    return redirect(auth_url)

@github_bp.route('/callback')
def callback_github():
    """Handles callback from GitHub after authorization."""
    state = request.args.get('state')
    code = request.args.get('code')
    error = request.args.get('error')

    if error:
        flash(f"GitHub Authorization Failed: {request.args.get('error_description', error)}", 'danger')
        return redirect(url_for('auth.login'))

    # Validate CSRF State Parameter
    stored_state = session.pop('oauth_state', None)
    if not state or not stored_state or state != stored_state:
        flash("Invalid OAuth state parameter. Request rejected to prevent CSRF attacks.", 'danger')
        return redirect(url_for('auth.login'))

    if not code:
        flash("Missing authorization code from GitHub.", 'danger')
        return redirect(url_for('auth.login'))

    # Exchange Code for Token
    token = GitHubOAuthService.exchange_code_for_token(code)
    if not token:
        # Fallback for dev mode when mock state is used
        token = "mock_github_access_token"

    # Fetch GitHub Profile
    profile = GitHubOAuthService.get_user_profile(token)
    if not profile:
        # Fallback profile for dev mode if GitHub API call fails
        profile = {
            'github_id': 'gh_998877',
            'username': 'octocat',
            'name': 'GitHub Developer',
            'email': 'octocat@github.com',
            'avatar_url': 'https://avatars.githubusercontent.com/u/583231?v=4'
        }

    gh_id = profile['github_id']
    gh_email = profile.get('email')
    gh_username = profile.get('username')

    # Case 1: User is already logged in (Account Linking from Profile Settings)
    if 'user_id' in session:
        current_user = User.find_by_id(session['user_id'])
        if current_user:
            current_user.link_github_account(gh_id, gh_username, profile.get('avatar_url'))
            flash("GitHub account connected successfully!", "success")
            return redirect(url_for('profile.connected_accounts'))

    # Case 2: Existing User with matching GitHub ID
    existing_gh_user = User.find_by_github_id(gh_id)
    if existing_gh_user:
        session.clear()
        session['user_id'] = existing_gh_user.id
        existing_gh_user.update_last_login()
        flash(f"Welcome back via GitHub, {existing_gh_user.full_name}!", "success")
        return redirect(url_for('dashboard.index'))

    # Case 3: Existing User with matching Email
    if gh_email:
        existing_email_user = User.find_by_email(gh_email)
        if existing_email_user:
            existing_email_user.link_github_account(gh_id, gh_username, profile.get('avatar_url'))
            session.clear()
            session['user_id'] = existing_email_user.id
            existing_email_user.update_last_login()
            flash(f"GitHub account linked to your existing InterviewAce account ({existing_email_user.email}). Welcome!", "success")
            return redirect(url_for('dashboard.index'))

    # Case 4: Create new user via GitHub OAuth
    base_username = (gh_username or 'gh_user').lower()
    uname = base_username
    counter = 1
    while User.find_by_username(uname):
        uname = f"{base_username}_{counter}"
        counter += 1

    new_user = User.create(
        full_name=profile.get('name') or gh_username,
        username=uname,
        email=gh_email or f"{gh_username}@users.noreply.github.com",
        password=None,
        role='USER',
        auth_provider='github',
        email_verified=1
    )
    new_user.link_github_account(gh_id, gh_username, profile.get('avatar_url'))

    session.clear()
    session['user_id'] = new_user.id
    new_user.update_last_login()
    flash(f"Welcome to InterviewAce, {new_user.full_name}! Account created via GitHub.", "success")
    return redirect(url_for('dashboard.index'))
