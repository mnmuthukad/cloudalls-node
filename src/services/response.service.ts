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

export async function insertContactInquiry(input: ContactInput): Promise<void> {
  const db = getResponsesDb();
  if (!db) throw new Error("Responses database is not configured");
  await db.execute(
    "INSERT INTO contact_inquiries (name, email, whatsapp, service, message, status, source_path) VALUES (?, ?, ?, ?, ?, 'New', ?)",
    [input.name, input.email, input.whatsapp, input.service, input.message, "/contact"],
  );
}

export async function insertPartnershipApplication(input: PartnershipInput): Promise<void> {
  const db = getResponsesDb();
  if (!db) throw new Error("Responses database is not configured");
  await db.execute(
    "INSERT INTO partnership_applications (company, website, tier, email, proposal, status, source_path) VALUES (?, ?, ?, ?, ?, 'Pending', ?)",
    [input.company, input.website, input.tier, input.email, input.proposal, "/partnership"],
  );
}

export async function insertJobApplication(input: JobApplicationInput): Promise<void> {
  const db = getResponsesDb();
  if (!db) throw new Error("Responses database is not configured");
  await db.execute(
    "INSERT INTO job_applications (job_id, job_title, first_name, last_name, email, phone, portfolio_url, cover_letter, status, source_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'New', ?)",
    [input.jobId, input.jobTitle, input.firstName, input.lastName, input.email, input.phone, input.portfolioUrl, input.coverLetter, "/careers_details"],
  );
}

export interface DsrInput {
  requesterName: string;
  requesterEmail: string;
  requestType: string;
  specificDetails: string;
  requestIp: string;
}

export async function insertDsrRequest(input: DsrInput): Promise<void> {
  const db = getResponsesDb();
  if (!db) throw new Error("Responses database is not configured");
  await db.execute(
    "INSERT INTO dsr_requests (requester_name, requester_email, request_type, specific_details, request_ip, status, source_path) VALUES (?, ?, ?, ?, ?, 'Pending', ?)",
    [input.requesterName, input.requesterEmail, input.requestType, input.specificDetails, input.requestIp, "/data-requests"],
  );
}
