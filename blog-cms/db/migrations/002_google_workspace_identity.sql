-- Bind an approved CMS staff account to the immutable Google Workspace subject.
-- Apply as the CMS schema owner before enabling Google sign-in.
ALTER TABLE cms_users ADD COLUMN IF NOT EXISTS google_sub TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS cms_users_google_sub_unique ON cms_users(google_sub) WHERE google_sub IS NOT NULL;
