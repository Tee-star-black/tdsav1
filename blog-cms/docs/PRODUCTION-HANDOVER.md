# TeleDoctorSA Publishing Studio — Production handover

## Components

```text
Staff -> Publishing Studio (Cloud Run)
               |
               +-- Cloud SQL PostgreSQL (articles, categories, users,
               |   sessions, revisions, audit logs)
               |
               +-- GCS images (deferred; uploads disabled)
               |
               +-- Published-only JSON API
                             |
                        GitHub Actions
                             |
                       Static blog build
                             |
                     Host Africa / cPanel
                             |
                     teledoctorsa.co.za/blog/
```

The platform operates independently of third-party CMS products. Existing source articles elsewhere were test-only and are not migrated.

## Validated in Cloud SQL

- The restricted `tdsa-cms-app` role has operational read/write table permissions.
- The initial database migration `001_cms_core.sql` is applied.
- The `publishing@teledoctorsa.co.za` administrator is active.
- Administrator login, article draft creation/editing and refresh persistence were tested.
- Category creation and Draft -> Review -> Draft workflow were tested.
- The current Cloud SQL test article has recorded revision history.

These manual checks were done on a test-tagged Cloud Run revision. A full end-to-end **production website** launch has not yet been verified.

## Production configuration

```env
NODE_ENV=production
CMS_BACKEND=postgres
CMS_AUTH_BACKEND=postgres
CMS_MEDIA_UPLOADS_ENABLED=false
CMS_SCHEDULE_WORKER_ENABLED=false
CMS_COOKIE_SECURE=true
```

Pass Cloud SQL credentials and internal publishing token through Secret Manager. Configure access origins, HTTPS and a production domain.

## Publishing and scheduling

- Public content comes from `/api/public/articles`.
- The static site is generated with `npm run build:blog` and requires `CMS_PUBLIC_API_URL`.
- Published changes can trigger `CMS_DEPLOY_WEBHOOK_URL` with its secured token.
- Use Cloud Scheduler to invoke `POST /api/internal/publish-due` and maintain `CMS_SCHEDULE_WORKER_ENABLED=false` on Cloud Run.

GitHub must receive only the public published-content API data, not database credentials.

## Image deferral

Cover images are optional for publication. The static templates and browser preview handle text-only posts. Image uploads are disabled by default in production until bucket permissions, HTTPS delivery and end-to-end testing are completed. To resume uploads later, configure storage and explicitly enable `CMS_MEDIA_UPLOADS_ENABLED=true` on a tested revision.

## Go-live gates

1. Build and deploy updated Cloud Run revision to test tag, still 0% main traffic.
2. Test text-only publish/edit/withdrawal, staff auth and Cloud SQL revisions.
3. Configure GitHub repository publishing dispatch, public CMS API URL and cPanel deployment.
4. Test static build output on the website, including article SEO and feed.
5. Configure Cloud Scheduler and test scheduled articles.
6. Configure CMS domain, HTTPS and production monitoring.
7. Promote a tested revision and retain rollback ability.

Do not delete or overwrite existing Cloud SQL data. No legacy article migration is required.
