import fs from "node:fs";
import path from "node:path";
import sanitizeHtml from "sanitize-html";

export interface BrandDivision {
  id?: number;
  name: string;
}

export interface SiteSettings {
  gsc_verification?: string;
  logo_code?: string;
  whatsapp?: string;
  contact_number?: string;
  email?: string;
  company_address?: string;
  working_hours?: string;
  linkedin?: string;
  x_link?: string;
  instagram?: string;
  youtube?: string;
  reddit?: string;
  discord?: string;
  github?: string;
  brand_divisions?: BrandDivision[];
  [key: string]: unknown;
}

const fallbackSettings: SiteSettings = {
  logo_code: '<span class="fw-bold text-dark">CloudAlls</span>',
  whatsapp: "+91 9048208135",
  contact_number: "+91 904 820 8135",
  email: "info@cloudalls.com",
  company_address: "Kerala, India",
  brand_divisions: [],
};

let cachedSettings: SiteSettings | null = null;

function sanitizeLogoMarkup(value: unknown): string {
  return sanitizeHtml(String(value || fallbackSettings.logo_code), {
    allowedTags: ["span", "svg", "path", "g", "circle", "rect", "title", "text", "tspan"],
    allowedAttributes: {
      span: ["class"],
      svg: ["class", "viewBox", "viewbox", "width", "height", "fill", "xmlns", "role", "aria-label", "focusable"],
      path: ["d", "fill", "stroke", "stroke-width"],
      g: ["fill", "stroke", "transform", "opacity"],
      circle: ["cx", "cy", "r", "fill", "opacity", "stroke", "stroke-width"],
      rect: ["x", "y", "width", "height", "rx", "fill", "opacity", "stroke", "stroke-width"],
      text: ["x", "y", "fill", "font-family", "font-size", "font-weight", "letter-spacing", "text-anchor"],
      tspan: ["x", "y", "fill", "font-family", "font-size", "font-weight", "letter-spacing"],
    },
    allowedSchemes: [],
    disallowedTagsMode: "discard",
  });
}

export function getSiteSettings(): SiteSettings {
  if (cachedSettings) return cachedSettings;
  const settingsPath = path.join(process.cwd(), "data", "site_settings.json");
  try {
    const raw = fs.readFileSync(settingsPath, "utf8");
    const parsed: unknown = JSON.parse(raw);
    const settings = parsed && typeof parsed === "object" ? parsed as SiteSettings : fallbackSettings;
    cachedSettings = { ...settings, logo_code: sanitizeLogoMarkup(settings.logo_code) };
  } catch (error) {
    console.warn("CloudAlls site settings unavailable; using safe defaults.", error instanceof Error ? error.message : error);
    cachedSettings = fallbackSettings;
  }
  return cachedSettings;
}

export function normalizeWhatsApp(value: unknown): string {
  return String(value || "").replace(/[^0-9]/g, "");
}
