# CloudAlls Hostinger 503 remediation

## What was verified

The staging URL `https://z.cloudalls.com` currently returns Hostinger's generic `503 Service Unavailable` page before the Express application responds. The migrated application was then built and exercised locally with Node.js 22. The health endpoint returned HTTP 200, all public routes returned HTTP 200, and a form submission without a CSRF token correctly returned HTTP 403.

## Most likely cause

A Hostinger 503 at this stage means the web proxy cannot reach a healthy Node process. In this project, production startup intentionally exits when `SESSION_SECRET` is missing, too short, or still contains the development placeholder. Missing or invalid Hostinger environment variables can therefore produce a 503 even when the deployment itself says “Completed.” A second common cause is using a start command that does not run the compiled file.

## Hostinger settings

| Setting | Value |
|---|---|
| Framework | Express |
| Node.js | 22.x |
| Repository | `mnmuthukad/cloudalls-node` |
| Branch | `main` |
| Root directory | `./` |
| Build command | `npm ci && npm run build` |
| Start command | `npm start` |
| Application URL | `https://z.cloudalls.com` |

Set the following in Hostinger's **Environment variables** panel. Do not commit them to GitHub.

```text
NODE_ENV=production
APP_URL=https://z.cloudalls.com
SESSION_SECRET=<a unique random string of at least 64 characters>
DB_HOST=<Hostinger MySQL host>
DB_PORT=3306
DB_PUB_NAME=<public database name>
DB_PUB_USER=<public database user>
DB_PUB_PASS=<public database password>
DB_RESP_NAME=<responses database name>
DB_RESP_USER=<responses database user>
DB_RESP_PASS=<responses database password>
MAX_UPLOAD_MB=8
```

For the first staging boot, the two database groups may remain unset if the site is being checked without CMS data. The `SESSION_SECRET`, `NODE_ENV`, and `APP_URL` must still be configured. Once the database values are present, import `01_db_system.sql` and `02_db_public.sql` into the public database and `03_db_responses.sql` into the response database, using separate least-privilege accounts.

## Recovery sequence

1. Save the variables and click **Redeploy** in Hostinger.
2. Open Runtime logs and confirm a line similar to `CloudAlls Node.js listening on port <assigned-port>`.
3. Open `https://z.cloudalls.com/healthz`; it must return `{"ok":true,"service":"cloudalls-node"}`.
4. Verify `/`, `/about`, `/expertise`, `/contact`, `/partnership`, `/careers`, `/insights`, `/portfolio`, `/sitemap.xml`, and `/sw.js`.
5. Add the database variables, redeploy, and confirm that CMS content appears and that a controlled contact form submission creates one row in `contact_inquiries`.
6. Keep the PHP production site unchanged until staging has passed the route, form, backup, and data checks.

## Local verification

```bash
npm ci
npm run check
npm run build
NODE_ENV=production PORT=4317 APP_URL=https://z.cloudalls.com SESSION_SECRET='<64+ character secret>' node dist/server.js
PORT=4317 node scripts/smoke-check.mjs
```
