# TeleDoctorSA Blog CMS

A self-contained full-stack workspace for the TeleDoctorSA Blog & Insights publishing system.

## Goal

Give non-technical TeleDoctorSA staff one connected workflow to create, review, schedule, publish and manage website content without editing production HTML or using Git.

The development rule for this workspace is **vertical slices**: a visible frontend capability is only considered implemented when its data/service/backend companion exists, and backend operations are surfaced through a real workflow rather than left as unused endpoints.

## Current architecture

```text
Publishing Studio
      |
      v
CMS API (Node)
      |
      +---- Local JSON repository (development)
      |
      +---- Sanity repository adapter (production CMS target)
      |
      v
Published content API
      |
      +---- Clean development routes (/blog/...)
      |
      +---- Static production generator
                |
                +---- /blog/index.html
                +---- /blog/<slug>/index.html
                +---- /blog/feed.json
                +---- /blog/search-index.json
                +---- /styles/blog.css
                +---- /scripts/blog.js
                +---- sitemap.xml entries
                +---- TeleMedia featured feed
```

## What is connected now

- Article create, read, edit and delete
- Draft, In Review, Published and Scheduled states
- Scheduled publication worker in the development service
- Shared server-side publication validation
- Clinical-review publication guardrail
- Category create/list/delete with reference protection
- Media list/upload and article cover-image selection
- Persistent media name, alt text and tags in both local and Sanity repository models
- SEO title and description fields
- Public published-only content feed
- Clean `/blog/` development route driven by the same backend as the Studio
- Clean `/blog/<slug>/` article routes
- Static production Blog & Insights generator
- Production search and category filtering
- Article structured data
- Search/feed JSON generation
- Sitemap generation
- TeleMedia featured-blog integration through `/blog/feed.json`
- Local repository and Sanity repository behind the same API contract
- Connected smoke test and GitHub Actions verification
- Rebuild cleanup so withdrawn articles do not leave stale generated pages

## Run the connected app locally

From the repository root:

```powershell
cd blog-cms
npm install
npm run dev
```

Then open:

- Publishing Studio: `http://127.0.0.1:8790/` (redirects to `/prototype/`)
- Public Blog & Insights: `http://127.0.0.1:8790/blog/`
- TeleMedia integration: `http://127.0.0.1:8790/telemedia-suite.html`
- API health: `http://127.0.0.1:8790/api/health`

Do not use Live Server as the primary development runtime for this feature. Live Server can render files, but the CMS requires the Node content service on port `8790` for connected behaviour.

## Backend modes

Development uses the local repository by default:

```env
CMS_BACKEND=local
```

To use Sanity, configure the variables in `.env.example` in the runtime environment and set:

```env
CMS_BACKEND=sanity
```

The browser never receives the Sanity write token. Writes go through the server repository adapter.

## Build production blog files

```powershell
npm run build:blog
```

The build exports published content from the selected repository, validates it, clears the previous generated blog output, generates the current public blog files, updates the blog feed and search data, and injects current blog URLs into the existing site sitemap.

## Verification

Run the connected smoke test:

```powershell
npm run check
```

The smoke test exercises the joined Studio/backend contract: category creation and reference protection, media upload, draft privacy, clinical-review blocking, approved publication, the TeleMedia feed, clean article routes, deletion/withdrawal, and category cleanup.

GitHub Actions runs the smoke test and static build for changes under this workspace. Obsolete branch runs are cancelled automatically when a newer commit arrives.

## Repository areas

- `prototype/` - custom TeleDoctorSA Publishing Studio UI
- `public-preview/` - API-driven public blog shell used by clean dev routes
- `client/` - browser API client shared by Studio and public blog
- `server/` - API server, validation and repository adapters
- `sanity/` - Sanity configuration and schemas, including editorial media metadata
- `data/` - deterministic development seed data
- `scripts/` - export, validation, smoke-test and static-generation tooling
- `templates/` - production Nunjucks templates
- `assets/` - production blog CSS and JavaScript copied by the build
- `docs/` - implementation and operational notes

## Production handover

The production-ready shape is now:

- Staff use individual email/password accounts with hashed passwords and HttpOnly sessions; the legacy shared token remains only as an optional fallback.
- Production Sanity writes require both `SANITY_WRITE_TOKEN` and `CMS_ALLOW_PRODUCTION_WRITES=true`.
- The public editorial destination is `/blog/`.
- TeleMedia remains a media/press surface and can showcase featured Blog & Insights stories.
- Publish/update/delete events can call a signed deploy webhook. GitHub repository dispatch is supported directly.
- A production build workflow can rebuild the static blog and deploy the generated files to the current cPanel/public_html site once hosting secrets are configured.
- The CMS server can be containerised and hosted at a staff-only URL such as `https://cms.teledoctorsa.co.za`.

See `docs/PRODUCTION-HANDOVER.md` for the remaining account-side setup: CMS host/DNS, GitHub deployment token, and cPanel FTP credentials.


## Editor reliability update — 22 September 2026

See [the workflow audit](docs/WORKFLOW-AUDIT-2026-09-22.md) for findings, verified fixes and production acceptance requirements.

- New articles begin as unsaved drafts. **Save draft** persists an article with a title; a category is required before review/publication.
- Unsaved text has a same-tab recovery copy. Closing the editor asks before discarding changes. Recovery is not automatic backend saving.
- Saving reveals the article in its status list. Pagination and filters are remembered in the same browser tab.
- Categories and cover images can be added while writing. Errors remain visible inside the editor.
- Existing articles carry a revision; stale changes must be reconciled with the latest saved version instead of silently overwriting it.
- Scheduling requires complete content, approval where required, a future date and a running service.
- Publishing confirms the CMS write and reports the website rebuild request separately. The live website must still finish deployment.

Additional regression checks (after `npm install`):

```powershell
npm run check:workflow
npm run check:editor
```

These checks cover isolated local workflow/server tests, editor DOM integration and mocked Sanity writes. They do not replace a real browser or production deployment acceptance test.
