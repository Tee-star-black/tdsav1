# Retired e-commerce pages: cPanel deployment handover

TeleDoctorSA is no longer running an online store. The public website focuses on virtual consultations, ECG247 monitoring, EHR, patient apps, clinical teams and demo enquiries.

## Removed from source

- shop.html
- product-detail.html
- payment.html
- returns-policy.html
- Medical devices shopping card on our-services.html
- Legacy shop and returns-policy footer links
- Sitemap shop entry and unused shop CSS
- Front-end local routing aliases for old shopping URLs

## REQUIRED cPanel actions

GitHub merges and local `git pull` do **not** automatically delete old files already on cPanel.

1. Upload updated public pages, scripts, CSS and the hidden root `.htaccess` to the live public directory.
2. Use cPanel File Manager to explicitly delete the four old HTML files listed above. Avoid touching patient or clinician application code.
3. Confirm old commerce URLs return HTTP 410 Gone. The updated `.htaccess` forces this even if an old file remains on the server.
4. Check `/our-services`, `/app`, `/ecg247`, `/contact-us` and `/sitemap.xml` are reachable.
5. Refresh or purge any host/CDN cache, then resubmit the updated sitemap to Google Search Console.
6. Retain all historical business, payment and order records in internal systems as legally required. Only public shopping pages are removed.

A 410 response is intentional permanent retirement rather than an accidental broken link.

## Checks

`node scripts/verify-retired-shop.mjs`

The shared-nav browser tests continue to run against remaining public pages.
