import { env } from "../config/env.js";
import { getSiteSettings, normalizeWhatsApp, type SiteSettings } from "./settings.service.js";

export interface LayoutData {
  settings: SiteSettings;
  currentPage: string;
  canonicalUrl: string;
  pageTitle: string;
  pageDescription: string;
  pageKeywords: string;
  pageImage: string;
  footerMenus: Record<string, Record<string, string | { label: string; badge?: string }>>;
  socialLinks: string[];
  schemaPhone: string;
  waLink: string;
  recaptchaSiteKey: string;
}

const footerMenus: LayoutData["footerMenus"] = {
  Company: { "/about": "About CloudAlls", "/partnership": "Partner Network", "/investors": "Investor Relations" },
  Ecosystem: { "/labs": { label: "Labs", badge: "BETA" }, "/resources": "Developer Hub", "/engineering": "Engineering & Trust" },
  Resources: { "/portfolio": "Case Studies", "/insights": "Insights & Blog", "/testimonials": "Client Perspectives", "/events": "Events & Webinars" },
  "Impact & Talent": { "/media": "News & Impact", "/careers": "Career & Internship", "/responsibility": "Social Responsibility" },
  Platform: { "/expertise": "Expertise", "/methodology": "Methodology", "/pricing": "Pricing Plans" },
  Support: { "/faq": "Help & FAQ", "/legal": "Legal Center", "/data-requests": "Data requests", "/brand": "Brand Assets" },
};

export function buildLayoutData(input: Partial<Pick<LayoutData, "currentPage" | "pageTitle" | "pageDescription" | "pageKeywords" | "pageImage" | "canonicalUrl">> = {}): LayoutData {
  const settings = getSiteSettings();
  const pathPart = input.canonicalUrl || "/";
  const canonicalUrl = pathPart.startsWith("http") ? pathPart : `${env.APP_URL}${pathPart.startsWith("/") ? pathPart : `/${pathPart}`}`;
  const socialLinks = [settings.linkedin, settings.instagram, settings.x_link, settings.github, settings.youtube]
    .filter((value): value is string => Boolean(value));

  return {
    settings,
    currentPage: input.currentPage || "index",
    canonicalUrl,
    pageTitle: input.pageTitle || "AI & Web Development Expertise | Innovation Lab | CloudAlls",
    pageDescription: input.pageDescription || "Explore CloudAlls' expertise in Artificial Intelligence, Custom Web Development, and Creative Media solutions in Kerala.",
    pageKeywords: input.pageKeywords || "AI Development Kerala, Web Design India, CloudAlls Expertise, Innovation Lab, AI Integration",
    pageImage: input.pageImage || `${env.APP_URL}/assets/img/slide/1.webp`,
    footerMenus,
    socialLinks,
    schemaPhone: String(settings.contact_number || "+91 90482 08135"),
    waLink: normalizeWhatsApp(settings.whatsapp || settings.contact_number || "+91 90482 08135"),
    recaptchaSiteKey: env.RECAPTCHA_SITE_KEY,
  };
}
