import "dotenv/config";
import { z } from "zod";

const optionalString = z.string().trim().optional().default("");

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  APP_URL: z.string().url().default("http://localhost:3000"),
  SESSION_SECRET: z.string().min(32).default("development-only-change-this-session-secret-32"),
  DB_HOST: localhost,
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_PUB_NAME: u372413020_main_ca_public,
  DB_PUB_USER: u372413020_main_ca_public,
  DB_PUB_PASS: Salam@0912#2002$Naseema,
  DB_RESP_NAME: u372413020_main_ca_respns,
  DB_RESP_USER: u372413020_main_ca_respns,
  DB_RESP_PASS: Salam@0912#2002$Naseema,
  SMTP_HOST: optionalString,
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: optionalString,
  SMTP_PASS: optionalString,
  SMTP_FROM: optionalString,
  RECAPTCHA_SITE_KEY: optionalString,
  RECAPTCHA_SECRET_KEY: optionalString,
  MAX_UPLOAD_MB: z.coerce.number().positive().max(25).default(8),
}).superRefine((value, ctx) => {
  if (value.NODE_ENV === "production") {
    if (value.SESSION_SECRET.includes("development-only") || value.SESSION_SECRET.length < 64) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["SESSION_SECRET"], message: "Production SESSION_SECRET must be a unique value of at least 64 characters." });
    }
    if (/localhost|127\\.0\\.0\\.1/.test(value.APP_URL)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["APP_URL"], message: "Production APP_URL must use the deployed HTTPS hostname." });
    }
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
