# TeleDoctorSA CMS — PostgreSQL-only launch

This checklist covers the in-house Publishing Studio. **No legacy CMS content migration is necessary**: older articles were test posts and are intentionally excluded.

## 1. Database and roles

Cloud SQL instance: `tdsa-cms-db`, region `africa-south1`, database `tdsa_cms`, restricted application user `tdsa-cms-app`.

```env
CMS_BACKEND=postgres
CMS_AUTH_BACKEND=postgres
PGHOST=/cloudsql/teledoctor-it:africa-south1:tdsa-cms-db
PGPORT=5432
PGDATABASE=tdsa_cms
PGUSER=tdsa-cms-app
```

Use Secret Manager for `PGPASSWORD`. The user has SELECT, INSERT, UPDATE and DELETE grants to all operational CMS tables, and the administrator account has been verified. Existing test drafts and their revisions should not be discarded.

## 2. Cloud Run

- Project: `teledoctor-it`
- Service: `tdsa-blog-cms`
- Region: `africa-south1`
- Keep the new revision on its test tag (0% normal traffic) until acceptance completes.
- Runtime env: `NODE_ENV=production`, `CMS_BACKEND=postgres`, `CMS_AUTH_BACKEND=postgres`, `CMS_COOKIE_SECURE=true`, `CMS_SCHEDULE_WORKER_ENABLED=false`.
- Configure `CMS_ALLOWED_ORIGINS` and secure Cloud Run invocation/domain ingress as appropriate.
- Keep secrets in Secret Manager; never commit passwords, tokens or database URLs.

## 3. Images deferred

Use `CMS_MEDIA_UPLOADS_ENABLED=false` until the existing GCS bucket has verified write permissions and image delivery works over HTTPS. The Studio supports **text-only publishing**. Attached cover images require alternative text.

Do not depend on legacy CDN URLs: the new CMS does not import old test articles. Do not enable upload controls before storage is accepted.

## 4. Verify test revision

1. Verify `GET /api/health` returns `backend=postgres`, `authBackend=postgres` and `mediaUploadsEnabled=false`.
2. Sign in with the existing administrator; confirm drafts/revisions are preserved.
3. Create a new article with category, excerpt (20+ characters), body (80+ characters), no cover image.
4. Publish it, verify `GET /api/public/articles`, and inspect `/blog/<slug>/` preview without a broken image.
5. Move it back to Draft and verify public feed withdrawal.
6. Confirm media POST is disabled while image infrastructure is postponed.
7. Test staff-role enforcement, password management and the review queue.

## 5. Publishing to the website

The production build must fetch the PostgreSQL-backed CMS API. Configure `CMS_PUBLIC_API_URL` in GitHub Actions to an authenticated-as-designed, reachable public read API URL.

```sh
cd blog-cms
npm run build:blog
```

This fetches the published-only endpoint, builds `/blog/`, the feeds and sitemap, and fails if no CMS API URL is configured. No fallback data source is allowed. Configure the deployment webhook (GitHub repository dispatch), its token, and the existing cPanel/FTP secrets. Verify live deployment and article withdrawal before cutover.

## 6. Scheduled publishing

Cloud Run must use `CMS_SCHEDULE_WORKER_ENABLED=false`. Configure Cloud Scheduler to make authenticated calls to `POST /api/internal/publish-due` with `X-CMS-Internal-Token`. Verify one scheduled publication end-to-end.

## 7. Domain and final cutover

- Provision `cms.teledoctorsa.co.za` and HTTPS.
- Confirm secure session cookies and correct identity/RBAC.
- Promote a tested revision to service traffic only after the production blog pipeline and security checks pass.
- Check monitoring, logs, backup/restore and rollback strategy.
- Image media storage and delivery remain a separately tracked later milestone.

No external CMS project or dataset needs to be deleted as part of this software cutover.
