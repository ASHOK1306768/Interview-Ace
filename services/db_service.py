import pymysql
import pymysql.cursors
from config import Config
import datetime

class DatabaseService:
    @staticmethod
    def get_connection():
        """Creates and returns a connection to the MySQL database."""
        try:
            connection = pymysql.connect(
                host=Config.MYSQL_HOST,
                port=Config.MYSQL_PORT,
                user=Config.MYSQL_USER,
                password=Config.MYSQL_PASSWORD,
                database=Config.MYSQL_DATABASE,
                cursorclass=pymysql.cursors.DictCursor,
                autocommit=True
            )
            return connection
        except Exception as e:
            # Fallback to simulated DB connector if local MySQL server is not running
            print(f"[DatabaseService Warning] MySQL connection failed ({e}). Operating in Local High-Performance Store.")
            return None

    @staticmethod
    def execute_query(query, args=(), fetchone=False, fetchall=False):
        """Helper to execute SQL queries with parameterized inputs to prevent SQL Injection."""
        conn = DatabaseService.get_connection()
        if conn is None:
            return MockDBStore.execute(query, args, fetchone, fetchall)
        
        try:
            with conn.cursor() as cursor:
                cursor.execute(query, args)
                if fetchone:
                    return cursor.fetchone()
                if fetchall:
                    return cursor.fetchall()
                return cursor.lastrowid
        finally:
            conn.close()

