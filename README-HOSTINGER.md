# CloudAlls Node.js — Hostinger operations runbook

This repository contains the staged Node.js/Express migration of CloudAlls. Hostinger should deploy the application from GitHub; do not edit the deployed files directly in hPanel. The current staging hostname is `z.cloudalls.com`, while the legacy PHP production site remains the rollback reference until cutover is approved.

## Deployment settings

Use repository `mnmuthukad/cloudalls-node`, branch `main`, repository root `./`, the Hostinger Node.js Web App preset, and Node.js `22.x` or newer. Use the following commands:

| Setting | Value |
|---|---|
| Install/build command | `npm ci && npm run build` |
| Start command | `npm start` |
| Public port | Hostinger-assigned `PORT`; do not hard-code a public port |
| Source of truth | GitHub `main` branch |
| Current staging origin | `https://z.cloudalls.com` |

The build compiles TypeScript, copies EJS views into `dist/views`, and retains the repository `data/` directory for DB-first content with JSON fallbacks. Hostinger should redeploy after each approved GitHub commit.

## Environment variables

Set all secrets privately in Hostinger's Environment variables panel. Never commit `.env` files, database passwords, SMTP credentials, CAPTCHA secrets, or health tokens to GitHub.

| Variable | Staging value or purpose |
|---|---|
| `NODE_ENV` | `production` on Hostinger. |
| `APP_URL` | `https://z.cloudalls.com` during staging. Change to the final canonical HTTPS origin only at cutover. |
| `SESSION_SECRET` | A unique random secret of at least 64 characters. The production guard rejects the development default and shorter values. |
| `TRUST_PROXY_HOPS` | Number of trusted reverse proxies in front of the app; use `1` for the normal Hostinger proxy arrangement unless Hostinger documents a different topology. |
| `HEALTH_DETAILS_TOKEN` | Optional private token. When set, it permits database detail output from `/healthz` through the `x-health-token` header. Keep it private. |
| `DB_HOST`, `DB_PORT` | Hostinger MySQL host and port, normally `3306`. |
| `DB_PUB_NAME`, `DB_PUB_USER`, `DB_PUB_PASS` | Public CMS database and least-privilege read account. |
| `DB_RESP_NAME`, `DB_RESP_USER`, `DB_RESP_PASS` | Response database and least-privilege account for form submissions and session storage. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Optional SMTP settings. When all required SMTP values are present, successful form persistence triggers a non-blocking notification email. |
| `RECAPTCHA_SITE_KEY`, `RECAPTCHA_SECRET_KEY` | Optional reCAPTCHA v3 key pair. Production configuration rejects partial CAPTCHA setup. |
| `RECAPTCHA_REQUIRED` | `false` for optional verification, or `true` only after the CAPTCHA site and secret keys have been tested on the deployed origin. |
| `MAX_UPLOAD_MB` | Upload limit, with a maximum accepted configuration of `25`; the default is `8`. |

The application refuses to start in production when `SESSION_SECRET` is a development value, `APP_URL` is localhost, or the CAPTCHA key pair is incomplete. SMTP and CAPTCHA are intentionally optional so that the application can still run while those external services are being configured.

## Database and content operation

Keep the two logical databases separate. The public account should read CMS tables only. The response account should write the contact, partnership, career, and data-request tables and maintain the `node_sessions` table required for persistent sessions. Do not grant the web application unrestricted administrative privileges.

Every public content area follows a DB-first pattern with a repository JSON fallback. If the public database is unavailable, pages should remain renderable from the editable files in `data/`. Form submissions require the response database in production because persistence and CSRF session continuity must not depend on Express's in-memory store.

Before enabling form traffic, verify that the response database contains `contact_inquiries`, `partnership_applications`, `job_applications`, `dsr_requests`, and `node_sessions`. Verify that partnership tiers include `Academic Partner` and that career records with expired end dates are treated as archived and do not accept new applications.

