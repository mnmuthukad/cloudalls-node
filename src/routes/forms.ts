import crypto from "node:crypto";
import { Router, type Request } from "express";
import { z } from "zod";
import { buildLayoutData } from "../services/layout.service.js";
import { getActiveCareers, getActiveExpertise } from "../services/content.service.js";
import { insertContactInquiry, insertJobApplication, insertPartnershipApplication } from "../services/response.service.js";
import { formLimiter } from "../middleware/security.js";

const contactSchema = z.object({
  name: z.string().trim().min(1).max(150),
  whatsapp: z.string().trim().regex(/^[0-9+()\-\s]{6,30}$/),
  email: z.string().trim().email().max(320),
  service: z.string().trim().min(1).max(150),
  message: z.string().trim().min(1).max(5000),
});

const partnershipSchema = z.object({
  company_name: z.string().trim().min(1).max(200),
  website: z.string().trim().url().max(500),
  email: z.string().trim().email().max(320),
  partner_tier: z.enum(["Standard Partner", "Pro Partner", "Strategic Partner"]),
  proposal: z.string().trim().min(1).max(10000),
});

const jobSchema = z.object({
  first_name: z.string().trim().min(1).max(100),
  last_name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().min(6).max(30),
  portfolio_url: z.string().trim().url().max(500),
  cover_letter: z.string().trim().min(1).max(10000),
});

function rotateCsrf(req: Request): void {
  req.session.csrfToken = crypto.randomBytes(32).toString("hex");
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
    });
  } catch (error) { next(error); }
});

formsRouter.post("/contact", formLimiter, async (req, res) => {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) {
    res.redirect("/contact?status=error&msg=invalid");
    return;
  }
  try {
    await insertContactInquiry(parsed.data);
    rotateCsrf(req);
    res.redirect("/contact?status=success");
  } catch (error) {
    console.error("CONTACT_FORM_ERROR", error);
    res.redirect("/contact?status=error&msg=db");
  }
});

formsRouter.get("/partnership", (_req, res) => {
  res.render("pages/partnership", {
    ...buildLayoutData({ currentPage: "partnership", pageTitle: "Partner with CloudAlls | Ecosystem Network", pageDescription: "Join the CloudAlls partner network and create mutual technology value.", canonicalUrl: "/partnership" }),
    status: "",
  });
});

formsRouter.post("/process-partnership", formLimiter, async (req, res) => {
  const parsed = partnershipSchema.safeParse(req.body);
  if (!parsed.success) {
    res.redirect("/partnership?status=error&msg=invalid#apply");
    return;
  }
  try {
    await insertPartnershipApplication({ company: parsed.data.company_name, website: parsed.data.website, tier: parsed.data.partner_tier, email: parsed.data.email, proposal: parsed.data.proposal });
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

formsRouter.get("/careers_details", async (req, res, next) => {
  try {
    const jobId = Number(req.query.id);
    const careers = await getActiveCareers();
    const job = careers.find(item => item.id === jobId);
    if (!job) {
      res.redirect("/careers");
      return;
    }
    res.render("pages/career-detail", {
      ...buildLayoutData({ currentPage: "careers", pageTitle: `${job.title} | Careers at CloudAlls`, pageDescription: job.description ? job.description.replace(/<[^>]*>/g, "").slice(0, 155) : "Join CloudAlls.", canonicalUrl: `/careers_details?id=${job.id}` }),
      job,
      formStatus: typeof req.query.status === "string" ? req.query.status : "",
    });
  } catch (error) { next(error); }
});

formsRouter.post("/careers_details", formLimiter, async (req, res) => {
  const jobId = Number(req.query.id);
  const careers = await getActiveCareers();
  const job = careers.find(item => item.id === jobId);
  const parsed = jobSchema.safeParse(req.body);
  if (!job || !parsed.success) {
    res.redirect(`/careers_details?id=${Number.isFinite(jobId) ? jobId : 0}&status=error`);
    return;
  }
  try {
    await insertJobApplication({ jobId: job.id, jobTitle: job.title, firstName: parsed.data.first_name, lastName: parsed.data.last_name, email: parsed.data.email, phone: parsed.data.phone, portfolioUrl: parsed.data.portfolio_url, coverLetter: parsed.data.cover_letter });
    rotateCsrf(req);
    res.redirect(`/careers_details?id=${job.id}&status=success`);
  } catch (error) {
    console.error("CAREER_FORM_ERROR", error);
    res.redirect(`/careers_details?id=${job.id}&status=error`);
  }
});
