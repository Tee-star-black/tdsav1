# CMS article-only Sanity migration (media deferred)

Use this temporary cutover when the TeleDoctorSA CMS can write to Cloud SQL but the GCS media bucket and public CDN are not yet available.

**Important:** This is an intentional temporary dependency on the existing Sanity CDN. Keep the Sanity project and its assets available until CMS media migration and public HTTPS delivery are finished.

## What this command imports

- Sanity article categories that do not already exist in the target database.
- Articles not already present in the target, preserving their slug, status, body, excerpt, author, SEO, publication date and **existing external cover URL**.
- Known placeholder stories `testtet` and `bdfjny-js-js` are copied **as drafts**, not published articles.
- Any Sanity document whose `_id` contains a period is restricted to authenticated source readers and is imported **as a draft**, regardless of editorial status.
- Articles already in Cloud SQL are skipped, not overwritten.

It **does not** upload images, create `cms_media` records, call the GCS API, delete source records, or change the public website.

## Safety and preflight

The command is **dry-run by default**. It validates article content, confirms category availability and prints the planned slugs and statuses before any writes.

From `blog-cms/` with Node.js 22, installed production dependencies, Sanity read access and Cloud SQL environment variables configured:

Use a **Sanity Viewer API token** in `SANITY_READ_TOKEN`; never commit or print the token. An anonymous Sanity query silently omits the private article `article.how-telemedicine-is-changing-everyday-healthcare`, so this migration refuses to run without authenticated source access and confirms that article is visible before modifying data.

```bash
npm run migrate:sanity-text-only
```

Review the report. Fix validation failures before proceeding.

When the preview is approved, explicitly run:

```bash
npm run migrate:sanity-text-only -- --apply
```

The apply mode only creates categories/articles. It is retry-friendly: any existing article slug is left untouched. If an import is interrupted, preview again before retrying.

## Temporary operational limitations

- Cover images still load from `cdn.sanity.io`. Do not retire the Sanity project or its image assets yet.
- Private-ID Sanity articles remain Draft until editorial staff explicitly review and publish them on the destination CMS.
- New image uploads remain unavailable until the CMS runtime has bucket write access.
- New published articles must still satisfy the existing cover-image and editorial validation checks.
- GitHub publishing, scheduler, production domain and public image delivery require separate acceptance tests.
- This action uses the **real `tdsa_cms` database**; take a backup and approve the preview before apply.

## Production rollout boundary

Keep the new Cloud Run test revision at **0% of normal traffic** until the editorial login, review, publishing API and website integration have passed. Importing content does not imply the CMS is ready for public traffic.
