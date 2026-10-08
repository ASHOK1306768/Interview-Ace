import secrets
import requests
from config import Config

class GitHubOAuthService:
    @staticmethod
    def generate_state():
        """Generates a cryptographically secure state token to prevent CSRF attacks."""
        return secrets.token_hex(16)

    @staticmethod
    def get_authorization_url(state):
        """Returns the official GitHub OAuth authorization URL."""
        if not Config.GITHUB_CLIENT_ID:
            # Fallback URL if client ID not set
            return f"https://github.com/login/oauth/authorize?client_id=sample_client_id&redirect_uri={Config.GITHUB_REDIRECT_URI}&state={state}&scope=read:user%20user:email"

        params = {
            'client_id': Config.GITHUB_CLIENT_ID,
            'redirect_uri': Config.GITHUB_REDIRECT_URI,
            'scope': 'read:user user:email',
            'state': state
        }
        req = requests.Request('GET', 'https://github.com/login/oauth/authorize', params=params)
        return req.prepare().url

    @staticmethod
    def exchange_code_for_token(code):
        """Exchanges the authorization code for a GitHub access token."""
        url = 'https://github.com/login/oauth/access_token'
        headers = {'Accept': 'application/json'}
        data = {
            'client_id': Config.GITHUB_CLIENT_ID,
            'client_secret': Config.GITHUB_CLIENT_SECRET,
            'code': code,
            'redirect_uri': Config.GITHUB_REDIRECT_URI
        }
        
        try:
            res = requests.post(url, headers=headers, data=data, timeout=10)
            if res.status_code == 200:
                json_data = res.json()
                return json_data.get('access_token')
        except Exception as e:
            print(f"[GitHubOAuthService Error] Token exchange failed: {e}")
        return None

    @staticmethod
    def get_user_profile(access_token):
        """Retrieves user profile information from GitHub API."""
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Accept': 'application/vnd.github.v3+json'
        }
        try:
            res = requests.get('https://api.github.com/user', headers=headers, timeout=10)
            if res.status_code == 200:
                profile = res.json()

                # Get user emails if email is private in primary profile
                if not profile.get('email'):
                    email_res = requests.get('https://api.github.com/user/emails', headers=headers, timeout=10)
                    if email_res.status_code == 200:
                        emails = email_res.json()
                        primary_email = next((e['email'] for e in emails if e.get('primary')), None)
                        if primary_email:
                            profile['email'] = primary_email

                return {
                    'github_id': str(profile.get('id')),
                    'username': profile.get('login'),
                    'name': profile.get('name') or profile.get('login'),
                    'email': profile.get('email'),
                    'avatar_url': profile.get('avatar_url')
                }
        except Exception as e:
            print(f"[GitHubOAuthService Error] Profile fetch failed: {e}")
        return None
