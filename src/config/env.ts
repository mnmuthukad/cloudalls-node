import "dotenv/config";
import { z } from "zod";

const optionalString = z.string().trim().optional().default("");

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  APP_URL: z.string().url().default("http://localhost:3000"),
  TRUST_PROXY_HOPS: z.coerce.number().int().min(0).max(5).default(1),
  HEALTH_DETAILS_TOKEN: optionalString,
  SESSION_SECRET: z.string().min(32).default("development-only-change-this-session-secret-32"),
  DB_HOST: optionalString,
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_PUB_NAME: optionalString,
  DB_PUB_USER: optionalString,
  DB_PUB_PASS: optionalString,
  DB_RESP_NAME: optionalString,
  DB_RESP_USER: optionalString,
  DB_RESP_PASS: optionalString,
  SMTP_HOST: optionalString,
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: optionalString,
  SMTP_PASS: optionalString,
  SMTP_FROM: optionalString,
  RECAPTCHA_SITE_KEY: optionalString,
  RECAPTCHA_SECRET_KEY: optionalString,
  RECAPTCHA_REQUIRED: z.enum(["true", "false"]).default("false").transform(value => value === "true"),
  MAX_UPLOAD_MB: z.coerce.number().positive().max(25).default(8),
  // One-shot guard for legacy response-table cleanup (old main-DB copies of the
  // response tables). Both flags must be set for the trigger endpoint to work.
  LEGACY_CLEANUP_ENABLED: z.enum(["true", "false"]).default("false"),
  LEGACY_CLEANUP_TOKEN: optionalString,
}).superRefine((value, ctx) => {
  if (value.NODE_ENV !== "production") return;

  if (value.SESSION_SECRET.includes("development-only") || value.SESSION_SECRET.length < 64) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["SESSION_SECRET"],
      message: "Production SESSION_SECRET must be a unique value of at least 64 characters.",
    });
  }

  if (/localhost|127\\.0\\.0\\.1/.test(value.APP_URL)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["APP_URL"],
      message: "Production APP_URL must use the deployed HTTPS hostname.",
    });
  }

  const recaptchaPartiallyConfigured = Boolean(value.RECAPTCHA_SITE_KEY) !== Boolean(value.RECAPTCHA_SECRET_KEY);
  if (recaptchaPartiallyConfigured || (value.RECAPTCHA_REQUIRED && (!value.RECAPTCHA_SITE_KEY || !value.RECAPTCHA_SECRET_KEY))) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["RECAPTCHA_SITE_KEY"],
      message: "RECAPTCHA_SITE_KEY and RECAPTCHA_SECRET_KEY must be configured together when CAPTCHA is enabled.",
    });
  }
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export const isProduction = env.NODE_ENV === "production";

export function hasPublicDatabaseConfig(): boolean {
  return Boolean(env.DB_HOST && env.DB_PUB_NAME && env.DB_PUB_USER);
}

export function hasResponsesDatabaseConfig(): boolean {
  return Boolean(env.DB_HOST && env.DB_RESP_NAME && env.DB_RESP_USER);
}
