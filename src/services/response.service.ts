import fs from "node:fs/promises";
import path from "node:path";
import { getResponsesDb } from "../config/database.js";

export interface ContactInput {
  name: string;
  email: string;
  whatsapp: string;
  service: string;
  message: string;
}

export interface PartnershipInput {
  company: string;
  website: string;
  tier: string;
  email: string;
  proposal: string;
}

export interface JobApplicationInput {
  jobId: number;
  jobTitle: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  portfolioUrl: string;
  coverLetter: string;
}

export interface DsrInput {
  requesterName: string;
  requesterEmail: string;
  requestType: string;
  specificDetails: string;
  requestIp: string;
}

type SubmissionType = "contact" | "partnership" | "job_application" | "dsr";

async function writeFileFallback(type: SubmissionType, payload: unknown): Promise<void> {
  const directory = path.join(process.cwd(), "data", "submissions");
  const target = path.join(directory, `${type}.jsonl`);
  await fs.mkdir(directory, { recursive: true, mode: 0o700 });
  const record = {
    received_at: new Date().toISOString(),
    storage: "local-jsonl",
    payload,
  };
  await fs.appendFile(target, `${JSON.stringify(record)}\n`, { encoding: "utf8", mode: 0o600 });
  console.warn(`Responses database unavailable; stored ${type} submission in ${target}`);
}

async function persistSubmission<T>(type: SubmissionType, input: T, writeToDb: (db: NonNullable<ReturnType<typeof getResponsesDb>>) => Promise<void>): Promise<void> {
  const db = getResponsesDb();
  if (!db) {
    await writeFileFallback(type, input);
    return;
  }
  try {
    await writeToDb(db);
  } catch (error) {
    console.error(`Responses database ${type} insert failed; using local fallback`, error);
    await writeFileFallback(type, input);
  }
}

export async function insertContactInquiry(input: ContactInput): Promise<void> {
  await persistSubmission("contact", input, async db => {
    await db.execute(
      "INSERT INTO contact_inquiries (name, email, whatsapp, service, message, status, source_path) VALUES (?, ?, ?, ?, ?, 'New', ?)",
      [input.name, input.email, input.whatsapp, input.service, input.message, "/contact"],
    );
  });
}

export async function insertPartnershipApplication(input: PartnershipInput): Promise<void> {
  await persistSubmission("partnership", input, async db => {
    await db.execute(
      "INSERT INTO partnership_applications (company, website, tier, email, proposal, status, source_path) VALUES (?, ?, ?, ?, ?, 'Pending', ?)",
      [input.company, input.website, input.tier, input.email, input.proposal, "/partnership"],
    );
  });
}

export async function insertJobApplication(input: JobApplicationInput): Promise<void> {
  await persistSubmission("job_application", input, async db => {
    await db.execute(
      "INSERT INTO job_applications (job_id, job_title, first_name, last_name, email, phone, portfolio_url, cover_letter, status, source_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'New', ?)",
      [input.jobId, input.jobTitle, input.firstName, input.lastName, input.email, input.phone, input.portfolioUrl, input.coverLetter, `/careers/${input.jobId}`],
    );
  });
}

export async function insertDsrRequest(input: DsrInput): Promise<void> {
  await persistSubmission("dsr", input, async db => {
    await db.execute(
      "INSERT INTO dsr_requests (requester_name, requester_email, request_type, specific_details, request_ip, status, source_path) VALUES (?, ?, ?, ?, ?, 'Pending', ?)",
      [input.requesterName, input.requesterEmail, input.requestType, input.specificDetails, input.requestIp, "/data-requests"],
    );
  });
}
