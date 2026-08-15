import fs from "node:fs";
import path from "node:path";

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

export function getSiteSettings(): SiteSettings {
  if (cachedSettings) return cachedSettings;
  const settingsPath = path.join(process.cwd(), "data", "site_settings.json");
  try {
    const raw = fs.readFileSync(settingsPath, "utf8");
    const parsed: unknown = JSON.parse(raw);
    cachedSettings = parsed && typeof parsed === "object" ? parsed as SiteSettings : fallbackSettings;
  } catch (error) {
    console.warn("CloudAlls site settings unavailable; using safe defaults.", error instanceof Error ? error.message : error);
    cachedSettings = fallbackSettings;
  }
  return cachedSettings;
}

export function normalizeWhatsApp(value: unknown): string {
  return String(value || "").replace(/[^0-9]/g, "");
}
