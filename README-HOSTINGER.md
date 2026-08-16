# CloudAlls Node.js — Hostinger deployment

This project is the staged Node.js/Express migration of CloudAlls. It is intended for Hostinger Node.js Web App deployment on `z.cloudalls.com` while the existing PHP production site remains on `www.cloudalls.com`.

## Hostinger settings

Use the GitHub repository `mnmuthukad/cloudalls-node`, branch `main`, repository root `./`, framework preset **Express**, and Node.js **22.x**. Use `npm ci && npm run build` as the build command and `npm start` as the start command. The application listens on Hostinger’s assigned `PORT`; do not hard-code a public port.

## Required production variables

Set these privately in Hostinger’s Environment variables panel. Never commit them to GitHub and never paste them into public issues or chat.

| Variable | Purpose |
|---|---|
| `NODE_ENV` | Set to `production`. |
| `APP_URL` | Set to `https://z.cloudalls.com` during staging. Change to the canonical production origin only at cutover. |
| `SESSION_SECRET` | Unique random secret of at least 64 characters. |
| `DB_HOST`, `DB_PORT` | Hostinger MySQL host and port. |
| `DB_PUB_NAME`, `DB_PUB_USER`, `DB_PUB_PASS` | Read-only or least-privilege account for the public CMS database. |
| `DB_RESP_NAME`, `DB_RESP_USER`, `DB_RESP_PASS` | Separate least-privilege account for contact, partnership, job, and session tables. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Optional notification mailer settings if email notifications are enabled. |
| `RECAPTCHA_SITE_KEY`, `RECAPTCHA_SECRET_KEY` | Optional reCAPTCHA settings if enabled for production forms. |
| `MAX_UPLOAD_MB` | Maximum upload limit. The current default is 8 MB. |

The application deliberately refuses to start in production with a development session secret or a localhost `APP_URL`.

## Database preparation

Import the supplied public schema into the public database and the response schema into the response database. Verify that the public account can only read CMS data and that the response account can insert the response tables plus maintain the `node_sessions` session table. Do not grant the web application unrestricted administrative privileges.

## First staging test

After deployment, verify `https://z.cloudalls.com/healthz`, `/`, `/about`, `/expertise`, `/contact`, `/partnership`, `/careers`, `/insights`, `/portfolio`, `/sitemap.xml`, and `/sw.js`. Confirm that the contact page contains a CSRF token and that a POST without a valid token returns HTTP 403. Then add the database variables and redeploy; verify that CMS records appear and that a controlled form submission creates the expected response row.

## Production cutover

Keep `www.cloudalls.com` on the PHP application until the staging test passes, backups are confirmed, the response databases are verified, and all public routes have been compared. At cutover, deploy the same Git commit to the production Node application, change `APP_URL` to the canonical origin, purge old service-worker caches if needed, and monitor the logs and response tables. Retain the PHP deployment for rollback until the Node application has completed an agreed observation window.

## Repaired migration notes

The repaired build restores the full eight-record expertise catalogue when the public database is temporarily unavailable, aligns partnership tiers with the response database (`Standard Partner`, `Pro Partner`, and `Academic Partner`), expands the partnership page, and restores separate professional-role and Academy-internship sections. Active records whose end date has passed are displayed as archived rather than silently disappearing; archived roles cannot accept new applications.

The build and check scripts invoke TypeScript through Node directly, which avoids failures caused by non-executable npm wrapper files after archive extraction. Run `npm ci` followed by `npm run build`, then use `npm start`. The application must receive Hostinger's assigned `PORT`; do not hard-code a public port.

Before enabling form traffic, verify the response database contains `contact_inquiries`, `partnership_applications`, `job_applications`, `dsr_requests`, and `node_sessions`. The partnership `tier` column must include `Academic Partner`. Set `DB_RESP_*` variables to the response database so CSRF sessions persist across restarts; do not rely on Express's in-memory session store in production.
