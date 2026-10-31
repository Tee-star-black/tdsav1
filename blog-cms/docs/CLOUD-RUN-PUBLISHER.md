# Direct CMS -> Cloud Run Job -> TeleDoctorSA website

GitHub remains the source-code repository and may run CI tests, but it is no longer involved when an editor publishes an article.

## Architecture

1. Staff publish, edit, withdraw or delete a published article in the CMS. Cloud SQL persists the mutation before any job starts.
2. The CMS triggers a named Cloud Run Job using its own Google service identity, with no GitHub dispatch and no public Cloud Run invoker grant.
3. The job connects directly to Cloud SQL and acquires a PostgreSQL advisory lock to serialize overlapping publishing executions.
4. It exports only Published articles and rebuilds /blog/, article pages, feed, search index, CSS, JS and sitemap.
5. By default it is a DRY RUN and does not connect to hosting.
6. After acceptance, the job deploys to cPanel over explicit FTP over TLS (FTPS). It checks the live feed against PostgreSQL, including withdrawal of the last article.

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

## Step F: Configure cPanel FTPES (explicit FTPS) for actual deployment

**Do not turn off dry-run mode until this checklist passes.**

1. In **cPanel > Domains**, identify the actual **Document Root** for
   teledoctorsa.co.za. The main domain may use public_html, but addon domains
   can have a different directory. In **File Manager**, locate the existing
   live /blog/, /styles/, /scripts/ and sitemap.xml files. Take an offline
   backup of the current document root using **File Manager > Compress > Download**.
   Back up the whole site before any --delete operation.
2. In **cPanel > FTP Accounts**, create a **dedicated publisher account**, not
   the primary cPanel account. Use a strong generated password. Set its
   **Directory** to the exact domain document root (typically public_html for
   the primary domain), NOT the automatically suggested subdirectory
   public_html/<domain>/<account> and NOT just public_html/blog. The FTP account
   must be jailed to this document root because the publisher also writes
   /styles/blog.css, /scripts/blog.js and /sitemap.xml.
3. In **FTP Accounts > Configure FTP Client**, identify the secure FTP server
   hostname. cPanel warns that FTP does not support TLS SNI, so the FTP
   hostname matching the server certificate may differ from the website domain.
   Confirm **explicit FTP over TLS** is available (usually port 21). This
   publisher does not support plaintext FTP or SFTP.
4. **Read-only check:** log in using an FTPS client with certificate
   verification enabled. Confirm remote path / corresponds to exactly the
   selected website document root and contains the expected site files.
   A dedicated cPanel FTP account jailed to public_html sees that directory
   as /, even though File Manager displays /home/<cpanel-user>/public_html.
   If this isn't true, stop. Do not guess, create nested public_html directories,
   or disable certificate verification.

Create the same four **Secret Manager** secrets used by the publisher job;
never store values in Git, Cloud Shell history, chat or public logs:

