import { Router, type Request, type Response } from "express";
import { env } from "../config/env.js";
import { buildLayoutData } from "../services/layout.service.js";
import { loadJsonData } from "../services/data.service.js";
import { getActiveBrandDivisions, getActiveCareers, getActiveExpertise, getExpertiseBySlug, getLegalCompliancePillars, getLegalCrisisResponse, getLegalDirectory, getLegalDocumentBySlug, getLegalFrameworks, getPublishedFaqs, getPublishedInsights, getPublishedPortfolios, getPublishedTestimonials, sanitizeLegalHtml } from "../services/content.service.js";

interface PageSection {
  heading: string;
  body: string;
  bullets?: string[];
}

interface PageDefinition {
  currentPage: string;
  title: string;
  description: string;
  keywords: string;
  eyebrow: string;
  hero: string;
  sections: PageSection[];
}

const fallbackPage: PageDefinition = {
  currentPage: "resources",
  title: "CloudAlls Resources",
  description: "Useful knowledge and practical systems from CloudAlls.",
  keywords: "CloudAlls resources",
  eyebrow: "CloudAlls ecosystem",
  hero: "Useful knowledge, organized for action.",
  sections: [{ heading: "Start a conversation", body: "Tell us what you are building, improving, or trying to understand." }],
};

const pages = loadJsonData<Record<string, PageDefinition>>("content_pages.json", {
  resources: fallbackPage,
  about: { ...fallbackPage, currentPage: "about", title: "About CloudAlls" },
  expertise: { ...fallbackPage, currentPage: "expertise", title: "CloudAlls Expertise" },
  faq: { ...fallbackPage, currentPage: "faq", title: "CloudAlls FAQ" },
});

const aboutModel = loadJsonData("about_model.json", {
  sections: [{ title: "", body: "CloudAlls is a technology company and hybrid innovation lab." }],
  values: [],
  unique: [],
  chapters: [],
  leadershipTeam: [],
});

function renderDefinition(res: Response, slug: string): void {
  const page = pages[slug] ?? pages.resources!;
  res.render("pages/content", {
    ...buildLayoutData({
      currentPage: page.currentPage,
      pageTitle: page.title,
      pageDescription: page.description,
      pageKeywords: page.keywords,
      canonicalUrl: `/${slug}`,
    }),
    page,
  });
}

export const publicRouter = Router();

publicRouter.get("/about", (_req, res) => {
  const page = pages.about!;
  res.render("pages/about", { ...buildLayoutData({ currentPage: "about", pageTitle: page.title, pageDescription: page.description, pageKeywords: page.keywords, canonicalUrl: "/about" }), about: aboutModel });
});

publicRouter.get("/expertise", async (_req, res, next) => {
  try {
    const expertise = await getActiveExpertise();
    res.render("pages/expertise", {
      ...buildLayoutData({ currentPage: "expertise", pageTitle: "Expertise | AI, Web Development & Creative Systems | CloudAlls", canonicalUrl: "/expertise" }),
      expertise,
    });
  } catch (error) { next(error); }
});

publicRouter.get("/expertise_details", async (req, res, next) => {
  try {
    const slug = typeof req.query.slug === "string" ? req.query.slug : "";
    const expertise = await getExpertiseBySlug(slug);
    if (!expertise) {
      res.status(404).render("errors/404", buildLayoutData({ pageTitle: "Expertise not found", canonicalUrl: "/expertise_details" }));
      return;
    }
    res.render("pages/expertise-detail", {
      ...buildLayoutData({ currentPage: "expertise", pageTitle: `${expertise.title} | CloudAlls Expertise`, pageDescription: expertise.short_description || "CloudAlls expertise.", canonicalUrl: `/expertise_details?slug=${encodeURIComponent(expertise.slug)}` }),
      expertise,
    });
  } catch (error) { next(error); }
});

