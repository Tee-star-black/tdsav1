# Blog CMS workflow review — 22 September 2026

Reviewed the default branch at c16656b9dc08b8f1081d4af6be3f9cfab186b8be. The original implementation was not a complete, reliable editor workflow.

## Findings and fixes

| Finding | Change |
| --- | --- |
| Initial loading called `classList.add('')`, throwing before data requests ran | Ignore empty connecting-state class; editor integration tests now execute the actual startup script |
| An article could save successfully and remain hidden by the current search/status/category | Reveal the returned article in its status list, clear conflicting filters and go to page one |
| Sanity save immediately queried the document again, risking a missing/stale response after successful mutation | Return the acknowledged mutation with its revision; synchronous mutation visibility |
| Closing or submitting the editor could discard work | Confirm before discard; prevent default form navigation; recover unsaved input in the same browser tab |
| Drafts required a category before an idea could be saved | A title of at least five characters is enough to save a draft; review and publication require a category |
| Generic save action obscured publication/withdrawal | Explicit Save draft, Send for review, Schedule article and Publish article labels; separate return-to-draft action; confirmations for publication/withdrawal |
| Errors appeared in a toast behind the modal | Inline editor error message; preserve input and recovery copy after failed saves |
| Pagination controls were decorative | Ten articles per page, active next/previous controls and page/filter restoration in the same browser tab |
| Existing slugs changed when titles were edited | Preserve saved and manually entered slugs |
| Images/categories required leaving an unsaved story | Add category and upload cover controls inside the editor; existing writing retained |
| Preview omitted the chosen image | Render the selected cover and its alternative text |
| Scheduled articles could be incomplete or have invalid dates | Validate future date and complete, clinically approved content before accepting a schedule |
| Concurrent editor sessions could overwrite each other | Revision checks; Sanity conditional patches; local atomic file replacement and unique article IDs |
| Saving to a deleted article could recreate it | Reject missing updates with 404 |
| Removing a Sanity cover silently preserved the previous cover | Explicitly unset a cleared image |
| Production export could ignore the `.env` backend configuration | Repository creation loads the same `.env` settings for server and export |
| CMS source/data could be served through the generic static route | Block `/blog-cms/` and dotfile paths |
| Publishing success implied a deployed live page | Return deployment-trigger outcome and distinguish published preview from live website deployment |

## Editor flow

1. New article opens an unsaved Draft. Type a title and select **Save draft** to persist it to the configured backend.
2. The saved article appears in Drafts immediately and survives refresh. Unsaved typing is only a recovery copy in that tab; it is not an automatic backend save.
3. Reopen to add writing, introduction, author, category, image, alt text and SEO fields. Preview includes the cover.
4. Select In review and **Send for review**. Clinical approval remains a field managed by trusted editors; there is no independent reviewer role enforcement.
5. Publish with complete content and any required approval, or schedule for a valid future time. Scheduled content remains outside the blog feed until the worker publishes it.
6. Published edits require confirmation. **Unpublish to draft** withdraws the article from the API. Live static pages change only after a successful deployment.
7. Delete requires confirmation; referenced categories cannot be deleted. Permanent deletion is retained from the existing product; there is no trash/undo feature.

## Verification

- Existing authenticated API smoke test passed: create/category/media, draft exclusion from blog, approval guardrail, publication, feed, deletion.
- Seven workflow/server regression tests passed: durable local drafts, concurrent writes, stale saves, transitions, schedule validation, due publication at startup, missing updates, protected static paths and mocked Sanity mutation contracts.
- Seven editor DOM integration tests passed against a real isolated local HTTP API: startup, filtered-save visibility, inline errors, review, slug preservation, return to draft, recovery, Enter submission, pagination restoration, preview, publication/withdrawal, concurrent edit errors and inline category creation.
- Live **read-only** Sanity contract passed: 4 articles, 5 categories, 4 media records, 2 public blog articles. No production content was written or deleted during this review.
- Local static blog build passed with a temporary sitemap fixture. Generated test/build files are not included in this change.
- Browser visual/mobile verification was blocked because the connected cloud browser could not reach the local test server. DOM tests do not establish visual layout correctness.
- Sanity write semantics are covered with a mocked adapter. A real authenticated Sanity save/upload still needs verification in a test dataset.

## Remaining production requirements

- Configure and verify the website deployment webhook and hosting release. A successful webhook request is not proof that the new live page has deployed. Failed hooks are reported, not automatically retried.
- Keep the CMS service running for its 30-second scheduling worker. Validate scheduled publication on the intended production host.
- Configure staff access before exposing the CMS beyond local development. The existing shared access token is not individual staff identity or reviewer-role separation.
- **Draft confidentiality:** the existing Sanity production read test can read the editorial article set without a token. Drafts are excluded by the blog API, but editorial-status fields in a publicly readable dataset do not provide confidentiality. Configure private dataset access/read tokens or adopt protected native drafts before treating unpublished content as private.
- Run desktop/mobile browser acceptance checks after installing this branch, then verify one real draft → review → publish → live website → withdraw cycle against a test dataset/deployment.

## Commands

From `blog-cms`, run `npm install`, `npm run check`, `npm run check:workflow`, `npm run check:editor` and `npm run check:sanity`. The editor tests use jsdom and an isolated local store, not production Sanity. Run `npm run build:blog` only with the intended backend configuration. Studio build label: **2026.09.22.3**.
