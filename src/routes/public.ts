import { Router, type Request, type Response } from "express";
import { buildLayoutData } from "../services/layout.service.js";
import { getActiveExpertise, getExpertiseBySlug, getPublishedFaqs, getPublishedInsights, getPublishedPortfolios } from "../services/content.service.js";

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

const pages: Record<string, PageDefinition> = {
  pricing: {
    currentPage: "pricing",
    title: "Pricing | CloudAlls",
    description: "Flexible CloudAlls pricing for secure web development, AI integration, and operational technology services.",
    keywords: "CloudAlls pricing, web development pricing, AI integration plans",
    eyebrow: "Clear commercial pathways",
    hero: "Technology investment with operational certainty.",
    sections: [
      { heading: "Foundation", body: "For organizations establishing a dependable digital foundation with focused delivery and measurable outcomes.", bullets: ["Discovery and architecture review", "Responsive web experience", "Security and performance baseline"] },
      { heading: "Scale", body: "For teams that need an integrated engineering partner for data, automation, and customer-facing systems.", bullets: ["Product and platform engineering", "AI workflow integration", "Observability and continuous improvement"] },
      { heading: "Enterprise", body: "For organizations operating complex systems where governance, resilience, and trust are non-negotiable.", bullets: ["Zero-trust architecture planning", "Multi-system integration", "Executive reporting and operational support"] },
    ],
  },
  about: {
    currentPage: "about",
    title: "About CloudAlls | Innovation, Engineering & Impact",
    description: "Learn how CloudAlls combines AI, engineering, creative media, and enterprise operations to build trusted digital systems.",
    keywords: "about CloudAlls, innovation lab Kerala, technology company India",
    eyebrow: "The CloudAlls ecosystem",
    hero: "Organizing the new technology culture.",
    sections: [
      { heading: "A multidisciplinary operating model", body: "CloudAlls connects strategy, product thinking, engineering, creative systems, and operational discipline so organizations can move from ideas to dependable outcomes." },
      { heading: "Built for trust", body: "We design for clarity, privacy, accessibility, measurable performance, and long-term maintainability from the first system decision." },
      { heading: "Rooted in India, designed for the world", body: "Our work is shaped in Kerala and delivered with a global standard of quality, responsibility, and technical rigor." },
    ],
  },
  expertise: {
    currentPage: "expertise",
    title: "Expertise | AI, Web Development & Creative Systems | CloudAlls",
    description: "Explore CloudAlls expertise in artificial intelligence, custom web development, creative media, and operational technology.",
    keywords: "AI development Kerala, custom web development, CloudAlls expertise",
    eyebrow: "Capabilities",
    hero: "Technology that makes the complex usable.",
    sections: [
      { heading: "Artificial intelligence", body: "Practical AI systems that improve decision-making, automate repetitive work, and create better customer and team experiences." },
      { heading: "Web and platform engineering", body: "Fast, accessible, secure digital products built on a clear architecture and measured against real business outcomes." },
      { heading: "Creative media and brand systems", body: "Visual and interactive systems that make technical value understandable, memorable, and actionable." },
    ],
  },
  methodology: {
    currentPage: "methodology",
    title: "Our Methodology | The CloudAlls Deployment Pipeline",
    description: "A rigorous six-stage CloudAlls engineering methodology designed for scalability, security, and operational certainty.",
    keywords: "CloudAlls methodology, enterprise architecture process, software engineering pipeline",
    eyebrow: "The deployment pipeline",
    hero: "From ambiguity to operational certainty.",
    sections: [
      { heading: "01 — Understand", body: "Frame the problem, users, constraints, success measures, and risks before choosing technology." },
      { heading: "02 — Architect", body: "Design the system boundaries, data contracts, security model, and delivery plan." },
      { heading: "03 — Build", body: "Implement the smallest reliable path with clean interfaces, tests, and observable behavior." },
      { heading: "04 — Validate", body: "Test accessibility, performance, security, data integrity, and real user workflows." },
      { heading: "05 — Operate", body: "Deploy with monitoring, backups, rollback procedures, and clear ownership." },
      { heading: "06 — Improve", body: "Use evidence from production to refine the product, platform, and operating model." },
    ],
  },
  labs: {
    currentPage: "labs",
    title: "CloudAlls Labs | Experiments & Open Source",
    description: "Explore the CloudAlls Labs, where we prototype new developer tools, automation systems, and responsible AI workflows.",
    keywords: "CloudAlls Labs, developer tools, open source AI",
    eyebrow: "Innovation lab",
    hero: "Experiments with a path to reality.",
    sections: [
      { heading: "Active initiatives", body: "Labs turns focused experiments into useful systems through rapid prototyping, technical evaluation, and responsible release." },
      { heading: "Open source at CloudAlls", body: "We believe practical knowledge becomes more valuable when it is documented, tested, and shared with the wider engineering community." },
    ],
  },
  engineering: {
    currentPage: "engineering",
    title: "Engineering & Trust Center | CloudAlls Ecosystem",
    description: "Explore CloudAlls zero-trust architecture, system status, resilience practices, and engineering standards.",
    keywords: "CloudAlls security, zero trust architecture, system status, engineering trust",
    eyebrow: "Engineering and trust",
    hero: "Trust is an engineering property.",
    sections: [
      { heading: "Global infrastructure status", body: "We design for observable, recoverable systems with explicit health checks, useful logs, and documented incident paths." },
      { heading: "Security core", body: "Security is built into the request boundary, data layer, deployment process, and operational review—not added after launch." },
      { heading: "Continuous auditing", body: "Code, dependencies, configuration, and access are reviewed continuously so the system improves as it grows." },
    ],
  },
  events: {
    currentPage: "events",
    title: "Events & Webinars | CloudAlls",
    description: "Join CloudAlls architects for technology summits, developer workshops, and practical webinars.",
    keywords: "CloudAlls events, technology webinar, developer workshop",
    eyebrow: "Community and learning",
    hero: "Ideas become useful when they are shared.",
    sections: [
      { heading: "Upcoming sessions", body: "Watch this space for technical briefings, architecture conversations, and workshops from the CloudAlls ecosystem." },
      { heading: "Bring your questions", body: "Our sessions focus on practical decisions: security, AI adoption, platform design, accessibility, and sustainable delivery." },
    ],
  },
  brand: {
    currentPage: "brand",
    title: "Brand Assets | CloudAlls",
    description: "Access CloudAlls brand guidance, identity assets, and usage standards.",
    keywords: "CloudAlls brand assets, CloudAlls logo, media kit",
    eyebrow: "Brand system",
    hero: "A clear identity for a connected ecosystem.",
    sections: [
      { heading: "Use with care", body: "The CloudAlls name and visual identity represent a culture of clarity, responsibility, and technical ambition. Please preserve spacing, contrast, and context when using the assets." },
      { heading: "Media enquiries", body: "For approved logos, partnership stories, or press enquiries, contact the CloudAlls team." },
    ],
  },
  investors: {
    currentPage: "investors",
    title: "Investor Relations | CloudAlls",
    description: "Explore CloudAlls company information, growth principles, and investor communications.",
    keywords: "CloudAlls investors, company information, investor relations",
    eyebrow: "Company information",
    hero: "Building durable value through useful technology.",
    sections: [
      { heading: "Long-term thinking", body: "CloudAlls focuses on durable systems, clear governance, responsible innovation, and measurable value creation." },
      { heading: "Information requests", body: "For official company or investor enquiries, use the contact channel so the request can be routed securely." },
    ],
  },
  media: {
    currentPage: "media",
    title: "Media & Impact | CloudAlls",
    description: "News, announcements, and social impact initiatives from the CloudAlls ecosystem.",
    keywords: "CloudAlls news, technology impact, media enquiries",
    eyebrow: "News and impact",
    hero: "Technology should leave people and systems stronger.",
    sections: [
      { heading: "Responsible progress", body: "We measure progress by the quality of the systems we create and the opportunities they open for people, teams, and communities." },
      { heading: "Press and media", body: "For media enquiries, interviews, and approved statements, contact the CloudAlls communications team." },
    ],
  },
  responsibility: {
    currentPage: "responsibility",
    title: "Social Responsibility | CloudAlls",
    description: "Discover CloudAlls commitments to responsible technology, accessibility, privacy, and community impact.",
    keywords: "CloudAlls social responsibility, responsible technology, accessibility",
    eyebrow: "Impact by design",
    hero: "Responsibility is part of the system.",
    sections: [
      { heading: "Privacy and dignity", body: "We treat personal data, consent, accessibility, and human context as first-class engineering requirements." },
      { heading: "Inclusive access", body: "We work toward interfaces and systems that remain useful across devices, abilities, languages, and levels of technical confidence." },
      { heading: "Community learning", body: "We share knowledge and create pathways for people to participate in the new technology culture." },
    ],
  },
  resources: {
    currentPage: "resources",
    title: "Developer Hub | CloudAlls Resources",
    description: "Guides, insights, case studies, events, and practical resources from CloudAlls.",
    keywords: "CloudAlls resources, developer hub, technology insights",
    eyebrow: "Developer hub",
    hero: "Useful knowledge, organized for action.",
    sections: [
      { heading: "Insights", body: "Read practical thinking on AI integration, platform engineering, security, design systems, and operational excellence." },
      { heading: "Case studies", body: "Explore how clear architecture and focused execution turn complex requirements into dependable outcomes." },
      { heading: "Events and workshops", body: "Join the CloudAlls community for live sessions and hands-on learning." },
    ],
  },
  faq: {
    currentPage: "faq",
    title: "Knowledge Base & FAQ | CloudAlls Ecosystem",
    description: "Find answers to common questions about CloudAlls services, methodology, AI, web development, and delivery.",
    keywords: "CloudAlls FAQ, support CloudAlls, enterprise solutions",
    eyebrow: "Knowledge base",
    hero: "Good questions create better systems.",
    sections: [
      { heading: "What does CloudAlls build?", body: "We build secure web platforms, AI-assisted workflows, digital experiences, and operational systems tailored to the organization using them." },
      { heading: "How do projects begin?", body: "Projects begin with a focused discovery conversation covering goals, users, constraints, risks, and measurable outcomes." },
      { heading: "How do you handle security?", body: "Security is addressed through least privilege, input validation, secure sessions, protected secrets, dependency updates, testing, and operational review." },
    ],
  },
};

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

const dynamicSlugs = new Set(["expertise", "faq", "insights", "portfolio"]);
for (const slug of Object.keys(pages)) {
  if (!dynamicSlugs.has(slug)) publicRouter.get(`/${slug}`, (_req: Request, res: Response) => renderDefinition(res, slug));
}

publicRouter.get("/sitemap.xml", (_req, res) => {
  const urls = ["/", ...Object.keys(pages).map(slug => `/${slug}`), "/insights", "/portfolio", "/contact", "/careers", "/partnership"];
  const base = "https://www.cloudalls.com";
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(url => `<url><loc>${base}${url}</loc></url>`).join("")}</urlset>`;
  res.type("application/xml").send(xml);
});

publicRouter.get("/privacy", (_req, res) => res.redirect(302, "https://legal.cloudalls.com/#privacy"));
