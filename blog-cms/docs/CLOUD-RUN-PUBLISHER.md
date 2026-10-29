# Direct CMS -> Cloud Run Job -> TeleDoctorSA website

GitHub remains the source-code repository and may run CI tests, but it is no longer involved when an editor publishes an article.

## Architecture

1. Staff publish, edit, withdraw or delete a published article in the CMS. Cloud SQL persists the mutation before any job starts.
2. The CMS triggers a named Cloud Run Job using its own Google service identity, with no GitHub dispatch and no public Cloud Run invoker grant.
3. The job connects directly to Cloud SQL and acquires a PostgreSQL advisory lock to serialize overlapping publishing executions.
4. It exports only Published articles and rebuilds /blog/, article pages, feed, search index, CSS, JS and sitemap.
5. By default it is a DRY RUN and does not connect to hosting.
6. After acceptance, the job deploys to DirectAdmin over explicit FTP over TLS (FTPS). It checks the live feed against PostgreSQL, including withdrawal of the last article.

The CMS reports a queued job, not a successful live deployment. Check Cloud Run Job executions and Cloud Logging. There is no automatic rollback if FTP delivery partially fails.

## Known infrastructure

Project: teledoctor-it
Region: africa-south1
Cloud Run CMS: tdsa-blog-cms
Cloud SQL connection: teledoctor-it:africa-south1:tdsa-cms-db
Database: tdsa_cms
Database user: tdsa-cms-app
Existing DB password secret: tdsa-cms-db-password
New job name: tdsa-blog-publisher

## Step A: Build a fresh container image

Build from the latest merged main branch using cloudbuild.cms.yaml. Save the successful build ID; the image built before this change will not have the job script or encrypted FTP client.

~~~bash
git -C "$HOME/tdsav1" fetch origin main
BUILD_DIR="$(mktemp -d)"
git -C "$HOME/tdsav1" archive origin/main | tar -xf - -C "$BUILD_DIR"
gcloud builds submit "$BUILD_DIR" \
  --project=teledoctor-it --region=africa-south1 \
  --config="$BUILD_DIR/cloudbuild.cms.yaml" --async
~~~

Remove the temporary build directory after submission. Do not promote Cloud Run service traffic.

## Step B: Confirm CMS service identity

~~~bash
gcloud run services describe tdsa-blog-cms \
  --project=teledoctor-it --region=africa-south1 \
  --format='value(spec.template.spec.serviceAccountName)'
~~~

Use the actual service account in the command below. The example CMS identity is tdsa-blog-cms@teledoctor-it.iam.gserviceaccount.com. Verify its Cloud SQL Client and Secret Manager access; do not assume permissions.

## Step C: Deploy the publisher in dry-run mode

Replace BUILD_ID and CMS_RUNTIME_SERVICE_ACCOUNT with verified values:

~~~bash
gcloud run jobs deploy tdsa-blog-publisher \
  --project=teledoctor-it --region=africa-south1 \
  --image="africa-south1-docker.pkg.dev/teledoctor-it/cloud-run-source-deploy/tdsa-blog-cms:BUILD_ID" \
  --command=node --args=scripts/publish-cloud-run-job.mjs \
  --service-account="CMS_RUNTIME_SERVICE_ACCOUNT" \
  --set-cloudsql-instances=teledoctor-it:africa-south1:tdsa-cms-db \
  --set-env-vars="NODE_ENV=production,CMS_BACKEND=postgres,PGHOST=/cloudsql/teledoctor-it:africa-south1:tdsa-cms-db,PGDATABASE=tdsa_cms,PGUSER=tdsa-cms-app,PGPORT=5432,CMS_PUBLISH_DRY_RUN=true" \
  --set-secrets=PGPASSWORD=tdsa-cms-db-password:1 \
  --tasks=1 --parallelism=1 --max-retries=0 --task-timeout=10m
~~~

This needs Cloud Run job create/update and permission to use the service identity; Secret Manager and Cloud SQL permissions must also be present. If denied, ask the administrator for the exact narrow grant.

Execute manually:

~~~bash
gcloud run jobs execute tdsa-blog-publisher \
  --project=teledoctor-it --region=africa-south1 --wait
~~~

