# TeleDoctorSA App demo requests

## What changed
- The canonical public \`/app\` page is rendered from \`teledoctorsa-app.html\` (per \`.htaccess\`).
- Legacy \`app.html\` now contains the same demo layout with \`noindex\` and a canonical URL pointing to \`/app\`.
- Visitors can request a guided demo or open the patient demo already linked from the site routing at https://demo-patient.teledoctorsa.co.za/.
- Demo requests POST to \`/api/leads.php\`; the endpoint also accepts the existing homepage contact form payload.
- The server sends a plain-text email to \`info@teledoctorsa.co.za\` by default. It does not persist applicant details in the web root.

## Production configuration
1. Confirm the hosting server runs PHP 8.1+ and \`/api/leads.php\` is accessible over HTTPS.
2. Confirm PHP \`mail()\` delivery works, including SPF/DKIM/DMARC for the sending domain. Optionally set server environment variables \`TDS_LEADS_TO\` and \`TDS_LEADS_FROM\` to verified mailboxes. Never put credentials in browser-side source.
3. Verify \`info@teledoctorsa.co.za\` is monitored by someone who owns follow-up. Aim for replies within one business day.
4. Test a **real** demo request with internal test contact details and check that an email arrives in the inbox. A successful HTTP response only means the local mail transport accepted the message, **not** guaranteed inbox delivery.
5. Verify the patient demo works and request sample/demo credentials from its administrator if sign-in is required. Do not expose actual patient records in demo environments.
6. For reliable operational reporting, integrate a secure lead CRM/work queue later. Email-only delivery is a starting point, not a durable audit trail.
7. Confirm the site's Privacy Policy and retention policy cover the personal contact information collected by demo enquiries.

## Automated checks
- \`node scripts/verify-app-demo.mjs\`
- \`node --check scripts/app-demo.js\`
- \`php -l api/leads.php\`

## Error behavior
If the server rejects a request or cannot accept email delivery, the form displays a visible error and links to WhatsApp or email instead of claiming success.

## Attribution
The page sends a fixed \`leadSource=app-demo-page\` and \`leadIntent=guided-demo\`, plus optional UTM campaign values. No contact details or message content are sent to Google Analytics; only a non-personal \`generate_lead\` event is emitted after the server accepts the request.