publicRouter.get("/insights", async (_req, res, next) => {
  try {
    const insights = await getPublishedInsights();
    res.render("pages/insights", { ...buildLayoutData({ currentPage: "insights", pageTitle: "Insights & Blog | CloudAlls", pageDescription: "Practical CloudAlls insights on AI, engineering, security, and operational technology.", canonicalUrl: "/insights" }), insights });
  } catch (error) { next(error); }
});

publicRouter.get("/insight_details", async (req, res, next) => {
  try {
    const slug = typeof req.query.slug === "string" ? req.query.slug : "";
    const insights = await getPublishedInsights();
    const insight = insights.find(item => item.slug === slug);
    if (!insight) {
      res.status(404).render("errors/404", buildLayoutData({ pageTitle: "Insight not found", canonicalUrl: "/insight_details" }));
      return;
    }
    res.render("pages/insight-detail", { ...buildLayoutData({ currentPage: "insights", pageTitle: insight.meta_title || `${insight.title} | CloudAlls`, pageDescription: insight.meta_description || insight.excerpt || "CloudAlls insight.", pageKeywords: insight.meta_keywords || "CloudAlls insights", canonicalUrl: `/insight_details?slug=${encodeURIComponent(insight.slug)}`, pageImage: insight.image_url || undefined }), insight });
  } catch (error) { next(error); }
});

publicRouter.get("/portfolio", async (_req, res, next) => {
  try {
    const portfolios = await getPublishedPortfolios();
    res.render("pages/portfolio", { ...buildLayoutData({ currentPage: "portfolio", pageTitle: "Portfolio & Case Studies | CloudAlls", pageDescription: "Explore CloudAlls case studies across engineering, AI, design, and operations.", canonicalUrl: "/portfolio" }), portfolios });
  } catch (error) { next(error); }
});

publicRouter.get("/portfolio_details", async (req, res, next) => {
  try {
    const slug = typeof req.query.slug === "string" ? req.query.slug : "";
    const portfolios = await getPublishedPortfolios();
    const portfolio = portfolios.find(item => item.slug === slug);
    if (!portfolio) {
      res.status(404).render("errors/404", buildLayoutData({ pageTitle: "Case study not found", canonicalUrl: "/portfolio_details" }));
      return;
    }
    res.render("pages/portfolio-detail", { ...buildLayoutData({ currentPage: "portfolio", pageTitle: `${portfolio.title} | CloudAlls Case Study`, pageDescription: portfolio.short_desc || "CloudAlls case study.", canonicalUrl: `/portfolio_details?slug=${encodeURIComponent(portfolio.slug)}`, pageImage: portfolio.image_url || undefined }), portfolio });
  } catch (error) { next(error); }
});

publicRouter.get("/faq", async (_req, res, next) => {
  try {
    const faqs = await getPublishedFaqs();
    const faqPage = pages.faq!;
    res.render("pages/faq", {
      ...buildLayoutData({ currentPage: "faq", pageTitle: faqPage.title, pageDescription: faqPage.description, pageKeywords: faqPage.keywords, canonicalUrl: "/faq" }),
      page: faqPage,
      faqs,
    });
  } catch (error) { next(error); }
});

publicRouter.get("/testimonials", async (_req, res, next) => {
  try {
    const testimonials = await getPublishedTestimonials();
    res.render("pages/testimonials", { ...buildLayoutData({ currentPage: "testimonials", pageTitle: "Client Testimonials | CloudAlls", pageDescription: "Read client perspectives on CloudAlls engineering, security, creative, and operational systems.", canonicalUrl: "/testimonials" }), testimonials });
  } catch (error) { next(error); }
});

publicRouter.get("/brand", async (_req, res, next) => {
  try {
    const divisions = await getActiveBrandDivisions();
    res.render("pages/brand", { ...buildLayoutData({ currentPage: "brand", pageTitle: pages.brand!.title, pageDescription: pages.brand!.description, pageKeywords: pages.brand!.keywords, canonicalUrl: "/brand" }), divisions });
  } catch (error) { next(error); }
});

