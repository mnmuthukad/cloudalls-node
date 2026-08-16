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
  skip: req => req.path === "/healthz",
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

interface RecaptchaResponse {
  success?: boolean;
  action?: string;
  score?: number;
}

function isRecaptchaResponse(value: unknown): value is RecaptchaResponse {
  return typeof value === "object" && value !== null;
}

export async function verifyRecaptcha(req: Request, token: string, expectedAction: string): Promise<{ enabled: boolean; valid: boolean }> {
  const enabled = env.RECAPTCHA_REQUIRED || Boolean(env.RECAPTCHA_SECRET_KEY);
  if (!enabled) return { enabled: false, valid: true };
  if (!env.RECAPTCHA_SECRET_KEY || !token) return { enabled: true, valid: false };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    const body = new URLSearchParams({ secret: env.RECAPTCHA_SECRET_KEY, response: token });
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
      signal: controller.signal,
    });
    if (!response.ok) return { enabled: true, valid: false };
    const result: unknown = await response.json();
    if (!isRecaptchaResponse(result) || result.success !== true) return { enabled: true, valid: false };
    if (result.action && result.action !== expectedAction) return { enabled: true, valid: false };
    if (typeof result.score === "number" && result.score < 0.5) return { enabled: true, valid: false };
    return { enabled: true, valid: true };
  } catch (error) {
    console.error("RECAPTCHA_VERIFY_ERROR", error instanceof Error ? error.message : "unknown error");
    return { enabled: true, valid: false };
  } finally {
    clearTimeout(timeout);
  }
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
