import os
from flask import Flask, redirect, url_for, session
from config import Config

# Import Blueprints
from routes.auth import auth_bp
from routes.github_auth import github_bp
from routes.dashboard import dashboard_bp
from routes.profile import profile_bp
from routes.admin import admin_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Register Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(github_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(admin_bp)

    @app.route('/')
    def root():
        if 'user_id' in session:
            return redirect(url_for('dashboard.index'))
        return redirect(url_for('auth.login'))

    # Security Response Headers
    @app.after_request
    def set_security_headers(response):
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        return response

    return app

app = create_app()

if __name__ == '__main__':
    print("\n========================================================")
    print(" InterviewAce Production Authentication System")
    print(" Running on: http://localhost:5000/")
    print("========================================================\n")
    app.run(host='0.0.0.0', port=5000, debug=True)
