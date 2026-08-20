import type { RowDataPacket } from "mysql2";
import { getPublicDb } from "../config/database.js";
import { loadJsonData } from "./data.service.js";
import sanitizeHtml from "sanitize-html";

export interface ExpertiseRow extends RowDataPacket {
  id: number;
  title: string;
  slug: string;
  icon: string | null;
  division?: string | null;
  wing?: string | null;
  color: string | null;
  short_description: string | null;
  full_description: string | null;
  bullet_points: string | null;
  price_range: string | null;
  delivery_time: string | null;
  sub_services: string | null;
  key_benefits: string | null;
  what_we_deliver: string | null;
  use_cases: string | null;
  tech_stack: string | null;
  process_detail: string | null;
}

export interface FaqRow extends RowDataPacket {
  id: number;
  question: string;
  answer: string;
  expertise_id: number | null;
  display_order?: number;
}

export interface CareerRow extends RowDataPacket {
  id: number;
  title: string;
  type: string;
  location: string;
  location_type: string;
  department: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  form_link: string | null;
}

export interface InsightRow extends RowDataPacket {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  image_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  created_at: string | null;
}

export interface PortfolioRow extends RowDataPacket {
  id: number;
  title: string;
  slug: string;
  client_name: string | null;
  short_desc: string | null;
  full_content: string | null;
  image_url: string | null;
  live_link: string | null;
}

export interface TestimonialRow extends RowDataPacket {
  id: number;
  client_name: string;
  client_role: string | null;
  expertise_id: number | null;
  review_text: string;
  rating: number | null;
  client_image: string | null;
}

export interface BrandDivisionRow extends RowDataPacket {
  id: number;
  name: string;
  tagline: string;
  description?: string | null;
  wing?: string | null;
  svg_code: string | null;
  display_order: number;
  status: string;
}

export interface LegalDocumentRow extends RowDataPacket {
  id: number;
  slug: string;
  title: string;
  version: string;
  effective_date: string;
  content: string;
}

export interface LegalDirectoryRow extends RowDataPacket {
  id: number;
  link: string;
  icon: string;
  title: string;
  description: string;
  color_class: string;
  display_order: number;
}

export interface LegalCompliancePillarRow extends RowDataPacket {
  id: number;
  icon: string;
  title: string;
  description: string;
  display_order: number;
}

export interface LegalCrisisResponseRow extends RowDataPacket {
  id: number;
  step_number: number;
  title: string;
  color: string;
  description: string;
}

export interface LegalFrameworkRow extends RowDataPacket {
  id: number;
  jurisdiction: string;
  region_code: string;
  framework_name: string;
  authority: string;
  framework_type: string;
  scope_summary: string;
  review_status: string;
  source_url: string;
  last_reviewed: string;
  display_order: number;
}

interface LegalContentData {
  directory: LegalDirectoryRow[];
  documents: LegalDocumentRow[];
  compliancePillars: LegalCompliancePillarRow[];
  crisisResponse: LegalCrisisResponseRow[];
  frameworks: LegalFrameworkRow[];
}

const fallbackExpertise: ExpertiseRow[] = [];

const fallbackCareers: CareerRow[] = [
  { id: 14, title: "Senior Full-Stack Engineer", type: "Full-Time", location: "Kerala, India", location_type: "Hybrid", department: "Engineering", description: "Own the architecture behind CloudAlls production platforms. Lead the design and delivery of enterprise web systems serving our corporate client base, and mentor a growing bench of engineers across the Kerala, Dubai, and remote teams. 5+ years of production experience with PHP/Laravel or Node.js and modern JavaScript frameworks required.", start_date: "2026-08-01", end_date: "2026-11-30", form_link: "https://forms.gle/example1" } as CareerRow,
  { id: 15, title: "Software Engineering Intern", type: "Internship", location: "Remote", location_type: "Remote", department: "Engineering", description: "A structured three-month internship designed as a hiring pipeline, not a coffee-fetching exercise. Work directly on live client platforms under senior mentorship — real features shipped to production — with a capstone deliverable you defend in a final review. Top performers are routinely offered full-time roles.", start_date: "2026-08-10", end_date: "2026-10-31", form_link: "https://forms.gle/example2" } as CareerRow,
  { id: 19, title: "Social Media Manager", type: "Part-Time", location: "Remote", location_type: "Remote", department: "Media Production", description: "This position has been filled. Our talent pipeline remains open for future content and social operations roles — the CloudAlls Academy internship program is the recommended entry route.", start_date: "2025-12-26", end_date: "2026-02-19", form_link: "https://forms.gle/example6" } as CareerRow,
];

