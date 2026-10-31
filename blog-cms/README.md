# TeleDoctorSA Publishing Studio

The in-house CMS stores published articles, drafts, categories, staff accounts, sessions, revisions and audit logs in **Cloud SQL PostgreSQL**. It is independent of third-party content management services.

## Architecture

~~~text
Staff -> Publishing Studio on Cloud Run
              |
              +-- Cloud SQL PostgreSQL (content / staff accounts)
              |
              +-- Cloud Run Jobs API (native Google identity)
                            |
                     Publisher Cloud Run Job
                            |
                     Cloud SQL published-only export
                            |
                     Nunjucks static blog build
                            |
                     Verified explicit FTPS to cPanel-hosted website
                            |
                     teledoctorsa.co.za/blog/
~~~

**GitHub Actions is not used to publish or unpublish articles.** GitHub still hosts the source and can run automated code checks; Cloud Build builds the container image.

The publisher job uses Cloud SQL directly, not the private CMS API. No GitHub service identity or public CMS invoker permission is needed.

## Implemented

- Individual administrator/editor/reviewer accounts, hashed passwords, secure sessions
- Draft -> Review -> Published, scheduled publishing and withdrawal
- Clinical approval guardrails
- Categories, SEO metadata, revisions and audit events
- Text-only publication without GCS uploads
- Published-only API and web preview
- Static article templates, feed, search and sitemap
- Cloud Run Job trigger using the CMS's service identity
- Cloud Run Job static exporter / generator / FTPS uploader
- PostgreSQL advisory lock serializing overlapping job executions
- Dry-run by default; failed job submissions displayed to editors
- Local editor, database, workflow and publisher tests

The media bucket and image uploads are deferred. A missing cover image is safe; attached images must have alternative text.

## Local development

~~~sh
cd blog-cms
npm install
npm run dev
~~~

Studio: http://127.0.0.1:8790/prototype/
Preview: http://127.0.0.1:8790/blog/
Health: http://127.0.0.1:8790/api/health

Default development backend: local. Production: PostgreSQL.

~~~env
NODE_ENV=production
CMS_BACKEND=postgres
CMS_AUTH_BACKEND=postgres
CMS_MEDIA_UPLOADS_ENABLED=false
CMS_SCHEDULE_WORKER_ENABLED=false
CMS_COOKIE_SECURE=true

# Enable on the CMS service after a dry-run publisher job has been deployed
CMS_PUBLISH_PROJECT=teledoctor-it
CMS_PUBLISH_REGION=africa-south1
CMS_PUBLISH_JOB=
~~~

## Optional Google Workspace sign-in

Existing staff creation, random temporary passwords, self-service password
changes, and administrator resets continue to work. Google sign-in is
disabled until the OAuth web-client ID, Workspace hosted domain and
`002_google_workspace_identity.sql` migration are configured.

Google tokens are verified on the server and must match an existing active
CMS staff account. Cloud Run IAM / IAP browser access is still a separate
requirement; Google login does not bypass Cloud Run's private-service 403.

See [Google Workspace rollout](docs/GOOGLE-WORKSPACE-SSO.md) for complete
configuration and safe migration instructions.

## Static blog generation

The generation script reads the configured CMS repository. On the publishing Cloud Run Job, CMS_BACKEND MUST be postgres. It reads the latest published articles directly from Cloud SQL.

~~~sh
npm run build:blog
~~~

To build from a local backend in development:

~~~sh
npm run build:blog:local
~~~

## Cloud Run Publisher

The publisher task is packaged in the same CMS Docker image. It runs as a **Cloud Run Job** with a different startup command; it does not start an HTTP server.

~~~sh
npm run publish:job
~~~

The job requires Cloud SQL, PostgreSQL credentials, and optionally explicit FTPS hosting secrets. On cPanel, use a dedicated FTP account restricted to the domain document root. See docs/CLOUD-RUN-PUBLISHER.md for jailed FTP root / support. It defaults to CMS_PUBLISH_DRY_RUN=true, **which never uploads to the website**. The CMS service needs roles/run.invoker on the publisher JOB only once the administrator has configured it.

Read docs/CLOUD-RUN-PUBLISHER.md for the precise deployment commands, IAM and Secret Manager setup, manual dry-run acceptance, FTPS configuration and rollback.

## Verification

~~~sh
npm run check
npm run check:workflow
npm run check:editor
npm run check:auth
npm run check:postgres
npm run check:publisher
npm run build:blog:local
~~~

## Current launch status

- Cloud SQL backend, staff login, article publish and withdrawal were tested on a tagged CMS revision.
- The publishing job code and CI are in this repository; the GCP job itself still needs to be created/deployed.
- An updated CMS revision must remain at 0% normal traffic until the publisher dry run and real hosting delivery have been verified.
- Configure Cloud Scheduler for scheduled publishing separately.
- Cloud Storage image writes remain deferred.

Never confuse a successful article database mutation, a queued publishing job, and a verified live website deployment.
