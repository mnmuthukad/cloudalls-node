import crypto from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { env, isProduction } from "../config/env.js";
import { buildLayoutData } from "../services/layout.service.js";

export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      fontSrc: ["'self'", "data:"],
      formAction: ["'self'"],
      frameAncestors: ["'self'"],
      frameSrc: ["'self'", "https://www.google.com"],
      imgSrc: ["'self'", "data:", "https:"],
      objectSrc: ["'none'"],
      scriptSrc: ["'self'", (_req, res) => {
        const expressResponse = res as unknown as Response;
        return `'nonce-${expressResponse.locals.cspNonce || ""}'`;
      }, "https://www.google.com", "https://www.gstatic.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "https://www.google.com", "https://www.gstatic.com"],
      manifestSrc: ["'self'"],
      upgradeInsecureRequests: isProduction ? [] : null,
    },
  },
  crossOriginEmbedderPolicy: false,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  hsts: isProduction ? { maxAge: 31536000, includeSubDomains: true } : false,
});

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: "Too many requests. Please try again later.",
});

export const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 12,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: "Too many form submissions. Please try again later.",
});

function safeTokenEquals(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export function csrfMiddleware(req: Request, res: Response, next: NextFunction): void {
  req.session.csrfToken ??= crypto.randomBytes(32).toString("hex");
  res.locals.csrfToken = req.session.csrfToken;

  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    next();
    return;
  }

  const submitted = typeof req.body?.csrf_token === "string" ? req.body.csrf_token : "";
  if (!submitted || !safeTokenEquals(submitted, req.session.csrfToken)) {
    res.status(403).render("errors/403", buildLayoutData({ pageTitle: "Request rejected", pageDescription: "The request could not be verified.", canonicalUrl: req.path }));
    return;
  }
  next();
}

export function secureCookieOptions() {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    maxAge: 1000 * 60 * 60 * 8,
  };
}

export { env };
