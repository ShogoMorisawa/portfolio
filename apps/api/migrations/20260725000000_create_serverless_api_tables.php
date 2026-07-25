<?php

declare(strict_types=1);

use Phinx\Migration\AbstractMigration;

final class CreateServerlessApiTables extends AbstractMigration
{
    public function up(): void
    {
        $this->execute(<<<'SQL'
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(255),
    tags TEXT[],
    description TEXT,
    body JSONB NOT NULL,
    thumbnail_url TEXT,
    published_at TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS letters (
    id SERIAL PRIMARY KEY,
    visitor_id TEXT,
    name TEXT,
    email TEXT,
    message TEXT NOT NULL,
    reply TEXT,
    replied_at TIMESTAMP WITHOUT TIME ZONE,
    reply_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_sessions (
    id BIGSERIAL PRIMARY KEY,
    family_id UUID NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash CHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    used_at TIMESTAMP WITHOUT TIME ZONE,
    revoked_at TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS admin_sessions_family_id_idx ON admin_sessions (family_id);
CREATE INDEX IF NOT EXISTS admin_sessions_expires_at_idx ON admin_sessions (expires_at);

CREATE TABLE IF NOT EXISTS letterboxes (
    id BIGSERIAL PRIMARY KEY,
    token_hash CHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS letterboxes_expires_at_idx ON letterboxes (expires_at);

ALTER TABLE letters ADD COLUMN IF NOT EXISTS letterbox_id BIGINT REFERENCES letterboxes(id) ON DELETE SET NULL;
ALTER TABLE letters ALTER COLUMN visitor_id DROP NOT NULL;
CREATE INDEX IF NOT EXISTS letters_letterbox_reply_idx
    ON letters (letterbox_id, reply_read, replied_at)
    WHERE reply IS NOT NULL;

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    actor_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(80) NOT NULL,
    subject_type VARCHAR(80),
    subject_id VARCHAR(120),
    request_id VARCHAR(120),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON audit_logs (created_at DESC);
SQL);
    }

    public function down(): void
    {
        $this->execute('DROP TABLE IF EXISTS audit_logs');
        $this->execute('ALTER TABLE letters DROP COLUMN IF EXISTS letterbox_id');
        $this->execute('DROP TABLE IF EXISTS letterboxes');
        $this->execute('DROP TABLE IF EXISTS admin_sessions');
    }
}
