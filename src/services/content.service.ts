import type { RowDataPacket } from "mysql2";
import { getPublicDb } from "../config/database.js";

export interface ExpertiseRow extends RowDataPacket {
  id: number;
  title: string;
  slug: string;
  icon: string | null;
  color: string | null;
  short_description: string | null;
  full_description: string | null;
  bullet_points: string | null;
  price_range: string | null;
  delivery_time: string | null;
  sub_services: string | null;
  key_benefits: string | null;
}

export interface FaqRow extends RowDataPacket {
  id: number;
  question: string;
  answer: string;
  expertise_id: number | null;
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

const fallbackExpertise: ExpertiseRow[] = [
  { id: 1, title: "Web & Software", slug: "web-development", icon: "fa-code", color: "primary", short_description: "Scalable corporate web architecture and custom software platforms.", full_description: "Reliable web architecture tailored for growing organizations.", bullet_points: "Custom Corporate Web Dev, SaaS & Internal Platforms, E-Commerce & Gateways", price_range: "Custom quoted", delivery_time: "2 - 4 weeks", sub_services: "Corporate Websites, Lean Dashboards, Landing Pages", key_benefits: "Cost-Effective, Fast Loading, Mobile Responsive" } as ExpertiseRow,
  { id: 2, title: "AI & Tech", slug: "ai-tech", icon: "fa-brain", color: "dark", short_description: "Practical machine learning and cognitive computing for everyday workflows.", full_description: "Accessible AI tools that save time and reduce operational overhead.", bullet_points: "AI/ML Integration, Smart Customer Chatbots, Predictive Data Models", price_range: "Custom quoted", delivery_time: "2 - 5 weeks", sub_services: "Chatbots, Workflow Automation, Data Scripts", key_benefits: "Reduces Manual Work, 24/7 Support Bots, Affordable Tech" } as ExpertiseRow,
];

export async function getActiveExpertise(): Promise<ExpertiseRow[]> {
  const db = getPublicDb();
  if (!db) return fallbackExpertise;
  try {
    const [rows] = await db.query<ExpertiseRow[]>("SELECT id,title,slug,icon,color,short_description,full_description,bullet_points,price_range,delivery_time,sub_services,key_benefits FROM expertise WHERE status = 'Active' ORDER BY display_order ASC, created_at DESC");
    return rows;
  } catch (error) {
    console.error("PUBLIC_DB expertise query failed", error);
    return fallbackExpertise;
  }
}

export async function getExpertiseBySlug(slug: string): Promise<ExpertiseRow | null> {
  const db = getPublicDb();
  if (!db) return (fallbackExpertise.find(item => item.slug === slug) || null);
  try {
    const [rows] = await db.query<ExpertiseRow[]>("SELECT id,title,slug,icon,color,short_description,full_description,bullet_points,price_range,delivery_time,sub_services,key_benefits FROM expertise WHERE slug = ? AND status = 'Active' LIMIT 1", [slug]);
    return rows[0] || null;
  } catch (error) {
    console.error("PUBLIC_DB expertise detail query failed", error);
    return fallbackExpertise.find(item => item.slug === slug) || null;
  }
}

export async function getPublishedFaqs(): Promise<FaqRow[]> {
  const db = getPublicDb();
  if (!db) return [];
  try {
    const [rows] = await db.query<FaqRow[]>("SELECT id,question,answer,expertise_id FROM faqs WHERE status = 'Published' ORDER BY display_order ASC, created_at DESC");
    return rows;
  } catch (error) {
    console.error("PUBLIC_DB FAQ query failed", error);
    return [];
  }
}

export async function getActiveCareers(): Promise<CareerRow[]> {
  const db = getPublicDb();
  if (!db) return [];
  try {
    const [rows] = await db.query<CareerRow[]>("SELECT id,title,type,location,location_type,department,description,start_date,end_date,form_link FROM careers WHERE status = 'Active' AND (end_date IS NULL OR end_date >= CURRENT_DATE()) ORDER BY created_at DESC");
    return rows;
  } catch (error) {
    console.error("PUBLIC_DB careers query failed", error);
    return [];
  }
}

export async function getPublishedInsights(): Promise<InsightRow[]> {
  const db = getPublicDb();
  if (!db) return [];
  try {
    const [rows] = await db.query<InsightRow[]>("SELECT id,title,slug,excerpt,content,image_url,meta_title,meta_description,meta_keywords,created_at FROM insights WHERE status = 'Published' ORDER BY created_at DESC");
    return rows;
  } catch (error) {
    console.error("PUBLIC_DB insights query failed", error);
    return [];
  }
}

export async function getPublishedPortfolios(): Promise<PortfolioRow[]> {
  const db = getPublicDb();
  if (!db) return [];
  try {
    const [rows] = await db.query<PortfolioRow[]>("SELECT id,title,slug,client_name,short_desc,full_content,image_url,live_link FROM portfolio WHERE status = 'Published' ORDER BY created_at DESC");
    return rows;
  } catch (error) {
    console.error("PUBLIC_DB portfolio query failed", error);
    return [];
  }
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

export async function getPublishedTestimonials(): Promise<TestimonialRow[]> {
  const db = getPublicDb();
  if (!db) return [];
  try {
    const [rows] = await db.query<TestimonialRow[]>("SELECT id,client_name,client_role,expertise_id,review_text,rating,client_image FROM testimonials WHERE status = 'Published' ORDER BY created_at DESC");
    return rows;
  } catch (error) {
    console.error("PUBLIC_DB testimonials query failed", error);
    return [];
  }
}

export async function getActiveBrandDivisions(): Promise<BrandDivisionRow[]> {
  const db = getPublicDb();
  if (!db) return [];
  try {
    const [rows] = await db.query<BrandDivisionRow[]>("SELECT id,name,tagline,svg_code,display_order,status FROM brand_divisions WHERE status = 'Active' ORDER BY display_order ASC, id ASC");
    return rows;
  } catch (error) {
    console.error("PUBLIC_DB brand divisions query failed", error);
    return [];
  }
}

export async function getLegalDirectory(): Promise<LegalDirectoryRow[]> {
  const db = getPublicDb();
  if (!db) return [];
  try {
    const [rows] = await db.query<LegalDirectoryRow[]>("SELECT id,link,icon,title,description,color_class,display_order FROM legal_directory ORDER BY display_order ASC, id ASC");
    return rows;
  } catch (error) {
    console.error("PUBLIC_DB legal directory query failed", error);
    return [];
  }
}

export async function getLegalDocumentBySlug(slug: string): Promise<LegalDocumentRow | null> {
  const db = getPublicDb();
  if (!db) return null;
  try {
    const [rows] = await db.query<LegalDocumentRow[]>("SELECT id,slug,title,version,effective_date,content FROM legal_documents WHERE slug = ? LIMIT 1", [slug]);
    return rows[0] || null;
  } catch (error) {
    console.error("PUBLIC_DB legal document query failed", error);
    return null;
  }
}
