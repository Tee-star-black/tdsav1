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

The production build must fetch the PostgreSQL-backed CMS API. Cloud Run is private, so the GitHub Actions workflow obtains a short-lived **Google-signed identity token** with GitHub Workload Identity Federation, not a stored service account key. No anonymous Cloud Run access is needed.

Configure repository **Settings > Secrets and variables > Actions > Variables**:

| Variable | Value |
| --- | --- |
| `CMS_PUBLIC_API_URL` | HTTPS endpoint of the CMS revision to read. Use the `cms-test` tag URL only for a manual build-only test; set to the production service/domain URL after promotion. |
| `CMS_RUN_AUDIENCE` | Cloud Run **service** URL from `gcloud run services describe tdsa-blog-cms --region africa-south1 --project teledoctor-it --format='value(status.url)'`. This is **not** the traffic-tag URL. |
| `CMS_GCP_WIF_PROVIDER` | Full Workload Identity Provider resource, such as `projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-actions/providers/PROVIDER_ID`. |
| `CMS_GCP_INVOKER_SA` | Service account permitted to invoke the CMS Cloud Run service and be impersonated by this GitHub repository. |

For service-account-mediated federation:
- Bind the GitHub repository principal set to the chosen service account with `roles/iam.workloadIdentityUser`.
- Give that service account `roles/run.invoker` on `tdsa-blog-cms` (not on every Cloud Run service).
- Scope the WIF provider to `Tee-star-black/tdsav1`; do not use a JSON service account key.

Run **Actions > Publish Blog to Production > Run workflow** with **deploy unchecked** first. This verifies authorized content retrieval and the static build without FTP deployment. The article source is the `cms-test` tagged revision until switched to the production service. Google Cloud Run validates a token with the stable service URL as its audience even when requesting a revision-specific traffic-tag URL. The token is never committed to the repository or printed in the build logs.

Manual runs only deploy when `deploy` is checked. A trusted CMS `blog_publish` repository dispatch will deploy automatically after the webhook is configured. GitHub will refuse to build when the required WIF variables are missing or the CMS endpoint cannot be reached.



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
