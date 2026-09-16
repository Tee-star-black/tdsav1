# Blog CMS Implementation Notes

## Phase 1 — Publishing Studio prototype

Status: **in progress on `feature/blog-cms-studio`**

The first milestone is intentionally isolated from the live TeleDoctorSA site. It establishes the UX and information architecture before credentials or production publishing are introduced.

### Included

- Editorial dashboard shell
- Responsive desktop/mobile navigation
- Publishing metrics
- Article library
- Search and status/category filtering
- Draft/review/published states
- New-story editor modal
- Draft creation interaction
- Editorial activity panel
- Links back to the current website and TeleMedia Suite

### Not yet production-connected

- Authentication
- Sanity project/dataset
- Persistent content storage
- Real image uploads
- Clinical approval enforcement
- Scheduled publishing
- Static HTML generation
- Signed webhooks
- Deployment automation
- Production verification
- Analytics API

The prototype deliberately does not pretend these integrations exist.

## Phase 2 — CMS foundation

1. Create Sanity project and production/staging datasets.
2. Add Studio application under `blog-cms/studio/`.
3. Define article, author, category and site-settings schemas.
4. Implement editorial workflow fields and validation.
5. Configure private preview behavior and media policy.
6. Establish roles after the selected Sanity plan is verified.

## Phase 3 — Static publishing

1. Add typed Sanity queries.
2. Generate `/blog/index.html` and article output from published documents.
3. Add article SEO and structured data.
4. Generate search index and sitemap entries.
5. Feed selected articles into TeleMedia Suite.
6. Preserve/migrate existing article URLs.

## Phase 4 — Automation and release safety

1. Verify actual production hosting/deployment path.
2. Configure signed Sanity webhook.
3. Trigger generation through the selected CI/deployment mechanism.
4. Make publication idempotent.
5. Verify the public article URL after deployment.
6. Add withdrawal and rollback safety.
7. Document incident/recovery procedures.

## Definition of live

An article is **live** only when all of the following are true:

- CMS document is approved/published.
- Generated public output passes validation.
- Deployment succeeds.
- Expected canonical URL responds successfully.
- Listing/sitemap state is consistent with the article.

A CMS publish event alone is never reported to staff as a successful website publication.