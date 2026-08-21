import crypto from "node:crypto";
import { Router, type Request } from "express";
import { z } from "zod";
import { buildLayoutData } from "../services/layout.service.js";
import { getActiveCareers, getActiveExpertise } from "../services/content.service.js";
import { insertContactInquiry, insertDsrRequest, insertJobApplication, insertPartnershipApplication } from "../services/response.service.js";
import { notifySubmission } from "../services/notification.service.js";
import { formLimiter, verifyRecaptcha } from "../middleware/security.js";

const botTrap = z.string().max(0).optional().default("");
const recaptchaToken = z.string().max(4096).optional().default("");

const contactSchema = z.object({
  name: z.string().trim().min(1).max(150),
  whatsapp: z.string().trim().regex(/^[0-9+()\-\s]{6,30}$/),
  email: z.string().trim().email().max(320),
  service: z.string().trim().min(1).max(150),
  message: z.string().trim().min(1).max(5000),
  legal_consent: z.literal("on"),
  bot_trap: botTrap,
  recaptcha_token: recaptchaToken,
});

const partnershipSchema = z.object({
  company_name: z.string().trim().min(1).max(200),
  website: z.string().trim().url().max(500),
  email: z.string().trim().email().max(320),
  partner_tier: z.enum(["Standard Partner", "Pro Partner", "Academic Partner"]),
  proposal: z.string().trim().min(1).max(10000),
  bot_trap: botTrap,
  recaptcha_token: recaptchaToken,
});

const jobSchema = z.object({
  first_name: z.string().trim().min(1).max(100),
  last_name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().min(6).max(30),
  portfolio_url: z.string().trim().url().max(500),
  cover_letter: z.string().trim().min(1).max(10000),
  bot_trap: botTrap,
  recaptcha_token: recaptchaToken,
});

const dsrSchema = z.object({
  requester_name: z.string().trim().min(1).max(255),
  requester_email: z.string().trim().email().max(320),
  request_type: z.enum(["Access", "Modification", "Deletion", "Portability", "Objection", "Other"]),
  specific_details: z.string().trim().min(1).max(10000),
  legal_consent: z.literal("on"),
  bot_trap: botTrap,
  recaptcha_token: recaptchaToken,
});

function rotateCsrf(req: Request): void {
  req.session.csrfToken = crypto.randomBytes(32).toString("hex");
}

async function passesVerification(req: Request, token: string, action: string): Promise<boolean> {
  const result = await verifyRecaptcha(req, token, action);
  return result.valid;
}

function isBot(trapValue: string): boolean {
  return Boolean(trapValue.trim());
}

export const formsRouter = Router();

formsRouter.get("/contact", async (req, res, next) => {
  try {
    const expertise = await getActiveExpertise();
    res.render("pages/contact", {
      ...buildLayoutData({ currentPage: "contact", pageTitle: "Contact Us | Start a Project with CloudAlls", pageDescription: "Get in touch with CloudAlls to discuss AI, web development, and digital systems.", pageKeywords: "Contact CloudAlls, hire tech agency Kerala, web development quote India", canonicalUrl: "/contact" }),
      expertise,
      preselectedService: typeof req.query.service === "string" ? req.query.service : "",
      status: typeof req.query.status === "string" ? req.query.status : "",
      errorMsg: typeof req.query.msg === "string" ? req.query.msg : "",
    });
  } catch (error) { next(error); }
});

formsRouter.post("/contact", formLimiter, async (req, res) => {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) {
    res.redirect("/contact?status=error&msg=invalid");
    return;
  }
  if (isBot(parsed.data.bot_trap)) {
    rotateCsrf(req);
    res.redirect("/contact?status=success");
    return;
  }
  if (!(await passesVerification(req, parsed.data.recaptcha_token, "contact"))) {
    res.redirect("/contact?status=error&msg=verification");
    return;
  }
  try {
    const input = { name: parsed.data.name, email: parsed.data.email, whatsapp: parsed.data.whatsapp, service: parsed.data.service, message: parsed.data.message };
    await insertContactInquiry(input);
    void notifySubmission("contact", input);
    rotateCsrf(req);
    res.redirect("/contact?status=success");
  } catch (error) {
    console.error("CONTACT_FORM_ERROR", error);
    res.redirect("/contact?status=error&msg=db");
  }
});

formsRouter.get("/partnership", (req, res) => {
  const status = typeof req.query.status === "string" ? req.query.status : "";
  res.render("pages/partnership", {
    ...buildLayoutData({ currentPage: "partnership", pageTitle: "Partner with CloudAlls | Ecosystem Network", pageDescription: "Join the CloudAlls partner network and create mutual technology value.", canonicalUrl: "/partnership" }),
    status,
    errorMsg: typeof req.query.msg === "string" ? req.query.msg : "",
  });
});

formsRouter.post("/process-partnership", formLimiter, async (req, res) => {
  const parsed = partnershipSchema.safeParse(req.body);
  if (!parsed.success) {
    res.redirect("/partnership?status=error&msg=invalid#apply");
    return;
  }
  if (isBot(parsed.data.bot_trap)) {
    rotateCsrf(req);
    res.redirect("/partnership?status=success#apply");
    return;
  }
  if (!(await passesVerification(req, parsed.data.recaptcha_token, "partnership"))) {
    res.redirect("/partnership?status=error&msg=verification#apply");
    return;
  }
  try {
    const input = { company: parsed.data.company_name, website: parsed.data.website, tier: parsed.data.partner_tier, email: parsed.data.email, proposal: parsed.data.proposal };
    await insertPartnershipApplication(input);
    void notifySubmission("partnership", input);
    rotateCsrf(req);
    res.redirect("/partnership?status=success#apply");
  } catch (error) {
    console.error("PARTNERSHIP_FORM_ERROR", error);
    res.redirect("/partnership?status=error&msg=db#apply");
  }
});

