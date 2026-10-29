# TeleDoctorSA Publishing Studio — Production handover

## Architecture

~~~text
Publishing Studio (Cloud Run service)
           |
           +-- Cloud SQL (articles/categories/staff/revisions/audit)
           |
           +-- Google Cloud Run Jobs API
                            |
                 Static publisher Cloud Run Job
                            |
                      Published-only SQL export
                            |
                      Static blog generator
                            |
                      Encrypted DirectAdmin FTPS
                            |
                   teledoctorsa.co.za/blog/
~~~

There is no legacy CMS dependency and no GitHub Actions workflow in the article publishing path. GitHub and Cloud Build remain for source development and container builds only.

## Verified to date

- Cloud SQL backend and Postgres staff authentication on the tagged CMS revision.
- Database retains an administrator, two categories and a test article.
- Text-only publish created a visible public API article.
- Unpublish withdrew it from the public API.
- The earlier CMS tagged revision was deployed with 0% production traffic.

**This does not yet establish real website publishing.** The new Cloud Run Job needs Cloud-side deployment and acceptance; a merged commit does not deploy a job.

## Publisher components

- CMS service: private, no external GitHub invoker grant.
- Publisher job: runs a Node script in the same image with the Cloud SQL socket.
- PostgreSQL advisory lock ensures multiple job executions produce files from the current database state in sequence.
- The job defaults to dry run and uploads no files.
- Once specifically enabled, the job transfers blog files via verified FTPS and checks the live feed.
- The job does not use the CMS API and does not require Cloud Run service invocation rights.

## Secrets and permissions

- CMS runtime service identity needs permission run.jobs.run, granted through roles/run.invoker **on tdsa-blog-publisher only**.
- Job service identity requires Cloud SQL Client and Secret Manager access to its database password secret and (later) restricted DirectAdmin FTPS secrets.
- IAM assignments and job creation may require an administrator. Do not broaden a personal account's project-wide permissions.
- No credentials in GitHub, command output, logs or the repository.

## Scheduled publishing

Cloud Scheduler separately triggers the authenticated POST /api/internal/publish-due CMS endpoint. Keep CMS_SCHEDULE_WORKER_ENABLED=false in Cloud Run. The scheduler handler enqueues one publisher job after its due articles have been committed.

## Launch controls

1. Build latest image and create the publisher job in dry-run mode.
2. Verify dry-run export and static generation against Cloud SQL.
3. Grant the CMS identity the narrow publisher-job invoker role.
4. Deploy the updated CMS revision under cms-test with 0% normal production traffic.
5. Verify publishing and withdrawal each queue successful jobs.
6. Provision restricted FTPS secrets and verify the hosting target after taking a backup.
7. Explicitly enable FTPS transfer, run a test deployment, and verify live feed matches Cloud SQL.
8. Promote only the tested CMS revision, with rollback and monitoring prepared.
9. Schedule Cloud Scheduler and run a scheduled-publication acceptance test.
10. Revisit GCS image uploads and accessibility later.

See docs/CLOUD-RUN-PUBLISHER.md for commands and failure recovery.

If an execution fails after opening an FTP connection, hosting may contain partially updated files. The transfer is not globally atomic. Restore hosting from backup if necessary and do not claim website delivery succeeded merely because the job was queued.
