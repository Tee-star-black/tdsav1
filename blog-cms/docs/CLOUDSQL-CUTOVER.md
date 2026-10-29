# TeleDoctorSA CMS — Cloud SQL and native publisher cutover

The in-house Publishing Studio is backed by Cloud SQL PostgreSQL only. The former third-party CMS test content is not migrated.

## Existing backend

Project: teledoctor-it
Region: africa-south1
Cloud SQL instance: tdsa-cms-db
Database: tdsa_cms
Restricted PostgreSQL role: tdsa-cms-app
Database password secret: tdsa-cms-db-password
Cloud Run CMS service: tdsa-blog-cms

The initial database schema and administrator account are already in place. Do not rerun the initial schema in a destructive way or reset the live administrator.

## Production CMS configuration

~~~env
NODE_ENV=production
CMS_BACKEND=postgres
CMS_AUTH_BACKEND=postgres
CMS_MEDIA_UPLOADS_ENABLED=false
CMS_SCHEDULE_WORKER_ENABLED=false
CMS_COOKIE_SECURE=true
CMS_PUBLISH_PROJECT=teledoctor-it
CMS_PUBLISH_REGION=africa-south1
CMS_PUBLISH_JOB=
~~~

Keep CMS_PUBLISH_JOB empty until the publisher job is deployed, tested, and the CMS service identity has permission to execute it.

## Publishing pipeline

There is no GitHub publishing workflow. Content changes enqueue a native Cloud Run Job from the Cloud Run service identity. That job queries Cloud SQL directly and generates static files. It defaults to dry run and uploads to DirectAdmin over FTPS only after explicit acceptance. It verifies the live feed after delivery.

For the complete infrastructure setup and rollback steps, see docs/CLOUD-RUN-PUBLISHER.md.

## Verified CMS capabilities

- Staff sign in through PostgreSQL-backed sessions.
- Save, edit and review article drafts.
- Publish text-only articles without media uploads.
- Published content appears in the public API.
- Withdrawing an article removes it from the public API.
- The tagged revision continues to receive 0% production traffic.

## Remaining acceptance tests

1. Build updated CMS/job image from main.
2. Deploy the publisher job in dry-run mode with Cloud SQL connection and database password secret.
3. Execute the job manually and verify generated output, including zero published articles.
4. Grant only the CMS runtime identity roles/run.invoker on the publisher job.
5. Deploy new CMS image under the cms-test tag with 0% normal service traffic.
6. Test publish and unpublish to confirm jobs are queued and finish successfully.
7. Add FTPS credentials via Secret Manager after hosting backup; use a restricted account.
8. Activate transfers only after verifying the remote public_html directory.
9. Confirm live blog, feed, withdrawal and sitemap.
10. Configure Cloud Scheduler to invoke POST /api/internal/publish-due using CMS_INTERNAL_TOKEN.
11. Promote after complete testing and monitoring.

**No real website deploy has been performed by this repository change alone.** A dry-run completion is not a live website update.

Keep image uploads disabled until the GCS IAM and HTTPS media delivery checks pass.