const fallbackLegalContent: LegalContentData = {
  directory: [],
  documents: [],
  compliancePillars: [],
  crisisResponse: [],
  frameworks: [],
};

const fallbackFaqs: FaqRow[] = [];
const fallbackInsights: InsightRow[] = [];
const fallbackPortfolios: PortfolioRow[] = [];
const fallbackTestimonials: TestimonialRow[] = [];
const fallbackBrandDivisions: BrandDivisionRow[] = [];

const editableExpertise = loadJsonData<ExpertiseRow[]>("expertise.json", fallbackExpertise);
const editableCareers = loadJsonData<CareerRow[]>("careers.json", fallbackCareers);
const editableFaqs = loadJsonData<FaqRow[]>("faqs.json", fallbackFaqs);
const editableInsights = loadJsonData<InsightRow[]>("insights.json", fallbackInsights);
const editablePortfolios = loadJsonData<PortfolioRow[]>("portfolio.json", fallbackPortfolios);
const editableTestimonials = loadJsonData<TestimonialRow[]>("testimonials.json", fallbackTestimonials);
const editableBrandDivisions = loadJsonData<BrandDivisionRow[]>("brand_divisions.json", fallbackBrandDivisions);
const editableLegalContent = loadJsonData<LegalContentData>("legal_content.json", fallbackLegalContent);

export async function getActiveExpertise(): Promise<ExpertiseRow[]> {
  const db = getPublicDb();
  if (!db) return editableExpertise;
  try {
    const [rows] = await db.query<ExpertiseRow[]>("SELECT id,title,slug,icon,color,short_description,full_description,bullet_points,price_range,delivery_time,sub_services,key_benefits,division,wing FROM expertise WHERE status = 'Active' ORDER BY display_order ASC, created_at DESC");
    // Merge any JSON-defined services that are not yet in the database (e.g. newly
    // added services) so the catalogue stays complete even before the DB is updated.
    if (rows.length) {
      const seen = new Set(rows.map(row => row.slug));
      for (const jsonRow of editableExpertise) {
        if (!seen.has(jsonRow.slug)) {
          rows.push(jsonRow);
        } else if (jsonRow.division) {
          // Backfill subsidiary assignments from the data file until the database
          // migration has written them (db column may not exist yet in older deploys).
          const existing = rows.find(row => row.slug === jsonRow.slug);
          if (existing && !existing.division) existing.division = jsonRow.division;
        }
      }
    } else {
      return editableExpertise;
    }
    return rows;
  } catch (error) {
    console.error("PUBLIC_DB expertise query failed", error);
    return editableExpertise;
  }
}

export async function getExpertiseBySlug(slug: string): Promise<ExpertiseRow | null> {
  const db = getPublicDb();
  if (!db) return editableExpertise.find(item => item.slug === slug) || null;
  try {
    const [rows] = await db.query<ExpertiseRow[]>("SELECT id,title,slug,icon,color,short_description,full_description,bullet_points,price_range,delivery_time,sub_services,key_benefits,division,wing,what_we_deliver,use_cases,tech_stack,process_detail FROM expertise WHERE slug = ? AND status = 'Active' LIMIT 1", [slug]);
    return rows[0] || editableExpertise.find(item => item.slug === slug) || null;
  } catch (error) {
    console.error("PUBLIC_DB expertise detail query failed", error);
    return editableExpertise.find(item => item.slug === slug) || null;
  }
}

