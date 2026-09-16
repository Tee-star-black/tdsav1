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
      +---- Public Blog preview
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
- Cover-image alternative text
- SEO title and description fields
- Public published-only content feed
- Public Blog & Insights preview driven by that feed
- Public article view driven by article slug
- Static production Blog & Insights generator
- Production search and category filtering
- Article structured data
- Search/feed JSON generation
- Sitemap generation
- TeleMedia featured-blog integration through `/blog/feed.json`
- Local repository and Sanity repository behind the same API contract
- Connected smoke test and GitHub Actions verification

## Run the connected app locally

From the repository root:

```powershell
cd blog-cms
npm install
npm run dev
```

Then open:

- Publishing Studio: `http://127.0.0.1:8787/`
- Public blog preview: `http://127.0.0.1:8787/public-preview/`
- API health: `http://127.0.0.1:8787/api/health`

Do not use Live Server as the primary development runtime for this feature. Live Server can render the frontend, but the CMS requires the Node content service on port `8787` for connected behaviour.

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

The build exports published content from the selected repository, validates it, generates the public blog files, updates the blog feed and search data, and injects blog URLs into the existing site sitemap.

## Verification

Run the connected smoke test:

```powershell
npm run check
```

The smoke test verifies that a draft stays private, unapproved clinical content cannot publish, approved content reaches the public feed, and article deletion works.

GitHub Actions runs the smoke test and static build for changes under this workspace.

## Repository areas

- `prototype/` - custom TeleDoctorSA Publishing Studio UI
- `public-preview/` - API-driven public blog preview
- `client/` - browser API client shared by Studio and preview
- `server/` - API server, validation and repository adapters
- `sanity/` - Sanity configuration and schemas
- `data/` - deterministic development seed data
- `scripts/` - export, validation, smoke-test and static-generation tooling
- `templates/` - production Nunjucks templates
- `assets/` - production blog CSS and JavaScript copied by the build
- `docs/` - implementation and operational notes

## Still gated before production

The following are intentionally not represented as finished UI controls until their production companions are configured:

- Staff authentication and role enforcement
- Real Sanity project/dataset credentials and production connection
- Signed publication webhook/deployment trigger
- Production cPanel/hosting deployment credentials and atomic release step
- Post-deployment live URL verification and rollback
- GA4 editorial analytics in the Studio

Those items form the next vertical slices. They should be implemented frontend + backend + infrastructure together rather than added as decorative dashboard controls.
