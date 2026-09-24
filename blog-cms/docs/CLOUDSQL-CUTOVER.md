# TeleDoctorSA CMS - Cloud SQL Cutover

This checklist is intentionally ordered so the existing Sanity-backed CMS remains available until the new production path has been verified.

## 1. Company access required

Obtain:

- Google Cloud project ID.
- Cloud SQL PostgreSQL instance access.
- Permission to deploy/update Cloud Run.
- Permission to create or use a Google Cloud Storage bucket.
- Permission to create Cloud Scheduler jobs.
- DNS access for `cms.teledoctorsa.co.za`.
- cPanel/FTP credentials for the existing public site.
- GitHub repository permission to add Actions secrets and variables.

## 2. Cloud SQL

Create or select the production PostgreSQL database and a least-privilege CMS database user.

Cloud Run can connect using the Cloud SQL Unix socket. A typical runtime configuration uses:

```env
CMS_BACKEND=postgres
CMS_AUTH_BACKEND=postgres
PGHOST=/cloudsql/PROJECT_ID:REGION:INSTANCE
PGPORT=5432
PGDATABASE=teledoctorsa_cms
PGUSER=<cms database user>
PGPASSWORD=<Secret Manager reference at deploy time>
```

Before starting the CMS:

```bash
npm run db:migrate
```

The migration creates tables for articles, categories, media metadata, users, sessions, article revisions and audit events.

## 3. Cloud Storage

Create/select a bucket intended for public editorial media.

Configure:

```env
CMS_MEDIA_BACKEND=gcs
GCS_BUCKET=<bucket>
GCS_PUBLIC_BASE_URL=https://storage.googleapis.com/<bucket>
GCS_PREFIX=blog
```

The Cloud Run service account needs object write permission. Published blog images must be publicly readable through the configured public base URL or an equivalent CDN URL.

## 4. Migrate existing Sanity content

Keep Sanity available during the cutover. Configure both the Sanity read credentials and the new PostgreSQL/GCS settings, then run:

```bash
npm run migrate:sanity-to-postgres
```

This migrates categories, editorial media and articles. Existing slugs are retained.

After migration, verify:

- article count;
- draft/review/scheduled/published states;
- cover images;
- categories;
- public article URLs.

Do not delete the Sanity project during this stage.

## 5. Create production staff accounts

With `CMS_AUTH_BACKEND=postgres`:

```bash
npm run user:create -- --email publishing@teledoctorsa.co.za --name "TeleDoctorSA Publishing" --role admin
```

The temporary password is printed once. Sign in and change it through **Account & staff**.

Create editor/reviewer accounts through the Publishing Studio after the first administrator is active.

## 6. Cloud Run

Deploy the container from `blog-cms/Dockerfile`.

Production runtime should include:

```env
CMS_BACKEND=postgres
CMS_AUTH_BACKEND=postgres
CMS_MEDIA_BACKEND=gcs
CMS_HOST=0.0.0.0
PORT=8080
CMS_COOKIE_SECURE=true
CMS_ALLOWED_ORIGINS=https://cms.teledoctorsa.co.za,https://teledoctorsa.co.za,https://www.teledoctorsa.co.za
CMS_SCHEDULE_WORKER_ENABLED=false
CMS_INTERNAL_TOKEN=<Secret Manager value>
CMS_DEPLOY_WEBHOOK_URL=https://api.github.com/repos/Tee-star-black/tdsav1/dispatches
CMS_DEPLOY_WEBHOOK_TOKEN=<Secret Manager value>
```

Keep passwords/tokens in Secret Manager or deployment secrets, not in the repository.

## 7. Scheduled publishing

The CMS exposes:

```
POST /api/internal/publish-due
X-CMS-Internal-Token: <CMS_INTERNAL_TOKEN>
```

Configure Cloud Scheduler to call it on the desired cadence. Five minutes is sufficient for normal editorial scheduling.

The in-process timer should be disabled in Cloud Run using:

```env
CMS_SCHEDULE_WORKER_ENABLED=false
```

This avoids relying on a container remaining awake.

## 8. Production blog build

The GitHub production workflow can build from the public CMS API instead of connecting to Cloud SQL.

Set repository variable:

```
CMS_PUBLIC_API_URL=https://cms.teledoctorsa.co.za
```

The workflow will:

1. fetch published article data from the CMS API;
2. generate `/blog/` and article pages;
3. update feed/search JSON and sitemap;
4. deploy generated assets to cPanel;
5. verify the live blog.

Until the variable is configured, the workflow retains the temporary Sanity fallback.

## 9. cPanel deployment secrets

Configure:

- `TDSA_FTP_HOST`
- `TDSA_FTP_USERNAME`
- `TDSA_FTP_PASSWORD`
- `TDSA_FTP_REMOTE_ROOT`

No CMS database credentials belong in GitHub Actions because the build reads the CMS public API.

## 10. DNS and HTTPS

Point `cms.teledoctorsa.co.za` to the production Cloud Run front door/load balancer and provision HTTPS.

Verify:

- `https://cms.teledoctorsa.co.za` loads the login screen;
- cookies are marked Secure;
- `https://cms.teledoctorsa.co.za/api/health` reports `backend: postgres` and `authBackend: postgres`;
- `https://teledoctorsa.co.za/blog/` remains public.

## 11. End-to-end acceptance

Run one complete production lifecycle:

1. sign in;
2. create draft;
3. upload cover image;
4. submit/review;
5. publish;
6. verify GitHub deployment;
7. verify article on the live blog;
8. feature it and verify TeleMedia;
9. edit and republish;
10. schedule a test;
11. verify Cloud Scheduler publishes it;
12. withdraw/delete it and verify the public site updates.

## 12. Retire Sanity

Only after the Cloud SQL path has passed acceptance:

- set `CMS_BACKEND=postgres` permanently;
- remove Sanity runtime variables from Cloud Run;
- remove the temporary Sanity fallback from the GitHub workflow when desired;
- retain an export/backup until the cutover is formally accepted.

Sanity can then be archived or removed without affecting the CMS.
