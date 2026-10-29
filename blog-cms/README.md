# TeleDoctorSA Publishing Studio

TeleDoctorSA's in-house editorial system. Content and staff accounts are stored in **Cloud SQL PostgreSQL**, not in a third-party CMS.

## Architecture

```text
Publishing Studio and API (Cloud Run)
     |
     +-- Cloud SQL PostgreSQL
     |     articles, categories, users, sessions, revisions and audit logs
     |
     +-- Google Cloud Storage (media; deferred)
     |
Published-only CMS API (/api/public/articles)
     |
GitHub Actions static site build
     |
Host Africa / cPanel -> https://teledoctorsa.co.za/blog/
```

This repository does **not** import older third-party CMS test posts. Existing PostgreSQL content and the administrator account remain intact.

## Current feature set

- Secure administrator/editor/reviewer staff logins and sessions
- Drafts, review queue, approval checks, scheduled and published articles
- Categories, featured stories, SEO metadata, revisions and audit logs
- Article-only publishing while GCS image delivery is deferred
- Conditional cover images: if an image is attached, alternative text is required
- Public API, preview, generated blog pages, search, feeds and sitemap
- Publish webhook and Cloud Scheduler-compatible endpoint
- Media upload adapter, disabled in production by default until verified

## Development

```sh
cd blog-cms
npm install
npm run dev
```

Studio: `http://127.0.0.1:8790/prototype/`

Preview: `http://127.0.0.1:8790/blog/`

Health: `http://127.0.0.1:8790/api/health`

Local development uses `CMS_BACKEND=local` and file authentication. For PostgreSQL, set `CMS_BACKEND=postgres`, `CMS_AUTH_BACKEND=postgres`, and the usual `PG*` settings or `DATABASE_URL`. In production, use **PostgreSQL only**.

## Production settings

```env
NODE_ENV=production
CMS_BACKEND=postgres
CMS_AUTH_BACKEND=postgres
CMS_MEDIA_UPLOADS_ENABLED=false
CMS_SCHEDULE_WORKER_ENABLED=false
CMS_COOKIE_SECURE=true
```

The media adapter may remain configured as GCS, but publishing without a cover image works. The production upload endpoint responds with HTTP 503 until `CMS_MEDIA_UPLOADS_ENABLED=true` is explicitly set after the storage and public delivery acceptance checks.

Run database migrations when deploying new schema versions:

```sh
npm run db:migrate
```

The existing admin account should be preserved; do not bootstrap another.

## Public blog generation

The public website is built from the PostgreSQL-backed CMS API. Production builds require:

```env
CMS_PUBLIC_API_URL=https://cms.teledoctorsa.co.za
```

Then:

```sh
npm run build:blog
```

This fetches `/api/public/articles` and generates the static blog. It intentionally **fails** if the API URL is missing rather than building old test data.

To build from a local development repository:

```sh
npm run build:blog:local
```

This is for tests and development only. The public-site GitHub workflow must be configured with a reachable HTTPS CMS API endpoint before launch.

## Validation

```sh
npm run check
npm run check:workflow
npm run check:editor
npm run check:auth
npm run check:postgres
npm run build:blog:local
```

## Launch work still required

The Cloud Run test revision is intentionally not promoted to production traffic. Complete:

1. Verify text-only publication and the public API on the new revision.
2. Configure the website build to fetch content from the CMS public API.
3. Configure the publishing dispatch webhook and website deployment credentials.
4. Set up Cloud Scheduler for scheduled publishing.
5. Configure the production CMS domain, HTTPS, access rules and monitoring.
6. Later, complete GCS write permissions, public image delivery and media upload testing.

See `docs/CLOUDSQL-CUTOVER.md` and `docs/PRODUCTION-HANDOVER.md` for launch details.