publicRouter.get("/legal", async (_req, res, next) => {
  try {
    const [directory, pillars, crisisResponse, frameworks] = await Promise.all([getLegalDirectory(), getLegalCompliancePillars(), getLegalCrisisResponse(), getLegalFrameworks()]);
    res.render("pages/legal-center", { ...buildLayoutData({ currentPage: "legal", pageTitle: "Legal Center | CloudAlls", pageDescription: "CloudAlls terms, privacy, security, acceptable use, ethics, accessibility, data rights, and jurisdiction-aware trust references.", canonicalUrl: "/legal" }), directory, pillars, crisisResponse, frameworks });
  } catch (error) { next(error); }
});

publicRouter.get("/legal_documents", (_req, res) => res.redirect(302, "/legal"));

for (const legalSlug of ["terms", "privacy", "security", "aup", "ethics", "accessibility"]) {
  publicRouter.get(`/${legalSlug}`, async (_req, res, next) => {
    try {
      const document = await getLegalDocumentBySlug(legalSlug);
      if (!document) {
        res.status(404).render("errors/404", buildLayoutData({ pageTitle: "Legal document not found", canonicalUrl: `/${legalSlug}` }));
        return;
      }
      const safeDocument = { ...document, content: sanitizeLegalHtml(document.content) };
      res.render("pages/legal-document", { ...buildLayoutData({ currentPage: "legal", pageTitle: `${document.title} | CloudAlls`, pageDescription: `${document.title}, version ${document.version}.`, canonicalUrl: `/${legalSlug}` }), document: safeDocument });
    } catch (error) { next(error); }
  });
}

const dynamicSlugs = new Set(["about", "expertise", "faq", "insights", "portfolio", "brand"]);
for (const slug of Object.keys(pages)) {
  if (!dynamicSlugs.has(slug)) publicRouter.get(`/${slug}`, (_req: Request, res: Response) => renderDefinition(res, slug));
}

publicRouter.get("/sitemap.xml", async (_req, res, next) => {
  try {
    const [expertise, insights, portfolios, careers] = await Promise.all([getActiveExpertise(), getPublishedInsights(), getPublishedPortfolios(), getActiveCareers()]);
    const today = new Date().toISOString().slice(0, 10);
    const entries = new Map<string, string | undefined>();
    const add = (path: string, lastmod?: string | null) => entries.set(path, lastmod ? String(lastmod).slice(0, 10) : undefined);

    ["/", ...Object.keys(pages).map(slug => `/${slug}`), "/insights", "/portfolio", "/contact", "/careers", "/partnership", "/testimonials", "/legal", "/terms", "/privacy", "/security", "/aup", "/ethics", "/accessibility", "/data-requests"].forEach(path => add(path));
    expertise.forEach(item => add(`/expertise_details?slug=${encodeURIComponent(item.slug)}`));
    insights.forEach(item => add(`/insight_details?slug=${encodeURIComponent(item.slug)}`, item.created_at));
    portfolios.forEach(item => add(`/portfolio_details?slug=${encodeURIComponent(item.slug)}`));
    careers.filter(item => !item.end_date || String(item.end_date).slice(0, 10) >= today).forEach(item => add(`/careers_details?id=${encodeURIComponent(String(item.id))}`, item.start_date));

    const escapeXml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&apos;");
    const base = env.APP_URL.replace(/\/$/, "");
    const xmlEntries = [...entries].map(([url, lastmod]) => `<url><loc>${escapeXml(`${base}${url}`)}</loc>${lastmod ? `<lastmod>${escapeXml(lastmod)}</lastmod>` : ""}</url>`).join("");
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${xmlEntries}</urlset>`;
    res.type("application/xml").send(xml);
  } catch (error) {
    next(error);
  }
});
