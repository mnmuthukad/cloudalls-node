import nodemailer from "nodemailer";
import { env } from "../config/env.js";

export type NotificationType = "contact" | "partnership" | "job_application" | "dsr";

type NotificationPayload = Record<string, unknown>;

let transporter: nodemailer.Transporter | null = null;
let warnedMissingSmtp = false;

function smtpReady(): boolean {
  return Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS && env.SMTP_FROM && env.SMTP_PORT);
}

function getTransporter(): nodemailer.Transporter | null {
  if (!smtpReady()) {
    if (!warnedMissingSmtp) {
      warnedMissingSmtp = true;
      console.warn("SMTP notifications are disabled because SMTP_HOST, SMTP_USER, SMTP_PASS, and SMTP_FROM are not fully configured.");
    }
    return null;
  }

  transporter ??= nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 8000,
  });
  return transporter;
}

function labelize(value: string): string {
  return value.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/_/g, " ").replace(/\b\w/g, character => character.toUpperCase());
}

function renderText(type: NotificationType, payload: NotificationPayload): string {
  const lines = [`CloudAlls ${labelize(type)} submission`, "", `Received: ${new Date().toISOString()}`, ""];
  for (const [key, value] of Object.entries(payload)) {
    if (key === "requestIp") continue;
    lines.push(`${labelize(key)}: ${String(value ?? "")}`);
  }
  return lines.join("\n");
}

export async function notifySubmission(type: NotificationType, payload: NotificationPayload): Promise<void> {
  const mailer = getTransporter();
  if (!mailer) return;

  try {
    await mailer.sendMail({
      from: env.SMTP_FROM,
      to: env.SMTP_USER,
      replyTo: typeof payload.email === "string" ? payload.email : typeof payload.requesterEmail === "string" ? payload.requesterEmail : undefined,
      subject: `[CloudAlls] New ${labelize(type)} submission`,
      text: renderText(type, payload),
    });
  } catch (error) {
    console.error("SUBMISSION_NOTIFICATION_ERROR", error instanceof Error ? error.message : "unknown error");
  }
}