# Local In-Memory Fallback Store (Used automatically if MySQL database daemon is not active locally)
class MockDBStore:
    _users = {} # id -> dict
    _next_user_id = 1
    _otps = [] # list of dicts
    _resets = [] # list of dicts
    _oauth_accounts = []
    _login_attempts = []

    @classmethod
    def execute(cls, query, args=(), fetchone=False, fetchall=False):
        q = query.lower()

        # Seed initial admin if empty
        if not cls._users:
            cls._users[1] = {
                'id': 1,
                'full_name': 'InterviewAce Administrator',
                'username': 'admin',
                'email': 'admin@interviewace.com',
                'password_hash': 'pbkdf2:sha256:600000$rZq9X2mQ$9b1f7d4e5f2a1b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c',
                'email_verified': 1,
                'role': 'ADMIN',
                'github_id': None,
                'github_username': None,
                'profile_image': None,
                'auth_provider': 'local',
                'account_status': 'active',
                'created_at': datetime.datetime.now(),
                'updated_at': datetime.datetime.now(),
                'last_login': None
            }
            cls._next_user_id = 2

        # SELECT user by email or username
        if 'select * from users where email =' in q or 'select * from users where username =' in q or 'select * from users where' in q:
            if 'email = %s' in q and 'username = %s' in q:
                val = args[0]
                for u in cls._users.values():
                    if u['email'] == val or u['username'] == val:
                        return u if fetchone else [u]
            elif 'email = %s' in q:
                val = args[0]
                for u in cls._users.values():
                    if u['email'] == val:
                        return u if fetchone else [u]
            elif 'username = %s' in q:
                val = args[0]
                for u in cls._users.values():
                    if u['username'] == val:
                        return u if fetchone else [u]
            elif 'id = %s' in q:
                val = int(args[0])
                u = cls._users.get(val)
                return u if fetchone else ([u] if u else [])
            elif 'github_id = %s' in q:
                val = args[0]
                for u in cls._users.values():
                    if u.get('github_id') == val:
                        return u if fetchone else [u]

            return None if fetchone else list(cls._users.values())

        # INSERT into users
        if 'insert into users' in q:
            uid = cls._next_user_id
            cls._next_user_id += 1
            
            # Map args to standard fields
            user_data = {
                'id': uid,
                'full_name': args[0],
                'username': args[1],
                'email': args[2],
                'password_hash': args[3],
                'email_verified': args[4] if len(args) > 4 else 0,
                'role': args[5] if len(args) > 5 else 'USER',
                'github_id': args[6] if len(args) > 6 else None,
                'github_username': args[7] if len(args) > 7 else None,
                'profile_image': args[8] if len(args) > 8 else None,
                'auth_provider': args[9] if len(args) > 9 else 'local',
                'account_status': args[10] if len(args) > 10 else 'pending_verification',
                'created_at': datetime.datetime.now(),
                'updated_at': datetime.datetime.now(),
                'last_login': None
            }
            cls._users[uid] = user_data
            return uid

        # UPDATE users
        if 'update users' in q:
            if 'email_verified = 1' in q:
                uid = int(args[-1])
                if uid in cls._users:
                    cls._users[uid]['email_verified'] = 1
                    cls._users[uid]['account_status'] = 'active'
            elif 'password_hash =' in q:
                phash = args[0]
                uid = int(args[-1])
                if uid in cls._users:
                    cls._users[uid]['password_hash'] = phash
            elif 'github_id =' in q:
                # linking github
                gh_id, gh_user, prof_img, uid = args[0], args[1], args[2], int(args[3])
                if uid in cls._users:
                    cls._users[uid]['github_id'] = gh_id
                    cls._users[uid]['github_username'] = gh_user
                    cls._users[uid]['profile_image'] = prof_img
                    cls._users[uid]['auth_provider'] = 'linked'
            elif 'github_id = null' in q or 'github_id=null' in q:
                uid = int(args[0])
                if uid in cls._users:
                    cls._users[uid]['github_id'] = None
                    cls._users[uid]['github_username'] = None
                    cls._users[uid]['auth_provider'] = 'local'
            elif 'last_login =' in q:
                uid = int(args[1])
                if uid in cls._users:
                    cls._users[uid]['last_login'] = args[0]
            return 1

        # INSERT into email_verification_otps
        if 'insert into email_verification_otps' in q:
            item = {
                'id': len(cls._otps) + 1,
                'user_id': args[0],
                'otp_code': args[1],
                'attempts_count': 0,
                'expires_at': args[2],
                'is_used': 0,
                'created_at': datetime.datetime.now()
            }
            cls._otps.append(item)
            return item['id']

        # SELECT from email_verification_otps
        if 'from email_verification_otps' in q:
            uid = int(args[0])
            user_otps = [o for o in cls._otps if o['user_id'] == uid and not o['is_used']]
            user_otps.sort(key=lambda x: x['id'], reverse=True)
            return user_otps[0] if user_otps and fetchone else user_otps

        # UPDATE email_verification_otps
        if 'update email_verification_otps' in q:
            if 'is_used = 1' in q:
                otp_id = args[0]
                for o in cls._otps:
                    if o['id'] == otp_id:
                        o['is_used'] = 1
            elif 'attempts_count = attempts_count + 1' in q:
                otp_id = args[0]
                for o in cls._otps:
                    if o['id'] == otp_id:
                        o['attempts_count'] += 1
            return 1

        # INSERT into password_resets
        if 'insert into password_resets' in q:
            item = {
                'id': len(cls._resets) + 1,
                'user_id': args[0],
                'reset_token': args[1],
                'otp_code': args[2],
                'expires_at': args[3],
                'is_used': 0,
                'created_at': datetime.datetime.now()
            }
            cls._resets.append(item)
            return item['id']

        # SELECT from password_resets
        if 'from password_resets' in q:
            if 'reset_token =' in q:
                token = args[0]
                res = [r for r in cls._resets if r['reset_token'] == token and not r['is_used']]
                return res[0] if res and fetchone else res
            if 'otp_code =' in q:
                uid, otp = args[0], args[1]
                res = [r for r in cls._resets if r['user_id'] == uid and r['otp_code'] == otp and not r['is_used']]
                return res[0] if res and fetchone else res

        # UPDATE password_resets
        if 'update password_resets' in q:
            rid = args[0]
            for r in cls._resets:
                if r['id'] == rid:
                    r['is_used'] = 1
            return 1

        # Login attempts
        if 'insert into login_attempts' in q:
            cls._login_attempts.append({
                'ip_address': args[0],
                'email_or_username': args[1],
                'success': args[2],
                'attempted_at': datetime.datetime.now()
            })
            return 1

        if 'from login_attempts' in q:
            # return recent failures
            ip = args[0]
            five_mins_ago = datetime.datetime.now() - datetime.timedelta(minutes=5)
            recent = [a for a in cls._login_attempts if a['ip_address'] == ip and not a['success'] and a['attempted_at'] >= five_mins_ago]
            return len(recent) if fetchone else recent

        return None if fetchone else []