formsRouter.get("/careers", async (_req, res, next) => {
  try {
    const careers = await getActiveCareers();
    res.render("pages/careers", {
      ...buildLayoutData({ currentPage: "careers", pageTitle: "Careers & Internship | CloudAlls", pageDescription: "Join CloudAlls and help organize the new technology culture.", canonicalUrl: "/careers" }),
      careers,
    });
  } catch (error) { next(error); }
});

formsRouter.get("/careers/:id", async (req, res, next) => {
  try {
    const jobId = Number(req.params.id);
    const careers = await getActiveCareers();
    const job = careers.find(item => item.id === jobId);
    if (!job) {
      res.redirect("/careers");
      return;
    }
    res.render("pages/career-detail", {
      ...buildLayoutData({ currentPage: "careers", pageTitle: `${job.title} | Careers at CloudAlls`, pageDescription: job.description ? job.description.replace(/<[^>]*>/g, "").slice(0, 155) : "Join CloudAlls.", canonicalUrl: `/careers/${job.id}` }),
      job,
      formStatus: typeof req.query.status === "string" ? req.query.status : "",
      formErrorMsg: typeof req.query.msg === "string" ? req.query.msg : "",
    });
  } catch (error) { next(error); }
});

formsRouter.get("/careers_details", (req, res) => {
  const jobId = Number(req.query.id);
  if (!Number.isFinite(jobId)) {
    res.redirect(301, "/careers");
    return;
  }
  const status = typeof req.query.status === "string" ? `?status=${encodeURIComponent(req.query.status)}` : "";
  res.redirect(301, `/careers/${jobId}${status}`);
});

formsRouter.post("/careers_details", (req, res) => {
  const jobId = Number(req.query.id);
  res.redirect(307, Number.isFinite(jobId) ? `/careers/${jobId}` : "/careers");
});

formsRouter.post("/careers/:id", formLimiter, async (req, res) => {
  const jobId = Number(req.params.id);
  const careers = await getActiveCareers();
  const job = careers.find(item => item.id === jobId);
  const parsed = jobSchema.safeParse(req.body);
  const roleExpired = Boolean(job?.end_date && String(job.end_date).slice(0, 10) < new Date().toISOString().slice(0, 10));
  if (!job || roleExpired || !parsed.success) {
    const status = roleExpired ? "closed" : "error";
    res.redirect(`/careers/${Number.isFinite(jobId) ? jobId : 0}?status=${status}`);
    return;
  }
  if (isBot(parsed.data.bot_trap)) {
    rotateCsrf(req);
    res.redirect(`/careers/${job.id}?status=success`);
    return;
  }
  if (!(await passesVerification(req, parsed.data.recaptcha_token, "job_application"))) {
    res.redirect(`/careers/${job.id}?status=error&msg=verification`);
    return;
  }
  try {
    const input = { jobId: job.id, jobTitle: job.title, firstName: parsed.data.first_name, lastName: parsed.data.last_name, email: parsed.data.email, phone: parsed.data.phone, portfolioUrl: parsed.data.portfolio_url, coverLetter: parsed.data.cover_letter };
    await insertJobApplication(input);
    void notifySubmission("job_application", input);
    rotateCsrf(req);
    res.redirect(`/careers/${job.id}?status=success`);
  } catch (error) {
    console.error("CAREER_FORM_ERROR", error);
    res.redirect(`/careers/${job.id}?status=error&msg=invalid`);
  }
});

formsRouter.get("/data-requests", (req, res) => {
  res.render("pages/data-requests", {
    ...buildLayoutData({ currentPage: "data-requests", pageTitle: "Data Subject Requests | CloudAlls", pageDescription: "Submit a secure request to access, modify, export, or delete personal data held by CloudAlls.", canonicalUrl: "/data-requests" }),
    status: typeof req.query.status === "string" ? req.query.status : "",
    errorMsg: typeof req.query.msg === "string" ? req.query.msg : "",
  });
});

formsRouter.post("/data-requests", formLimiter, async (req, res) => {
  const parsed = dsrSchema.safeParse(req.body);
  if (!parsed.success) {
    res.redirect("/data-requests?status=error&msg=invalid");
    return;
  }
  if (isBot(parsed.data.bot_trap)) {
    rotateCsrf(req);
    res.redirect("/data-requests?status=success");
    return;
  }
  if (!(await passesVerification(req, parsed.data.recaptcha_token, "dsr"))) {
    res.redirect("/data-requests?status=error&msg=verification");
    return;
  }
  try {
    const input = {
      requesterName: parsed.data.requester_name,
      requesterEmail: parsed.data.requester_email,
      requestType: parsed.data.request_type,
      specificDetails: parsed.data.specific_details,
      requestIp: req.ip || "unknown",
    };
    await insertDsrRequest(input);
    void notifySubmission("dsr", input);
    rotateCsrf(req);
    res.redirect("/data-requests?status=success");
  } catch (error) {
    console.error("DSR_FORM_ERROR", error);
    res.redirect("/data-requests?status=error&msg=db");
  }
});