## Security and traffic controls

The application uses Helmet security headers, a restrictive content-security policy, CSRF protection, a general request limiter, a stricter form limiter, request and response timeouts, compressed responses above the configured threshold, honeypot fields, explicit legal-consent validation where required, and optional reCAPTCHA verification. Health checks bypass the general request limiter so uptime monitors do not consume visitor capacity.

These controls improve application-level resilience but are not a substitute for a provider-level WAF or distributed rate limiter. For a high-traffic launch, keep Hostinger's edge protection enabled if available, add a WAF/CDN policy, monitor 429 and 5xx rates, and review database connection saturation before increasing application limits.

## Staging verification

After each Hostinger deployment, run the following checks from a trusted terminal:

```bash
curl -i https://z.cloudalls.com/healthz
curl -i https://z.cloudalls.com/robots.txt
curl -I https://z.cloudalls.com/
```

A healthy response from `/healthz` should contain `{"ok":true,"service":"cloudalls-node","ready":true}` and return HTTP 200. It intentionally omits database details unless the private token is supplied:

```bash
curl -H "x-health-token: YOUR_PRIVATE_HEALTH_DETAILS_TOKEN" https://z.cloudalls.com/healthz
```

The staging hostname must remain protected. While `APP_URL` contains `z.cloudalls.com`, the application sends `X-Robots-Tag: noindex, nofollow, noarchive` and `robots.txt` disallows crawling. Confirm both behaviors before sharing staging publicly.

Verify the home page, `/about`, `/expertise`, `/contact`, `/partnership`, `/careers`, `/insights`, `/portfolio`, `/legal`, `/data-requests`, `/sitemap.xml`, and `/sw.js`. Confirm that the four form pages render a CSRF token and hidden bot-protection fields. Do not submit a real contact, partnership, career, or data-request form during testing. A POST without a valid CSRF token should return HTTP 403.

Use browser developer tools or a synthetic request to confirm that static assets are cached and compressed, and that mobile pages do not create horizontal overflow. Review Hostinger logs for startup errors, database connection failures, repeated 429 responses, and notification delivery errors.

## Backups and alerting

Enable and periodically verify Hostinger's automated backups in **hPanel → Backups**. Daily backups are recommended for the production database and application state, with a retention period appropriate to the business. A backup is not considered verified until a restore test has been completed in a non-production location.

Configure Hostinger uptime monitoring or an external service such as UptimeRobot against `/healthz`. Alert on downtime, HTTP 503 responses, sustained 5xx errors, and unusual latency. If the health-details token is configured, do not place it in a public monitoring URL; public monitors should use the unauthenticated health response only.

## Production cutover

Keep the PHP site available as the rollback path until staging has passed route, content, form-rendering, database, notification, backup, and monitoring checks. At cutover, deploy the approved Git commit to the production Node.js application, change `APP_URL` from `https://z.cloudalls.com` to the final canonical HTTPS origin, and redeploy.

The staging noindex protection is driven by the `APP_URL` value. It is removed automatically only when the final production origin no longer contains `z.cloudalls.com`; do not remove the protection by editing a deployed file. After cutover, confirm that `robots.txt` allows crawling and contains the final sitemap URL, verify canonical links, purge old service-worker caches if needed, and monitor logs and response tables during the agreed observation window.

Retain the PHP deployment and database backups until the Node.js application has been stable for the agreed rollback period. If a rollback is necessary, restore the previous Hostinger application and keep the Node.js commit available for diagnosis; do not delete response data while investigating.

## GitHub-only change policy

All application, template, stylesheet, dependency, and documentation changes must be committed and pushed to `mnmuthukad/cloudalls-node` on `main`. Hostinger should consume those commits through its GitHub deployment integration. Hostinger environment-variable changes, database imports, backup settings, and uptime-monitoring settings are operational configuration and should be performed privately in the relevant provider panels, never committed as secrets.
