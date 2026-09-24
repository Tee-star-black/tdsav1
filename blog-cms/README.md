# TeleDoctorSA Blog CMS

A connected publishing system for TeleDoctorSA Blog & Insights.

## Goal

Give non-technical staff one workflow to sign in, write, review, schedule and publish website content without editing production HTML, touching Git or manually creating article pages.

## Target production architecture

```text
Publishing Studio / CMS API
https://cms.teledoctorsa.co.za
        |
        +--> Cloud SQL PostgreSQL
        |      content, staff accounts, sessions,
        |      revisions and audit events
        |
        +--> Google Cloud Storage
               editorial images

Published-only CMS API
        |
        v
GitHub Actions static build
        |
        v
Host Africa / cPanel
        |
        v
https://teledoctorsa.co.za/blog/
```

Sanity remains supported only as a temporary migration/fallback backend until the Cloud SQL cutover is accepted.

## Implemented

- Individual staff email/password accounts
- HttpOnly sessions
- Admin/editor/reviewer roles
- Account & staff administration UI
- Admin temporary-password generation and reset
- Staff self-service password change
- Draft, review, published and scheduled article states
- Clinical-review publication guardrail
- Categories
- Media library
- Google Cloud Storage media adapter
- Local media adapter for development
- PostgreSQL / Cloud SQL content repository
- File/local development repository
- Temporary Sanity repository adapter
- Optimistic concurrency protection
- PostgreSQL article revision snapshots
- PostgreSQL audit trail for production mutations
- SEO title/description fields
- Featured-story support for TeleMedia
- Public published-only API
- Official `/blog/` page
- Individual `/blog/<slug>/` article pages
- Static production generator
- Search/category filtering
- Article schema and canonical metadata
- feed/search JSON
- sitemap generation
- GitHub deployment dispatch
- cPanel production publish workflow
- Cloud Scheduler-compatible scheduled-publication endpoint
- Sanity → PostgreSQL/GCS migration utility
- Automated local, auth, editor, Sanity-contract and PostgreSQL tests

## Local development

```powershell
cd blog-cms
npm install
npm run dev
```

Open:

- Studio: `http://127.0.0.1:8790/prototype/`
- Blog: `http://127.0.0.1:8790/blog/`
- API health: `http://127.0.0.1:8790/api/health`

Local development defaults to:

```env
CMS_BACKEND=local
CMS_AUTH_BACKEND=file
CMS_MEDIA_BACKEND=local
```

## Cloud SQL mode

Configure PostgreSQL using `DATABASE_URL` or standard `PG*` variables, then:

```powershell
npm run db:migrate
```

Set:

```env
CMS_BACKEND=postgres
CMS_AUTH_BACKEND=postgres
```

For production media:

```env
CMS_MEDIA_BACKEND=gcs
GCS_BUCKET=<bucket>
GCS_PUBLIC_BASE_URL=<public bucket or CDN base URL>
```

## Bootstrap administrator

After the production database has been migrated:

```powershell
npm run user:create -- --email publishing@teledoctorsa.co.za --name "TeleDoctorSA Publishing" --role admin
```

The generated temporary password is printed once. Further staff accounts can be managed from **Account & staff** inside the Studio.

## Existing Sanity content migration

With both source Sanity access and the target PostgreSQL/GCS configuration available:

```powershell
npm run migrate:sanity-to-postgres
```

Do not retire Sanity until the migrated content and public URLs have been verified.

## Public blog build

From the selected repository:

```powershell
npm run build:blog
```

For production, GitHub can instead fetch published content through the CMS public API:

```powershell
$env:CMS_PUBLIC_API_URL="https://cms.teledoctorsa.co.za"
npm run content:fetch-public
npm run build:blog:from-file
```

This means GitHub never needs Cloud SQL credentials.

## Scheduled publishing

The CMS supports an internal scheduler endpoint:

```
POST /api/internal/publish-due
X-CMS-Internal-Token: <configured secret>
```

Use Cloud Scheduler in production and set:

```env
CMS_SCHEDULE_WORKER_ENABLED=false
```

The built-in timer remains useful for local development.

## Verification

```powershell
npm run check
npm run check:workflow
npm run check:editor
npm run check:auth
npm run check:postgres
npm run check:sanity
```

The Sanity check remains while Sanity is still the migration fallback.

## Important files

- `prototype/` - Publishing Studio
- `public-preview/` - API-driven public blog used locally
- `server/postgres-repository.mjs` - Cloud SQL content adapter
- `server/postgres-auth.mjs` - Cloud SQL staff authentication
- `server/media-store.mjs` - local/GCS media storage
- `db/migrations/` - production database schema
- `scripts/migrate-db.mjs` - schema migration runner
- `scripts/migrate-sanity-to-postgres.mjs` - content/media cutover utility
- `scripts/fetch-public-content.mjs` - production build content fetcher
- `templates/` - generated public blog templates
- `docs/PRODUCTION-HANDOVER.md` - architecture/handover
- `docs/CLOUDSQL-CUTOVER.md` - ordered production go-live procedure

## Remaining external dependencies

The repository cannot supply company permissions or credentials. Production still requires access to Cloud SQL, Cloud Run, a GCS bucket, Cloud Scheduler, DNS, cPanel/FTP and GitHub Actions configuration.

Everything that can reasonably be prepared before those credentials are available lives in this branch.