- tdsa-blog-ftp-host: FTPS **server hostname** (not a URL).
- tdsa-blog-ftp-user: dedicated full FTP username, often account@domain.
- tdsa-blog-ftp-password: dedicated generated account password.
- tdsa-blog-ftp-root: **/** only if FTP login is verified to be jailed to
  the correct document root (cPanel FTP Directory above).

For a dedicated account jailed to the document root, set this additional
**non-secret Cloud Run JOB** environment variable:

~~~bash
gcloud run jobs update tdsa-blog-publisher \
  --project=teledoctor-it --region=africa-south1 \
  --update-env-vars=CMS_FTP_JAILED_PUBLIC_HTML=true,CMS_PUBLISH_DRY_RUN=true
~~~

The publisher validates that / is used only with this explicit flag.
The flag is an operator assertion; code cannot verify the account's FTP
jail by itself. If instead using a non-jailed FTP account where the domain
root appears in FTP as /public_html or /domains/example/public_html, leave
CMS_FTP_JAILED_PUBLIC_HTML unset and use the exact FTP-visible absolute path
in tdsa-blog-ftp-root. Prefer the jailed dedicated account for least privilege.

The Cloud Run job service identity needs Secret Manager Secret Accessor on
**these four specific secrets**. Attach them to the publisher JOB, not to
the CMS service. First keep uploads disabled:

~~~bash
gcloud run jobs update tdsa-blog-publisher \
  --project=teledoctor-it --region=africa-south1 \
  --update-secrets=CMS_FTP_HOST=tdsa-blog-ftp-host:latest,CMS_FTP_USERNAME=tdsa-blog-ftp-user:latest,CMS_FTP_PASSWORD=tdsa-blog-ftp-password:latest,CMS_FTP_REMOTE_ROOT=tdsa-blog-ftp-root:latest \
  --update-env-vars=CMS_PUBLISH_DRY_RUN=true
~~~

**The publisher must be rebuilt from current main before this new /-jail
support works.** The successful earlier image
0ae91108-6de9-45a0-8f67-3e40917865f8 does NOT support this flag.

## Read-only FTPS diagnostic inside Cloud Run

A successful `CMS_PUBLISH_DRY_RUN=true` execution does **not** test FTP.
Use the dedicated `scripts/probe-ftps.mjs` entrypoint for a separate
read-only FTPS test. It refuses to run unless the Cloud Run Job has
`CMS_PUBLISH_DRY_RUN=true` and runs only TLS configuration, login and
`cls` directory listings against the verified cPanel webroot:

~~~bash
gcloud run jobs execute tdsa-blog-publisher \
  --project=teledoctor-it --region=africa-south1 \
  --args=scripts/probe-ftps.mjs --wait
~~~

Inspect the execution logs for
`SUCCESS: Cloud Run verified read-only FTPS access` and file listings
such as index.html and sitemap.xml. No `mkdir`, `mirror`, `put`, delete,
or upload is allowed in this probe. One-off `--args` overrides only that
execution, not the configured publisher job.

### cPanel existing directories (HTTP 200 /blog/ but missing feed)

On the first live attempt, the hosting FTP server may reply
`550 Can't create directory: File exists (/styles)` to `mkdir -p`
when a directory already exists. With `set cmd:fail-exit yes`, this
stops publishing after `/blog` may have been created. Revert the job to
`CMS_PUBLISH_DRY_RUN=true` and do not assume an HTTP 200 on `/blog/`
means content exists. Check `/blog/feed.json` and `/blog/sitemap.xml`.

The publisher uses `mkdir -p -f` on `/blog`, `/styles`, `/scripts`
to make subsequent publishing attempts idempotent on cPanel. Before
enabling live publishing after a fix, use the dry-run-only directory probe:

~~~bash
gcloud run jobs execute tdsa-blog-publisher \
  --project=teledoctor-it --region=africa-south1 \
  --args=scripts/probe-ftps-directories.mjs --wait
~~~

The probe **first lists all three existing directories**; if any is
missing it exits before issuing any `mkdir`. Only after confirming all
are present will it issue `mkdir -p -f` against those known-existing
paths to verify the hosting provider accepts the corrected command.
It never mirrors, uploads, deletes, or modifies the site contents.

The publisher and probe execute `lftp --norc -f` against a random
temporary command file (private directory mode 0700, file mode 0600).
This avoids reopening socket-backed `/dev/stdin` from Node's subprocesses
and avoids putting the FTP password on the process command line.
The command file is deleted in a finally block, including on failures.
Cloud Run's filesystem is ephemeral. Never log this file's contents.

Only after verified remote path, valid TLS, backups, fresh image, and an
explicit decision to test a live publish should the job be changed:

~~~bash
gcloud run jobs update tdsa-blog-publisher \
  --project=teledoctor-it --region=africa-south1 \
  --update-env-vars=CMS_PUBLISH_DRY_RUN=false
~~~

Execute the job, verify live /blog/feed.json and its article pages against
Cloud SQL, test a withdrawal, and inspect the live sitemap. The lftp upload
is not atomic: a failed transfer can leave a partial site and may require
restoring the downloaded backup. The mirror --delete operates under /blog/
only and writes styles/blog.css and scripts/blog.js. The job builds and
uploads a standalone /blog/sitemap.xml. The **existing root sitemap.xml
is preserved by default** to avoid overwriting newer live site entries.
Submit /blog/sitemap.xml to Google Search Console when the blog launches.

Only after inspecting and accepting a diff between the remote
/public_html/sitemap.xml and the newly generated source template may an
operator set CMS_PUBLISH_UPLOAD_ROOT_SITEMAP=true on the JOB, after taking
a verified site backup. Otherwise leave it unset/false. No automatic
root sitemap upload is necessary for the blog to work.

## Final go-live and rollback

Do not promote the updated CMS test revision until job submission, FTPS upload, live article appearance and withdrawal all pass. Disable automatic job submissions by removing CMS_PUBLISH_JOB from the Cloud Run service. Disable actual uploads by setting CMS_PUBLISH_DRY_RUN=true on the Cloud Run Job. Use the existing site backup for rollback if a partial transfer occurs.

Cloud Scheduler is separate: the CMS should run with CMS_SCHEDULE_WORKER_ENABLED=false and receive authenticated calls to POST /api/internal/publish-due. Its scheduler handler now queues ONE publisher run after processing all due articles.

Job execution is not automatic merely because code merged. Google Cloud job deployment, IAM, Cloud SQL/Secret Manager access and hosting FTPS acceptance remain account-side tasks.
