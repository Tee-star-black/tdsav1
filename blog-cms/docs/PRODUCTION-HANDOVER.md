# TeleDoctorSA Publishing Studio - Production Handover

## Final architecture

The target production path is:

```
cms.teledoctorsa.co.za
        |
        v
Google Cloud Run
        |
        +--> Cloud SQL PostgreSQL
        |      articles, categories, users, sessions,
        |      revisions and audit records
        |
        +--> Google Cloud Storage
               editorial images

Published content
        |
        v
CMS public read API
        |
        v
GitHub Actions static build
        |
        v
Host Africa / cPanel
        |
        v
teledoctorsa.co.za/blog/
```

Sanity remains available only as a temporary migration/fallback source until the Cloud SQL cutover has been verified.

## Public content

- Blog & Insights: `https://teledoctorsa.co.za/blog/`
- Article URLs: `https://teledoctorsa.co.za/blog/<slug>/`
- TeleMedia Suite remains the media/press destination and can surface featured Blog & Insights stories.

The generated blog includes canonical URLs, article metadata/schema, search/filter data, feed JSON and sitemap entries.

## Publishing Studio

Recommended URL:

`https://cms.teledoctorsa.co.za`

The Studio supports:

- individual email/password sign-in;
- HttpOnly sessions;
- admin/editor/reviewer roles;
- Account & staff management for administrators;
- password changes;
- drafts;
- review status;
- clinical-review publication guardrails;
- categories;
- media upload/reuse;
- featured stories;
- scheduling;
- SEO title/description;
- article preview;
- optimistic concurrency protection;
- article revision snapshots in PostgreSQL;
- production audit events;
- automatic live-site rebuild requests.

## Production database

Use:

```env
CMS_BACKEND=postgres
CMS_AUTH_BACKEND=postgres
```

Run schema migrations before launch:

```bash
npm run db:migrate
```

The database schema is maintained in `blog-cms/db/migrations/`.

## Production media

Use:

```env
CMS_MEDIA_BACKEND=gcs
GCS_BUCKET=<bucket>
GCS_PUBLIC_BASE_URL=<public bucket/CDN URL>
```

Media bytes are stored in Cloud Storage. Cloud SQL stores only media metadata and URLs.

## Staff accounts

Bootstrap the first production admin on the configured production database:

```bash
npm run user:create -- --email publishing@teledoctorsa.co.za --name "TeleDoctorSA Publishing" --role admin
```

After that, administrators can create and remove staff accounts from **Account & staff** in the Publishing Studio.

## Scheduled publishing

Cloud Run should not be relied on as an always-awake timer.

Set:

```env
CMS_SCHEDULE_WORKER_ENABLED=false
CMS_INTERNAL_TOKEN=<secret>
```

Use Cloud Scheduler to invoke:

```
POST /api/internal/publish-due
```

with the configured internal-token header.

## Live blog deployment

The production GitHub workflow can fetch published content from:

```
https://cms.teledoctorsa.co.za/api/public/articles
```

Set repository variable:

```
CMS_PUBLIC_API_URL=https://cms.teledoctorsa.co.za
```

The workflow then builds the static public blog and deploys the generated files to the existing cPanel host. GitHub does not need direct Cloud SQL credentials.

## Existing-content migration

Once Cloud SQL and the GCS bucket are available:

```bash
npm run db:migrate
npm run migrate:sanity-to-postgres
```

Do not retire Sanity until content counts, media, drafts, published stories and public URLs have been checked.

See `docs/CLOUDSQL-CUTOVER.md` for the ordered go-live procedure.

## External access still required

Code cannot complete these account-side operations by itself:

- company Cloud SQL instance permission;
- GCP project/service-account deployment permission;
- Cloud Storage bucket permission;
- Cloud Scheduler job creation;
- DNS for `cms.teledoctorsa.co.za`;
- cPanel/FTP credentials;
- GitHub Actions secrets/variables;
- creation/confirmation of official company email addresses.

Everything else should be prepared in the repository before production cutover.
