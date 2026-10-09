# TeleDoctorSA website audit — 9 October 2026

Scope: the public website based on main at `33365178dd557a135ca8005d046eea73add9f04f`. No blog CMS files, configuration, database, or publishing workflows were changed.

## Findings and fixes

| Finding | Result |
| --- | --- |
| The editorial menu replaced legacy markup, then an asynchronously loaded shared navbar replaced it again. | The shared navbar now renders the editorial menu itself. Removed the competing bootstrap and load its stylesheet centrally. All four solution links and the demo CTA remain. |
| Closed menus retained interactive descendants, and the mobile back control bypassed menu state. | Closed menus use `inert`; back controls call the owning trigger. Added focus containment for the open mobile menu and focus restoration on desktop Escape. |
| The homepage posted enquiries to `api/leads.php`, which is absent. | Preparing an enquiry creates email and WhatsApp links. The visitor sends it in the selected app. No false receipt, no missing endpoint, and values remain in the form. This is a handoff, not automatic lead collection. |
| Homepage dialogs lacked Escape handling, keyboard containment, and semantic close buttons. | Added labelled dialogs, buttons, focus restoration, scroll restoration, and keyboard handling. |
| The shop says coming soon, while legacy product and checkout pages contained sample products, reviews, card fields, and unverified totals. | Retired those prototype routes with temporary redirects to the existing shop enquiry page, including a fallback when Apache rewrites are unavailable. |
| Old app aliases showed a different, outdated app page in static hosting. | All app aliases now point to the same app page and preserve query strings and fragments. |
| The UPVIO page referenced three videos absent from the repository. | Removed broken video players and replaced the demo CTA with a link to the existing explanation of the steps. The live wellness-check link remains. |
| QR downloads referenced eight nonexistent SVGs; nurse and clinician destinations were also missing pages. | Generated the eight QR SVGs and updated destinations to the current app, nurses, and doctors pages. |
| Audience links referenced a missing wellness page; the shop had a button linking back to itself. | Corrected the wellness destination and changed the shop button to contact the team. |
| Public `/blog/` returned 404, while TeleMedia had static links to it and two feed-rendering implementations. | Static links now lead to existing media coverage. Removed the duplicate feed renderer. The existing TeleMedia feed still renders articles if a published feed becomes available; its unavailable state has a usable destination. |
| Several pages showed malformed punctuation and homepage copy describing editorial strategy. | Repaired encoding and changed the affected homepage copy to address visitors. |
| Two favicon paths did not exist. | Reused the existing branded icon. |
| The existing site workflow rewrote every HTML page, including CMS pages, and pushed changes automatically. | Replaced it with read-only website verification and excluded CMS pages from website browser tests. Restored all automatic CMS edits to their original blobs. |\n| Changed assets were loaded under old, long-cached URLs. | Updated release queries for changed shared scripts and styles. |

## Validation

- `node scripts/verify-site.mjs`: passed for all 26 root website HTML pages. Checks local and same-domain targets, fragments, duplicate IDs, inline JavaScript syntax, and shared JavaScript syntax. CMS paths are excluded from the scan.
- DOM execution checks: 23 content pages loaded with no script exceptions. External icon and animation libraries were stubbed; this checks website logic, not CDN availability or rendered layout.
- DOM interaction checks at simulated widths of 390 and 1440: solution menu contents, open/close state, inert state, mobile submenu back navigation, and Escape passed.
- Enquiry checks: required fields and consent, encoded draft contents, retained values, honest unsent state, and HTML escaping passed. No enquiry was sent to the business.
- Dialog checks: Escape closes the dialog and restores body scrolling.
- Live browser checks: inspected the homepage and ECG247 navigation; confirmed `/blog/` currently returns 404. The live deployment differs from the reviewed main branch.

## Deployment and remaining verification

These changes are for review and have not been deployed. After merging and uploading the website, verify the actual desktop and mobile layout, redirects on Apache, QR scans on a phone, and opening drafts in installed email/WhatsApp apps. The local preview was inaccessible to the cloud browser, and a local Chromium download failed, so rendered mobile QA is still outstanding.

The enquiry handoff does not save leads or send email automatically. A later automatic submission flow needs a real website endpoint and verified delivery configuration. Clinical product descriptions, app availability, business hours, external services, and legal text were not independently certified by this code audit.
