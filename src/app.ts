import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import compression from "compression";
import express from "express";
import morgan from "morgan";
import { createSessionMiddleware } from "./middleware/session.js";
import { csrfMiddleware, generalLimiter, securityHeaders } from "./middleware/security.js";
import { env } from "./config/env.js";
import { getPublicDb, getResponsesDb } from "./config/database.js";
import { buildLayoutData } from "./services/layout.service.js";
import { initializeSchemas } from "./config/schema.js";
import { restructureBrandDatabase } from "./services/db-restructure.service.js";
import { runLegacyCleanup } from "./services/db-migration.service.js";
import { publicRouter } from "./routes/public.js";
import { formsRouter } from "./routes/forms.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const app = express();
  // One-time, idempotent restructure: reconciles live DB divisions/expertise with the
  // new consolidated subsidiary model defined in the data/ JSON files.
  void restructureBrandDatabase(getPublicDb());
  void initializeSchemas();
  const publicDir = path.join(__dirname, "../public");
  const viewsDir = path.join(__dirname, "views");

  app.disable("x-powered-by");
  app.set("trust proxy", env.TRUST_PROXY_HOPS);
  app.set("view engine", "ejs");
  app.set("views", viewsDir);

  app.use((req, res, next) => {
    res.locals.cspNonce = crypto.randomBytes(16).toString("base64");
    next();
  });
  app.use(securityHeaders);
  app.use((_req, res, next) => {
    // Enforce a full Content-Security-Policy ourselves (second header). Some hosting
    // platforms inject a minimal CSP of their own; browsers evaluate ALL CSP headers
    // as a union of restrictions, so our header remains effective either way.
    const nonce = (res.locals.cspNonce as string) || "";
    const policy = [
      "default-src 'self'",
      "base-uri 'self'",
      "font-src 'self' data: https://cdn.jsdelivr.net",
      "form-action 'self'",
      "frame-ancestors 'self'",
      `img-src 'self' data: https:`,
      "object-src 'none'",
      `script-src 'self' 'nonce-${nonce}' https://www.google.com https://www.gstatic.com`,
      "script-src-attr 'none'",
      "style-src 'self' 'unsafe-inline'",
      "connect-src 'self' https://www.google.com https://www.gstatic.com",
      "manifest-src 'self'",
      "upgrade-insecure-requests",
      "frame-src 'self' https://www.google.com",
    ].join(";");
    res.appendHeader("Content-Security-Policy", policy);
    res.setHeader("Permissions-Policy", "accelerometer=(), autoplay=(), camera=(), clipboard-read=(), clipboard-write=(), geolocation=(), gyroscope=(), hid=(), interest-cohort=(), magnetometer=(), microphone=(), payment=(), publickey-credentials-get=(), screen-wake-lock=(), serial=(), sync-xhr=(), usb=()");
    if (env.APP_URL.includes("z.cloudalls.com")) res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
    next();
  });
  app.use(compression({ threshold: 1024, level: 6 }));
  app.use((req, res, next) => {
    req.setTimeout(15000);
    res.setTimeout(15000);
    next();
  });
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
  app.use(express.urlencoded({ extended: true, limit: "2mb" }));
  app.use(express.json({ limit: "2mb" }));
  app.use(createSessionMiddleware());
  app.use(generalLimiter);
  app.use(csrfMiddleware);

  app.get("/robots.txt", (_req, res) => {
    const staging = env.APP_URL.includes("z.cloudalls.com") || env.NODE_ENV !== "production";
    const body = staging ? "User-agent: *\nDisallow: /\n" : `User-agent: *\nAllow: /\nSitemap: ${env.APP_URL.replace(/\/$/, "")}/sitemap.xml\n`;
    res.type("text/plain").send(body);
  });

  app.use(express.static(publicDir, {
    etag: true,
    maxAge: env.NODE_ENV === "production" ? "1y" : 0,
    immutable: env.NODE_ENV === "production",
    index: false,
    dotfiles: "deny",
    setHeaders: (res, filePath) => {
      if (filePath.endsWith("/sw.js")) {
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      } else if (filePath.endsWith("/manifest.json")) {
        res.setHeader("Cache-Control", "public, max-age=300, must-revalidate");
      }
    },
  }));

  app.get("/healthz", async (req, res) => {
    const probe = async (pool: ReturnType<typeof getPublicDb>) => {
      if (!pool) return { configured: false, reachable: false };
      try {
        await pool.query("SELECT 1");
        return { configured: true, reachable: true };
      } catch {
        return { configured: true, reachable: false };
      }
    };
    const [publicDatabase, responsesDatabase] = await Promise.all([probe(getPublicDb()), probe(getResponsesDb())]);
    const ready = (!publicDatabase.configured || publicDatabase.reachable) && (!responsesDatabase.configured || responsesDatabase.reachable);
    const suppliedToken = req.get("x-health-token") || "";
    const tokenMatches = Boolean(env.HEALTH_DETAILS_TOKEN && suppliedToken && suppliedToken.length === env.HEALTH_DETAILS_TOKEN.length && crypto.timingSafeEqual(Buffer.from(suppliedToken), Buffer.from(env.HEALTH_DETAILS_TOKEN)));
    const wantsReadiness = req.query.ready === "1" || tokenMatches;
    const response: Record<string, unknown> = { ok: true, service: "cloudalls-node", ready };
    if (tokenMatches) response.database = { public: publicDatabase, responses: responsesDatabase };
    res.status(wantsReadiness && !ready ? 503 : 200).json(response);
  });

  // One-shot, double-gated legacy response-table cleanup endpoint.
  // Only reachable when LEGACY_CLEANUP_ENABLED=true AND a secret token is
  // supplied (constant-time compared). It copies old response rows into the
  // new responses database and drops the old duplicate tables ONLY after
  // per-table row-count verification. See db-migration.service.ts.
  // TEMPORARY read-only diagnostic: verifies post-migration row counts in the
  // responses database. Removed in a follow-up commit.
  app.get("/debug-response-rows", async (req, res) => {
    const suppliedToken = (req.query.token as string) || "";
    const tokenSet = Boolean(env.HEALTH_DETAILS_TOKEN) && env.HEALTH_DETAILS_TOKEN.length >= 20;
    const tokenMatches = tokenSet && Boolean(suppliedToken) && suppliedToken.length === env.HEALTH_DETAILS_TOKEN.length && crypto.timingSafeEqual(Buffer.from(suppliedToken), Buffer.from(env.HEALTH_DETAILS_TOKEN));
    if (!tokenMatches) {
      return res.status(403).json({ ok: false, error: "not authorized" });
    }
    const pool = getResponsesDb();
    const tables = ["contact_inquiries", "partnership_applications", "job_applications", "dsr_requests"];
    const counts: Record<string, number> = {};
    if (pool) {
      for (const t of tables) {
        try {
          const [rows] = await pool.query(`SELECT COUNT(*) AS c FROM ${t}`);
          counts[t] = (rows as [{ c: number }])[0].c;
        } catch (err) {
          counts[t] = -1;
        }
      }
    }
    return res.json({ ok: true, database: env.DB_RESP_NAME, counts });
  });

  app.post("/migrate-legacy-responses", async (req, res) => {
    const enabled = env.LEGACY_CLEANUP_ENABLED === "true";
    const suppliedToken = (req.query.token as string) || "";
    const tokenSet = Boolean(env.LEGACY_CLEANUP_TOKEN) && env.LEGACY_CLEANUP_TOKEN.length >= 32;
    const tokenMatches = tokenSet && Boolean(suppliedToken) && suppliedToken.length === env.LEGACY_CLEANUP_TOKEN.length && crypto.timingSafeEqual(Buffer.from(suppliedToken), Buffer.from(env.LEGACY_CLEANUP_TOKEN));
    if (!enabled || !tokenMatches) {
      return res.status(403).json({ ok: false, error: "legacy cleanup not enabled" });
    }
    try {
      const results = await runLegacyCleanup();
      res.json({ ok: true, results });
    } catch (error) {
      res.status(500).json({ ok: false, error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.get("/", (_req, res) => {
    res.render("pages/home", {
      ...buildLayoutData({
        currentPage: "index",
        pageTitle: "AI & Web Development Expertise | Innovation Lab | CloudAlls",
        canonicalUrl: "/",
      }),
      content: { migration: true },
    });
  });

  app.use(formsRouter);
  app.use(publicRouter);

  app.use((_req, res) => {
    res.status(404).render("errors/404", buildLayoutData({ pageTitle: "Page not found", pageDescription: "The requested page could not be found.", canonicalUrl: "/", noindex: true }));
  });

  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("CLOUDALLS_ERROR", error);
    if (res.headersSent) return;
    res.status(500).render("errors/500", buildLayoutData({ pageTitle: "Service error", pageDescription: "CloudAlls is temporarily unable to complete this request.", canonicalUrl: "/", noindex: true }));
  });

  return app;
}
