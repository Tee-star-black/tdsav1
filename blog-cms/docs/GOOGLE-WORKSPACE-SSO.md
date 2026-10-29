# TeleDoctorSA Publishing Studio: staff accounts and Google Workspace sign-in

Google login is **opt-in**, and does not provision accounts automatically. The normal
individual staff password flow remains available and unchanged.

## Existing functionality

Administrators sign in, open **Account & staff**, and create an account with a
name, work email and one of the existing `admin`, `editor` or `reviewer` role
labels. CMS generates a strong temporary password and shows it once. Send it to
each staff member using a private channel, never a repository or shared log.

On the first password sign-in, the staff member opens **Account & staff** and
uses **Change password**. Password changes invalidate existing CMS sessions;
the member signs in with the new password. Admins can separately reset a
password or remove a departing user's access.

## Google Workspace setup

1. In the Google Cloud project `teledoctor-it`, configure OAuth branding / the
   Google Auth Platform consent screen. Choose **Internal** for a suitable
   Google Workspace organisation, if available.
2. Create a **Web application** OAuth client ID, following Google's
   [Google Identity Services setup](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid).
   Add the **exact HTTPS origins** of the CMS frontend, including the intended
   custom domain and any tagged Cloud Run revision domain used for testing.
   The popup sign-in uses JavaScript origins, not redirect URLs.
3. Apply `db/migrations/002_google_workspace_identity.sql` with the existing
   **CMS schema owner** account. Do not reset the administrator, recreate the
   database, or change any Document Hub database.
4. Configure these non-secret environment variables on the CMS Cloud Run
   **service**, preferably first on a tagged `cms-test` revision:
   ```env
   CMS_GOOGLE_CLIENT_ID=<web-app OAuth client ID>
   CMS_GOOGLE_WORKSPACE_DOMAIN=teledoctorsa.co.za
   CMS_COOKIE_SECURE=true
   ```
   The client ID is a public identifier. **No OAuth client secret is required**
   by the Google Identity Services ID-token popup flow.
5. Deploy the updated CMS image with `--no-traffic --tag=cms-test`. Verify
   with the approved Google Workspace account first; then onboard the three
   staff members.
6. Keep the private Cloud Run IAM boundary. Google's sign-in button does
   **not** bypass a Cloud Run 403. For normal staff browser access, configure
   [Identity-Aware Proxy for Cloud Run](https://docs.cloud.google.com/run/docs/securing/identity-aware-proxy-cloud-run)
   and add the named employees as IAP-secured Web App Users. This requires
   administrator IAM configuration and may produce a Google sign-in at both
   the perimeter and application layer. Consider a unified IAP identity
   integration if the dual prompt is undesirable.

## Security properties

- Disabled unless a valid `CMS_GOOGLE_CLIENT_ID` and `CMS_GOOGLE_WORKSPACE_DOMAIN` exist.
- Google Identity Services popup JWT is verified server-side by Google's
  supported `google-auth-library`, including signature, issuer, audience,
  expiry and hosted-domain claim.
- Login attempts require a short-lived, HttpOnly, SameSite=Strict anti-CSRF
  cookie and a matching Google JWT nonce.
- Google login requires `email_verified=true`, the exact Workspace
  `hd` domain and a registered, active CMS staff account.
- On first successful login, that CMS user is linked to the immutable Google
  subject (`sub`). Later sign-ins with a different Google subject are refused.
- CMS sessions use existing HttpOnly cookies and RBAC. Google login does
  not change content privileges, create an admin, or grant Cloud Run IAM.
- Google Workspace passwords are managed through Google, while the
  **separate** CMS temporary-password/change-password flow remains available.

## Rollback and verification

To disable Google login, remove `CMS_GOOGLE_CLIENT_ID` from the Cloud Run
service's environment, or deploy the previously stable image. Password login
continues to function. The migration only adds a nullable field and unique
index. Do not remove or overwrite existing staff users.

Locally run `npm run check:auth`, `npm run check:workflow` and
`npm run check:editor`. A real Google browser sign-in must be tested on the
exact authorized origin with a consent-screen-approved work account before
production traffic is promoted.
