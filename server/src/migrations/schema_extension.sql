-- Schema Extension - Additional Tables for Production Features
-- Run this after the main schema.sql migration

-- Uploaded files table for file ownership tracking and quarantine
CREATE TABLE IF NOT EXISTS uploaded_files (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_hash VARCHAR(64) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    path VARCHAR(500) NOT NULL,
    is_quarantined BOOLEAN DEFAULT FALSE,
    virus_scan_status ENUM('pending', 'clean', 'infected', 'error') DEFAULT 'pending',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_file_hash (file_hash),
    INDEX idx_quarantined (is_quarantined),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- API keys table
CREATE TABLE IF NOT EXISTS api_keys (
    id VARCHAR(36) PRIMARY KEY,
    key_hash VARCHAR(64) NOT NULL UNIQUE,
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    permissions TEXT,
    rate_limit INT,
    last_used TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_key_hash (key_hash),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);












