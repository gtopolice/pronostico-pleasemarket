-- Chiwiwis agent Postgres schema

CREATE TABLE IF NOT EXISTS processed_mentions (
    tweet_id TEXT PRIMARY KEY,
    author_id TEXT NOT NULL,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    action TEXT NOT NULL,
    market_document_id TEXT,
    reply_tweet_id TEXT
);

CREATE TABLE IF NOT EXISTS creator_reputation (
    twitter_id TEXT PRIMARY KEY,
    twitter_handle TEXT,
    tier TEXT NOT NULL DEFAULT 'new',
    markets_created INT NOT NULL DEFAULT 0,
    markets_resolved_on_time INT NOT NULL DEFAULT 0,
    markets_overdue INT NOT NULL DEFAULT 0,
    score NUMERIC(5,2) NOT NULL DEFAULT 50.0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resolve_obligations (
    id SERIAL PRIMARY KEY,
    market_document_id TEXT NOT NULL UNIQUE,
    twitter_id TEXT NOT NULL,
    close_time TIMESTAMPTZ NOT NULL,
    sla_deadline TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    last_reminder_at TIMESTAMPTZ,
    deploy_tweet_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    event_type TEXT NOT NULL,
    twitter_id TEXT,
    tweet_id TEXT,
    payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS claims_posted (
    claim_id TEXT PRIMARY KEY,
    posted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    tweet_id TEXT
);

CREATE TABLE IF NOT EXISTS share_replies (
    author_id TEXT NOT NULL,
    market_document_id TEXT NOT NULL,
    replied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (author_id, market_document_id)
);

CREATE TABLE IF NOT EXISTS wallet_links (
    twitter_id TEXT PRIMARY KEY,
    wallet_address TEXT NOT NULL,
    smart_wallet_address TEXT,
    twitter_handle TEXT,
    referral_code TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS link_tokens (
    token TEXT PRIMARY KEY,
    twitter_id TEXT NOT NULL,
    twitter_handle TEXT,
    tweet_id TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS demo_markets (
    document_id TEXT PRIMARY KEY,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_link_tokens_expires ON link_tokens (expires_at);
CREATE INDEX IF NOT EXISTS idx_resolve_obligations_status ON resolve_obligations (status, sla_deadline);
