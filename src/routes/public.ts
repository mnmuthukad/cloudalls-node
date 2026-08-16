import { Router, type Request, type Response } from "express";
import { env } from "../config/env.js";
import { buildLayoutData } from "../services/layout.service.js";
import { getActiveBrandDivisions, getActiveExpertise, getExpertiseBySlug, getLegalCompliancePillars, getLegalCrisisResponse, getLegalDirectory, getLegalDocumentBySlug, getLegalFrameworks, getPublishedFaqs, getPublishedInsights, getPublishedPortfolios, getPublishedTestimonials, sanitizeLegalHtml } from "../services/content.service.js";

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

const aboutModel = {
  sections: [
    { title: '', body: 'CloudAlls is a next generation technology company and hybrid innovation lab. We bridge the critical gap between visionary digital innovation and rigorous real world execution. From AI powered neural networks to enterprise grade software and custom hardware infrastructure, we empower businesses to transform complex ideas into secure, highly scalable operational solutions.' },
    { title: 'Our Philosophy', body: 'In a highly fragmented digital landscape, we recognize a fundamental truth: engineering is hollow without design, and automation is fragile without strategy. Our mission is to dismantle these industry silos. We do not just write code or build isolated applications; we architect complete, interconnected digital ecosystems where technology, design, and operations function as a single, cohesive force.' },
    { title: 'What We Do', body: 'Operating at the intersection of deep tech and enterprise strategy, our capabilities are anchored in four core pillars: Digital Engineering, Intelligent Systems, Hardware Operations, and Business Growth. We manage the entire technological lifecycle from rapid prototyping and agile development to live cloud deployment and internal team upskilling through the CloudAlls Academy.' },
    { title: 'Our Vision', body: 'We exist to serve as the global “Innovation Logic” layer for startups and multinational enterprises alike. At CloudAlls, we do not rely on guesswork. Through uncompromising security standards, rapid agility, and transparent communication, we engineer certainty—giving industry leaders the technological foundation they need to scale confidently into the future.' },
  ],
  values: [
    { icon: 'fa-lightbulb', title: 'Innovation First' },
    { icon: 'fa-users', title: 'Client-Centric' },
    { icon: 'fa-magnifying-glass', title: 'Transparency' },
    { icon: 'fa-bolt', title: 'Speed & Agility' },
    { icon: 'fa-award', title: 'Quality Engineering' },
  ],
  unique: [
    { icon: 'fa-layer-group', title: 'All in One Ecosystem', body: 'We do not just build software; we create complete digital ecosystems, including AI integrations, hardware deployment, automation, and marketing.' },
    { icon: 'fa-flask', title: 'Innovation Driven', body: 'From Proof of Concept (PoC) to full scale enterprise deployment, we continuously experiment, refine, and innovate.' },
    { icon: 'fa-arrows-spin', title: 'End to End Execution', body: 'Idea → Prototype → Development → Launch → Growth. You have one highly capable strategic partner for the entire lifecycle.' },
    { icon: 'fa-rocket', title: 'Speed & Scalability', body: 'Our agile teams deliver rapid, highly functional results without ever compromising on security or architectural quality.' },
  ],
  chapters: [
    { year: '2021', badge: 'The Hypothesis', image: '1.webp', title: 'The Physics of Collaboration.', body: 'CloudAlls started with a simple observation in Kerala’s academic scene: a massive gap between theory and execution. Campuses held untapped engineering talent lacking access to real-world, enterprise project environments.' },
    { year: '2021', badge: 'The Prototype', image: '2.webp', title: 'Bridging the Gap.', body: 'Operating from dorm rooms, we built a bridge. By securing commercial contracts and distributing work to a hidden network of “Student Creators,” we proved distributed campus talent could deliver enterprise-grade results.', reverse: true },
    { year: '2022', badge: 'The Collective', image: '3.webp', title: 'Structuring the Collective.', body: 'The late-night network rapidly evolved into a visible, campus-based collective. We dismantled silos, bringing isolated software engineers and designers together to architect complex apps and corporate identities.' },
    { year: '2023', badge: 'The Foundation', image: '4.webp', title: 'The Ecosystem Takes Root.', body: 'CloudAlls officially incorporated. Our dispersed talent pooled into a singular, glowing ecosystem, setting the permanent stage for building comprehensive digital infrastructures and locking in our core brand identity.', reverse: true },
    { year: '2024', badge: 'The Lab', image: '5.webp', title: 'The Innovation Lab is Born.', body: 'To meet escalating demands, we launched the CloudAlls Innovation Lab. We shifted from isolated software to engineering cohesive Digital Ecosystems, implementing rigorous deployment pipelines and advanced API architectures.' },
    { year: '2025', badge: 'The Enterprise', image: '6.webp', title: 'Scaling to the Enterprise.', body: 'Leaving dorm rooms behind, CloudAlls matured into a corporate entity. From state-of-the-art headquarters, we now exclusively manage high-traffic infrastructures with zero-trust security for multinational clients.', reverse: true },
    { year: '2026', badge: 'The Future', image: '7.webp', title: 'Global Scale & The Academy.', body: 'Now a global tech ecosystem, we launched the CloudAlls Academy to systematically upskill the next generation of engineers—eliminating the industry talent gap and giving back to the ecosystem that started it all.' },
  ],
  leadershipTeam: [
    { title: 'Chief Executive Officer', role: 'Founder & Principal Architect', image: '/assets/img/1.webp', description: 'Driving the global vision for lean enterprise architecture and regional tech empowerment.' },
    { title: 'Chief Technology Officer', role: 'Head of Labs & R&D', image: '/assets/img/1.webp', description: 'Overseeing the deployment of zero-trust protocols and AI pipeline integrations.' },
    { title: 'Chief Creative Officer', role: 'Design & Ecosystem Strategy', image: '/assets/img/1.webp', description: 'Bridging the gap between complex backend engineering and intuitive human-centric interfaces.' },
    { title: 'Chief Operating Officer', role: 'Global Operations', image: '/assets/img/1.webp', description: 'Scaling internal agility, corporate governance, and enterprise client onboarding.' },
  ],
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

publicRouter.get("/sitemap.xml", (_req, res) => {
  const urls = ["/", ...Object.keys(pages).map(slug => `/${slug}`), "/insights", "/portfolio", "/contact", "/careers", "/partnership", "/testimonials", "/legal", "/terms", "/privacy", "/security", "/aup", "/ethics", "/accessibility", "/data-requests"];
  const base = env.APP_URL.replace(/\/$/, "");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(url => `<url><loc>${base}${url}</loc></url>`).join("")}</urlset>`;
  res.type("application/xml").send(xml);
});