Check the execution result and logs. Zero published articles is a valid result and must produce an empty blog when the final article is unpublished. A dry run NEVER uses FTP.

## Step D: Authorize CMS to run this job

An administrator grants Cloud Run Invoker on the JOB, not on the private CMS service, to the confirmed CMS service account:

~~~bash
gcloud run jobs add-iam-policy-binding tdsa-blog-publisher \
  --project=teledoctor-it --region=africa-south1 \
  --member="serviceAccount:CMS_RUNTIME_SERVICE_ACCOUNT" \
  --role="roles/run.invoker"
~~~

This grants the run.jobs.run permission on the named job only. It does not give GitHub access or make the CMS public. Your existing run.services.setIamPolicy error does not need to be solved; an administrator may also need to apply the new job-specific binding if run.jobs.setIamPolicy is denied.

## Step E: Test CMS triggering without changing production traffic

Deploy the updated CMS image to the cms-test tag and 0% normal traffic, preserving the current Cloud SQL and secret configuration:

~~~bash
gcloud run deploy tdsa-blog-cms \
  --project=teledoctor-it --region=africa-south1 \
  --image="africa-south1-docker.pkg.dev/teledoctor-it/cloud-run-source-deploy/tdsa-blog-cms:BUILD_ID" \
  --no-traffic --tag=cms-test \
  --update-env-vars=CMS_PUBLISH_JOB=tdsa-blog-publisher,CMS_PUBLISH_PROJECT=teledoctor-it,CMS_PUBLISH_REGION=africa-south1
~~~

Health should report publisherConfigured=true and publisherMode=cloud-run-job. Publish a temporary text-only article, confirm a dry-run job executes successfully, unpublish it and confirm another execution. No FTP, no GitHub Actions, no production traffic.

## Step F: Configure DirectAdmin credentials for actual deployment

Confirm hosting supports explicit FTPS. Never disable TLS validation or switch to plaintext FTP. Take a hosting backup.

Create these Secret Manager secrets through the Google Cloud console, without committing or displaying credential values:

- tdsa-blog-ftp-host: FTP hostname only, such as ftp.example.com.
- tdsa-blog-ftp-user: restricted hosting username.
- tdsa-blog-ftp-password: hosting account password.
- tdsa-blog-ftp-root: absolute public_html directory such as /domains/teledoctorsa.co.za/public_html.

The job's service identity needs Secret Manager Secret Accessor on each of those specific secrets. Attach them to the job, not to the CMS service:

~~~bash
gcloud run jobs update tdsa-blog-publisher \
  --project=teledoctor-it --region=africa-south1 \
  --update-secrets=CMS_FTP_HOST=tdsa-blog-ftp-host:latest,CMS_FTP_USERNAME=tdsa-blog-ftp-user:latest,CMS_FTP_PASSWORD=tdsa-blog-ftp-password:latest,CMS_FTP_REMOTE_ROOT=tdsa-blog-ftp-root:latest
~~~

After verifying the destination and backup, explicitly turn on live publishing:

~~~bash
gcloud run jobs update tdsa-blog-publisher \
  --project=teledoctor-it --region=africa-south1 \
  --update-env-vars=CMS_PUBLISH_DRY_RUN=false
~~~

Execute the job manually and inspect both its execution and the actual website. The job compares live /blog/feed.json article slugs to the database. If FTPS or remote paths are not supported, KEEP DRY RUN ON and adapt/test the transfer. The FTP publication is not globally atomic; a failed transfer may require restoring the hosting backup.

## Final go-live and rollback

Do not promote the updated CMS test revision until job submission, FTPS upload, live article appearance and withdrawal all pass. Disable automatic job submissions by removing CMS_PUBLISH_JOB from the Cloud Run service. Disable actual uploads by setting CMS_PUBLISH_DRY_RUN=true on the Cloud Run Job. Use the existing site backup for rollback if a partial transfer occurs.

Cloud Scheduler is separate: the CMS should run with CMS_SCHEDULE_WORKER_ENABLED=false and receive authenticated calls to POST /api/internal/publish-due. Its scheduler handler now queues ONE publisher run after processing all due articles.

Job execution is not automatic merely because code merged. Google Cloud job deployment, IAM, Cloud SQL/Secret Manager access and hosting FTPS acceptance remain account-side tasks.
