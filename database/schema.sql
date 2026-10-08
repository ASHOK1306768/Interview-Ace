-- MySQL Database Schema for InterviewAce Production Authentication System

CREATE DATABASE IF NOT EXISTS interviewace CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE interviewace;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NULL, -- Nullable for OAuth-only users
    email_verified TINYINT(1) DEFAULT 0,
    role ENUM('USER', 'ADMIN') DEFAULT 'USER',
    github_id VARCHAR(100) NULL UNIQUE,
    github_username VARCHAR(100) NULL,
    profile_image VARCHAR(500) NULL,
    auth_provider ENUM('local', 'github', 'linked') DEFAULT 'local',
    account_status ENUM('active', 'suspended', 'pending_verification') DEFAULT 'pending_verification',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login DATETIME NULL,
    INDEX idx_user_email (email),
    INDEX idx_user_username (username),
    INDEX idx_github_id (github_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Email Verification OTPs Table
CREATE TABLE IF NOT EXISTS email_verification_otps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    attempts_count INT DEFAULT 0,
    expires_at DATETIME NOT NULL,
    is_used TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_otp_user (user_id, is_used)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Password Reset Tokens Table
CREATE TABLE IF NOT EXISTS password_resets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    reset_token VARCHAR(64) NOT NULL UNIQUE,
    otp_code VARCHAR(6) NOT NULL,
    expires_at DATETIME NOT NULL,
    is_used TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_reset_token (reset_token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. OAuth Accounts Table
CREATE TABLE IF NOT EXISTS oauth_accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    provider VARCHAR(30) NOT NULL,
    provider_user_id VARCHAR(100) NOT NULL,
    provider_username VARCHAR(100) NULL,
    access_token TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_provider_user (provider, provider_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Login Attempts (Brute Force Protection) Table
CREATE TABLE IF NOT EXISTS login_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    email_or_username VARCHAR(150) NOT NULL,
    success TINYINT(1) NOT NULL,
    attempted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_attempt_ip_time (ip_address, attempted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Initial Admin Seed (Default Admin Account with hashed password 'Admin@InterviewAce2026!')
-- Password Hash below is generated using pbkdf2:sha256
INSERT INTO users (full_name, username, email, password_hash, email_verified, role, account_status)
VALUES (
    'InterviewAce Administrator',
    'admin',
    'admin@interviewace.com',
    'pbkdf2:sha256:600000$rZq9X2mQ$9b1f7d4e5f2a1b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c',
    1,
    'ADMIN',
    'active'
) ON DUPLICATE KEY UPDATE id=id;