export async function getPublishedFaqs(): Promise<FaqRow[]> {
  const db = getPublicDb();
  if (!db) return editableFaqs;
  try {
    const [rows] = await db.query<FaqRow[]>("SELECT id,question,answer,expertise_id,display_order FROM faqs WHERE status = 'Published' ORDER BY display_order ASC, created_at DESC");
    return rows.length ? rows : editableFaqs;
  } catch (error) {
    console.error("PUBLIC_DB FAQ query failed", error);
    return editableFaqs;
  }
}

export async function getFaqsForExpertise(expertiseId: number): Promise<FaqRow[]> {
  const db = getPublicDb();
  const jsonFallback = editableFaqs.filter(f => f.expertise_id === expertiseId);
  if (!db) return jsonFallback;
  try {
    // Legacy generic FAQ rows (ids below 1000) predate the per-service FAQ system and
    // are never shown on service detail pages; the curated per-service FAQ set starts at id 1001.
    const [rows] = await db.query<FaqRow[]>("SELECT id,question,answer,expertise_id,display_order FROM faqs WHERE expertise_id = ? AND status = 'Published' AND id >= 1000 ORDER BY display_order ASC", [expertiseId]);
    return rows.length ? rows : jsonFallback;
  } catch (error) {
    console.error("PUBLIC_DB per-service FAQ query failed", error);
    return jsonFallback;
  }
}

export async function getActiveCareers(): Promise<CareerRow[]> {
  const db = getPublicDb();
  if (!db) return editableCareers;
  try {
    const [rows] = await db.query<CareerRow[]>("SELECT id,title,type,location,location_type,department,description,start_date,end_date,form_link FROM careers WHERE status = 'Active' ORDER BY CASE WHEN type = 'Internship' THEN 1 ELSE 0 END, end_date DESC, created_at DESC");
    return rows.length ? rows : editableCareers;
  } catch (error) {
    console.error("PUBLIC_DB careers query failed", error);
    return editableCareers;
  }
}

export async function getPublishedInsights(): Promise<InsightRow[]> {
  const db = getPublicDb();
  if (!db) return editableInsights;
  try {
    const [rows] = await db.query<InsightRow[]>("SELECT id,title,slug,excerpt,content,image_url,meta_title,meta_description,meta_keywords,created_at FROM insights WHERE status = 'Published' ORDER BY created_at DESC");
    return rows.length ? rows : editableInsights;
  } catch (error) {
    console.error("PUBLIC_DB insights query failed", error);
    return editableInsights;
  }
}

export async function getPublishedPortfolios(): Promise<PortfolioRow[]> {
  const db = getPublicDb();
  if (!db) return editablePortfolios;
  try {
    const [rows] = await db.query<PortfolioRow[]>("SELECT id,title,slug,client_name,short_desc,full_content,image_url,live_link FROM portfolio WHERE status = 'Published' ORDER BY created_at DESC");
    return rows.length ? rows : editablePortfolios;
  } catch (error) {
    console.error("PUBLIC_DB portfolio query failed", error);
    return editablePortfolios;
  }
}

export function sanitizeLegalHtml(content: string): string {
  return sanitizeHtml(content || "", {
    allowedTags: ["h1", "h2", "h3", "h4", "h5", "h6", "p", "ul", "ol", "li", "strong", "em", "b", "i", "br", "a", "blockquote", "table", "thead", "tbody", "tr", "th", "td", "hr", "code", "pre"],
    allowedAttributes: { a: ["href", "target", "rel"], "*": ["class"] },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: { a: ["http", "https", "mailto"] },
    allowProtocolRelative: false,
    disallowedTagsMode: "discard",
  });
}

