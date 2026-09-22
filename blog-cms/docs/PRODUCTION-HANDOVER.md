# TeleDoctorSA Publishing Studio - Production Handover

## Public content structure

The official editorial destination is:

- **Blog & Insights:** https://teledoctorsa.co.za/blog/
- **Article URLs:** https://teledoctorsa.co.za/blog/<slug>/
- **TeleMedia Suite:** remains the press, interviews, announcements and media-facing page.
- TeleMedia can display up to three recent/featured Blog & Insights articles from `/blog/feed.json`.

This keeps long-form editorial content indexable under one clean URL family while still allowing TeleMedia to promote selected stories.

## Staff CMS

Recommended staff URL:

`https://cms.teledoctorsa.co.za`

The Node service is container-ready via `blog-cms/Dockerfile`. Run it as an always-on service because scheduled publishing is checked by the CMS process.

Required production runtime variables:

```env
CMS_BACKEND=sanity
CMS_HOST=0.0.0.0
CMS_ALLOW_PRODUCTION_WRITES=true
CMS_ACCESS_TOKEN=<staff access code>
CMS_ALLOWED_ORIGINS=https://cms.teledoctorsa.co.za,https://teledoctorsa.co.za,https://www.teledoctorsa.co.za

SANITY_PROJECT_ID=glz6ptd8
SANITY_DATASET=production
SANITY_API_VERSION=2026-09-01
SANITY_WRITE_TOKEN=<server-side Sanity write token>

CMS_DEPLOY_WEBHOOK_URL=https://api.github.com/repos/Tee-star-black/tdsav1/dispatches
CMS_DEPLOY_WEBHOOK_TOKEN=<fine-grained GitHub token>
```

The browser never receives the Sanity write token or GitHub deployment token.

## GitHub production deployment

The workflow `.github/workflows/blog-publish-production.yml` listens for `repository_dispatch: blog_publish`.

Configure these repository secrets:

- `TDSA_FTP_HOST`
- `TDSA_FTP_USERNAME`
- `TDSA_FTP_PASSWORD`
- `TDSA_FTP_REMOTE_ROOT` (normally the cPanel `public_html` directory)
- `SANITY_READ_TOKEN` only if the Sanity dataset is not publicly readable

When an editor publishes, updates or removes a published article:

1. CMS writes the content to Sanity.
2. CMS sends a signed GitHub repository dispatch.
3. GitHub rebuilds `/blog/`, article pages, feed/search JSON, stylesheet/script and sitemap.
4. The workflow uploads only the generated blog assets to the existing production host.
5. GitHub verifies the public blog and feed URLs respond successfully.

## Colleague sign-in

Set a strong `CMS_ACCESS_TOKEN` in the hosted CMS runtime. The Publishing Studio now presents a branded sign-in screen rather than a browser prompt. The token is held in session storage and is cleared when the user signs out or closes the browser session.

This is suitable for a small internal editorial team. If the team grows or needs per-user audit history, replace the shared access code with individual identity-provider accounts and roles.

## Launch acceptance test

Before handing the URL to staff, complete one production test:

1. Sign in.
2. Create a draft and reopen it.
3. Add/select a category.
4. Upload a cover image with alt text.
5. Preview.
6. Publish.
7. Confirm the GitHub production publish workflow succeeds.
8. Confirm the story appears at `/blog/` and its article URL.
9. Confirm a featured story appears on TeleMedia.
10. Edit and republish.
11. Schedule a test article a few minutes ahead and confirm it publishes automatically.
12. Withdraw/delete the test story and verify it disappears from the public blog after deployment.

## Account-side items still required

Repository code cannot create these without access to the relevant external accounts:

- DNS record for `cms.teledoctorsa.co.za`.
- A running container/service for the CMS.
- Production CMS environment variables/secrets.
- cPanel/FTP credentials in GitHub Actions secrets.
- A fine-grained GitHub token used by the CMS deployment webhook.

Once those are configured, the colleague workflow requires no Git, VS Code or manual `public_html` editing.
