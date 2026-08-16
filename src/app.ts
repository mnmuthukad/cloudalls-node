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
import { publicRouter } from "./routes/public.js";
import { formsRouter } from "./routes/forms.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const app = express();
  const publicDir = path.join(__dirname, "../public");
  const viewsDir = path.join(__dirname, "views");

  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.set("view engine", "ejs");
  app.set("views", viewsDir);

  app.use((req, res, next) => {
    res.locals.cspNonce = crypto.randomBytes(16).toString("base64");
    next();
  });
  app.use(securityHeaders);
  app.use((_req, res, next) => {
    res.setHeader("Permissions-Policy", "accelerometer=(), autoplay=(), camera=(), clipboard-read=(), clipboard-write=(), geolocation=(), gyroscope=(), hid=(), interest-cohort=(), magnetometer=(), microphone=(), payment=(), publickey-credentials-get=(), screen-wake-lock=(), serial=(), sync-xhr=(), usb=()");
    if (env.APP_URL.includes("z.cloudalls.com")) res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
    next();
  });
  app.use(compression());
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

  app.get("/healthz", async (_req, res) => {
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
    res.status(200).json({ ok: true, service: "cloudalls-node", database: { public: publicDatabase, responses: responsesDatabase } });
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
    res.status(404).render("errors/404", buildLayoutData({ pageTitle: "Page not found", pageDescription: "The requested page could not be found.", canonicalUrl: _req.path }));
  });

  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("CLOUDALLS_ERROR", error);
    if (res.headersSent) return;
    res.status(500).render("errors/500", buildLayoutData({ pageTitle: "Service error", pageDescription: "CloudAlls is temporarily unable to complete this request.", canonicalUrl: _req.path }));
  });

  return app;
}
