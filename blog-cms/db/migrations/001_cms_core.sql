CREATE TABLE IF NOT EXISTS cms_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cms_media (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  url TEXT NOT NULL,
  alt TEXT NOT NULL DEFAULT '',
  tag TEXT NOT NULL DEFAULT 'Uploaded',
  storage_key TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cms_articles (
  id TEXT PRIMARY KEY,
  revision TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL DEFAULT '',
  body_text TEXT NOT NULL DEFAULT '',
  editorial_status TEXT NOT NULL DEFAULT 'Draft',
  category_id TEXT REFERENCES cms_categories(id) ON DELETE RESTRICT,
  author_name TEXT NOT NULL DEFAULT 'TeleDoctorSA Editorial',
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  clinical_review_required BOOLEAN NOT NULL DEFAULT FALSE,
  clinical_review_status TEXT NOT NULL DEFAULT 'not_required',
  cover_media_id TEXT REFERENCES cms_media(id) ON DELETE SET NULL,
  cover_url TEXT NOT NULL DEFAULT '',
  cover_alt TEXT NOT NULL DEFAULT '',
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  seo_title TEXT NOT NULL DEFAULT '',
  seo_description TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS cms_articles_status_idx ON cms_articles(editorial_status);
CREATE INDEX IF NOT EXISTS cms_articles_published_idx ON cms_articles(published_at);
CREATE INDEX IF NOT EXISTS cms_articles_updated_idx ON cms_articles(updated_at);

CREATE TABLE IF NOT EXISTS cms_users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'editor',
  password_salt TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cms_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES cms_users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS cms_sessions_user_idx ON cms_sessions(user_id);
CREATE INDEX IF NOT EXISTS cms_sessions_expiry_idx ON cms_sessions(expires_at);

CREATE TABLE IF NOT EXISTS cms_article_revisions (
  id TEXT PRIMARY KEY,
  article_id TEXT NOT NULL REFERENCES cms_articles(id) ON DELETE CASCADE,
  revision TEXT NOT NULL,
  snapshot_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT
);

CREATE INDEX IF NOT EXISTS cms_article_revisions_article_idx ON cms_article_revisions(article_id,created_at DESC);

CREATE TABLE IF NOT EXISTS cms_audit_log (
  id TEXT PRIMARY KEY,
  actor_user_id TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS cms_audit_log_created_idx ON cms_audit_log(created_at DESC);