export async function getPublishedTestimonials(): Promise<TestimonialRow[]> {
  const db = getPublicDb();
  if (!db) return editableTestimonials;
  try {
    const [rows] = await db.query<TestimonialRow[]>("SELECT id,client_name,client_role,expertise_id,review_text,rating,client_image FROM testimonials WHERE status = 'Published' ORDER BY created_at DESC");
    return rows.length ? rows : editableTestimonials;
  } catch (error) {
    console.error("PUBLIC_DB testimonials query failed", error);
    return editableTestimonials;
  }
}

export async function getActiveBrandDivisions(): Promise<BrandDivisionRow[]> {
  const db = getPublicDb();
  if (!db) return editableBrandDivisions;
  try {
    const [rows] = await db.query<BrandDivisionRow[]>("SELECT id,name,tagline,description,wing,display_order,status FROM brand_divisions WHERE status = 'Active' ORDER BY display_order ASC, id ASC");
    return rows.length ? rows : editableBrandDivisions;
  } catch (error) {
    console.error("PUBLIC_DB brand divisions query failed", error);
    return editableBrandDivisions;
  }
}

export async function getLegalDirectory(): Promise<LegalDirectoryRow[]> {
  const db = getPublicDb();
  if (!db) return editableLegalContent.directory;
  try {
    const [rows] = await db.query<LegalDirectoryRow[]>("SELECT id,link,icon,title,description,color_class,display_order FROM legal_directory ORDER BY display_order ASC, id ASC");
    return rows.length ? rows : editableLegalContent.directory;
  } catch (error) {
    console.error("PUBLIC_DB legal directory query failed", error);
    return editableLegalContent.directory;
  }
}

export async function getLegalDocumentBySlug(slug: string): Promise<LegalDocumentRow | null> {
  const db = getPublicDb();
  if (!db) return editableLegalContent.documents.find(item => item.slug === slug) || null;
  try {
    const [rows] = await db.query<LegalDocumentRow[]>("SELECT id,slug,title,version,effective_date,content FROM legal_documents WHERE slug = ? LIMIT 1", [slug]);
    return rows[0] || editableLegalContent.documents.find(item => item.slug === slug) || null;
  } catch (error) {
    console.error("PUBLIC_DB legal document query failed", error);
    return editableLegalContent.documents.find(item => item.slug === slug) || null;
  }
}

export async function getLegalCompliancePillars(): Promise<LegalCompliancePillarRow[]> {
  const db = getPublicDb();
  if (!db) return editableLegalContent.compliancePillars;
  try {
    const [rows] = await db.query<LegalCompliancePillarRow[]>("SELECT id,icon,title,description,display_order FROM legal_compliance_pillars ORDER BY display_order ASC, id ASC");
    return rows.length ? rows : editableLegalContent.compliancePillars;
  } catch (error) {
    console.error("PUBLIC_DB legal compliance pillars query failed", error);
    return editableLegalContent.compliancePillars;
  }
}

export async function getLegalCrisisResponse(): Promise<LegalCrisisResponseRow[]> {
  const db = getPublicDb();
  if (!db) return editableLegalContent.crisisResponse;
  try {
    const [rows] = await db.query<LegalCrisisResponseRow[]>("SELECT id,step_number,title,color,description FROM legal_crisis_response ORDER BY step_number ASC, id ASC");
    return rows.length ? rows : editableLegalContent.crisisResponse;
  } catch (error) {
    console.error("PUBLIC_DB legal crisis response query failed", error);
    return editableLegalContent.crisisResponse;
  }
}

export async function getLegalFrameworks(): Promise<LegalFrameworkRow[]> {
  const db = getPublicDb();
  if (!db) return editableLegalContent.frameworks;
  try {
    const [rows] = await db.query<LegalFrameworkRow[]>("SELECT id,jurisdiction,region_code,framework_name,authority,framework_type,scope_summary,review_status,source_url,last_reviewed,display_order FROM legal_frameworks ORDER BY jurisdiction ASC, display_order ASC, id ASC");
    return rows.length ? rows : editableLegalContent.frameworks;
  } catch (error) {
    console.error("PUBLIC_DB legal frameworks query failed", error);
    return editableLegalContent.frameworks;
  }
}
