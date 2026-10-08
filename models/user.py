from services.db_service import DatabaseService
from werkzeug.security import generate_password_hash, check_password_hash
import datetime

class User:
    def __init__(self, data):
        self.id = data.get('id')
        self.full_name = data.get('full_name')
        self.username = data.get('username')
        self.email = data.get('email')
        self.password_hash = data.get('password_hash')
        self.email_verified = bool(data.get('email_verified', False))
        self.role = data.get('role', 'USER')
        self.github_id = data.get('github_id')
        self.github_username = data.get('github_username')
        self.profile_image = data.get('profile_image')
        self.auth_provider = data.get('auth_provider', 'local')
        self.account_status = data.get('account_status', 'pending_verification')
        self.created_at = data.get('created_at')
        self.updated_at = data.get('updated_at')
        self.last_login = data.get('last_login')

    @classmethod
    def find_by_id(cls, user_id):
        query = "SELECT * FROM users WHERE id = %s"
        data = DatabaseService.execute_query(query, (user_id,), fetchone=True)
        return cls(data) if data else None

    @classmethod
    def find_by_email(cls, email):
        query = "SELECT * FROM users WHERE email = %s"
        data = DatabaseService.execute_query(query, (email.lower().strip(),), fetchone=True)
        return cls(data) if data else None

    @classmethod
    def find_by_username(cls, username):
        query = "SELECT * FROM users WHERE username = %s"
        data = DatabaseService.execute_query(query, (username.lower().strip(),), fetchone=True)
        return cls(data) if data else None

    @classmethod
    def find_by_email_or_username(cls, identifier):
        identifier = identifier.lower().strip()
        query = "SELECT * FROM users WHERE email = %s OR username = %s"
        data = DatabaseService.execute_query(query, (identifier, identifier), fetchone=True)
        return cls(data) if data else None

    @classmethod
    def find_by_github_id(cls, github_id):
        query = "SELECT * FROM users WHERE github_id = %s"
        data = DatabaseService.execute_query(query, (str(github_id),), fetchone=True)
        return cls(data) if data else None

    @classmethod
    def create(cls, full_name, username, email, password, role='USER', auth_provider='local', email_verified=0):
        password_hash = generate_password_hash(password, method='pbkdf2:sha256') if password else None
        status = 'active' if email_verified else 'pending_verification'
        
        query = """
        INSERT INTO users 
        (full_name, username, email, password_hash, email_verified, role, auth_provider, account_status)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        user_id = DatabaseService.execute_query(
            query, 
            (full_name, username.lower().strip(), email.lower().strip(), password_hash, email_verified, role, auth_provider, status)
        )
        return cls.find_by_id(user_id)

    def verify_password(self, password):
        if not self.password_hash:
            return False
        return check_password_hash(self.password_hash, password)

    def mark_email_verified(self):
        query = "UPDATE users SET email_verified = 1, account_status = 'active' WHERE id = %s"
        DatabaseService.execute_query(query, (self.id,))
        self.email_verified = True
        self.account_status = 'active'

    def update_password(self, new_password):
        new_hash = generate_password_hash(new_password, method='pbkdf2:sha256')
        query = "UPDATE users SET password_hash = %s WHERE id = %s"
        DatabaseService.execute_query(query, (new_hash, self.id))
        self.password_hash = new_hash

    def link_github_account(self, github_id, github_username, profile_image=None):
        query = """
        UPDATE users 
        SET github_id = %s, github_username = %s, profile_image = %s, auth_provider = 'linked' 
        WHERE id = %s
        """
        DatabaseService.execute_query(query, (str(github_id), github_username, profile_image, self.id))
        self.github_id = str(github_id)
        self.github_username = github_username
        self.profile_image = profile_image
        self.auth_provider = 'linked'

    def unlink_github_account(self):
        # Prevent unlinking if password is missing (so user doesn't lock themselves out)
        if not self.password_hash:
            return False, "Cannot disconnect GitHub account because you have not set a local password."
        
        query = "UPDATE users SET github_id = NULL, github_username = NULL, auth_provider = 'local' WHERE id = %s"
        DatabaseService.execute_query(query, (self.id,))
        self.github_id = None
        self.github_username = None
        self.auth_provider = 'local'
        return True, "GitHub account disconnected successfully."

    def update_last_login(self):
        now = datetime.datetime.now()
        query = "UPDATE users SET last_login = %s WHERE id = %s"
        DatabaseService.execute_query(query, (now, self.id))
        self.last_login = now

    def is_admin(self):
        return self.role == 'ADMIN'
