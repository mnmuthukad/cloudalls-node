import type { RowDataPacket } from "mysql2";
import { getPublicDb } from "../config/database.js";
import { loadJsonData } from "./data.service.js";
import sanitizeHtml from "sanitize-html";

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

const fallbackExpertise: ExpertiseRow[] = [
  { id: 1, title: "Web & Software", slug: "web-development", icon: "fa-code", color: "primary", short_description: "Scalable corporate web architecture and custom software platforms.", full_description: "We provide highly affordable and reliable web architecture tailored for growing businesses. Our web and software solutions focus on clean coding, rapid deployment, and essential functionality to get your business online quickly without over-stretching your budget.", bullet_points: "Custom Corporate Web Dev, SaaS & Internal Platforms, E-Commerce & Gateways", price_range: "₹15,000 - ₹45,000", delivery_time: "2 - 4 Weeks", sub_services: "Corporate Websites, Lean Dashboards, Landing Pages", key_benefits: "Cost-Effective, Fast Loading, Mobile Responsive" } as ExpertiseRow,
  { id: 2, title: "Mobile Apps", slug: "mobile-apps", icon: "fa-mobile-screen-button", color: "primary", short_description: "Cross-platform mobile ecosystems for iOS and Android.", full_description: "Launch your app idea on a lean budget. We specialize in cross-platform development using Flutter to build robust MVP mobile applications. Get to market faster and validate your idea without the massive upfront costs of enterprise development.", bullet_points: "Cross-Platform (Flutter), MVP Rapid Sprints, iOS & Android Design", price_range: "₹20,000 - ₹50,000", delivery_time: "4 - 6 Weeks", sub_services: "Hybrid Flutter Apps, Android Apps, Basic iOS Apps", key_benefits: "One Codebase (Hybrid), Rapid MVP Sprints, Startup Friendly" } as ExpertiseRow,
  { id: 3, title: "AI & Tech", slug: "ai-tech", icon: "fa-brain", color: "dark", short_description: "Integrating machine learning and cognitive computing into your workflow.", full_description: "Artificial Intelligence isn't just for massive corporations anymore. We help startups and SMBs integrate accessible AI tools, automated customer service chatbots, and lean data models to save time and reduce daily operational overhead.", bullet_points: "AI/ML Integration, Smart Customer Chatbots, Predictive Data Models", price_range: "₹20,000 - ₹60,000", delivery_time: "2 - 5 Weeks", sub_services: "Custom ChatGPT Bots, Basic Workflow Automation, Data Scripts", key_benefits: "Reduces Manual Work, 24/7 Support Bots, Affordable Tech" } as ExpertiseRow,
  { id: 4, title: "Innovation & Research", slug: "innovation-research", icon: "fa-flask", color: "info", short_description: "Deep tech research and strategic feasibility studies.", full_description: "Before you build, you must blueprint. Our R&D division researches deep-tech solutions, validates concepts, and maps the technology stack required to bring a groundbreaking idea to life safely and efficiently.", bullet_points: "Tech Feasibility Studies, Proof of Concept (PoC), Architecture Blueprinting", price_range: "Custom Quoted", delivery_time: "2 - 6 Weeks", sub_services: "Market Tech Research, System Blueprints, Viability Testing", key_benefits: "Risk Mitigation, Clear Roadmaps, Investor-Ready Data" } as ExpertiseRow,
  { id: 5, title: "Product Development", slug: "product-development", icon: "fa-box-open", color: "warning", short_description: "End-to-end creation from raw concept to market-ready product.", full_description: "We turn ideas into tangible assets. Our product development lifecycle covers rapid 3D prototyping, software wireframing, and full-scale agile development sprints so products are built to scale from day one.", bullet_points: "Rapid Prototyping, Agile Development Sprints, MVP Launches", price_range: "₹40,000+", delivery_time: "1 - 3 Months", sub_services: "3D Modeling, Software Architecture, User Testing", key_benefits: "Faster Time-to-Market, Scalable Code, User-Centric" } as ExpertiseRow,
  { id: 6, title: "Custom Hardware", slug: "custom-hardware", icon: "fa-microchip", color: "dark", short_description: "Custom electronics, computer machinery, and hardware manufacturing.", full_description: "Software needs a physical brain. CloudAlls designs, sources, and manufactures custom hardware ecosystems, including high-performance workstations, specialized electronics, and integrated machinery.", bullet_points: "Custom PC & Workstations, Electronics Integration, Machinery Builds", price_range: "Hardware Dependent", delivery_time: "2 - 4 Weeks", sub_services: "Workstation Builds, IoT Devices, Machinery Setup", key_benefits: "High Performance, Custom Built, Warranty Backed" } as ExpertiseRow,
  { id: 7, title: "Design & Print", slug: "design-print", icon: "fa-pen-nib", color: "danger", short_description: "Digital branding alongside physical print and binding.", full_description: "We bridge the gap between digital and physical through visual identities, UI/UX flow mapping, digital collateral, high-quality printing, book binding, posters, and flyers.", bullet_points: "Digital UI/UX Design, Posters & Flyers, Book Binding & Print", price_range: "₹5,000 - ₹30,000", delivery_time: "1 - 3 Weeks", sub_services: "Essential Logo Design, Startup Brand Kits, UI Wireframes", key_benefits: "Professional Look, Quick Turnaround, Modern Aesthetic" } as ExpertiseRow,
  { id: 8, title: "Photo & Video", slug: "photo-video", icon: "fa-camera", color: "danger", short_description: "High-end visual storytelling and digital content production.", full_description: "Our creative studios merge technical precision with cinematic vision through corporate video shoots, 3D motion graphics, and premium product photography.", bullet_points: "Corporate Video Shoots, 3D Motion Graphics, Product Photography", price_range: "₹8,000 - ₹25,000", delivery_time: "1 - 2 Weeks", sub_services: "Social Media Promos, Product Photography, Short Form Reels", key_benefits: "Engaging Visuals, High Social ROI, Perfect for Startups" } as ExpertiseRow,
];

const fallbackCareers: CareerRow[] = [
  { id: 14, title: "Senior Full-Stack Engineer", type: "Full-Time", location: "Kerala, India", location_type: "Hybrid", department: "Engineering", description: "We are looking for an experienced developer to lead our core product team. You should be proficient in PHP, MySQL, and modern JavaScript frameworks. Key responsibilities include architecting scalable backend systems, mentoring junior developers, and collaborating with the design team.", start_date: "2026-02-24", end_date: "2026-05-22", form_link: "https://forms.gle/example1" } as CareerRow,
  { id: 15, title: "Web Development Intern", type: "Internship", location: "Remote", location_type: "Remote", department: "Engineering", description: "Join our three-month intensive internship program. You will work directly on live projects and learn industry-standard coding practices. Requirements include basic HTML and CSS knowledge, eagerness to learn, and availability for 20 hours per week.", start_date: "2026-02-24", end_date: "2026-03-11", form_link: "https://forms.gle/example2" } as CareerRow,
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
    const [rows] = await db.query<ExpertiseRow[]>("SELECT id,title,slug,icon,color,short_description,full_description,bullet_points,price_range,delivery_time,sub_services,key_benefits FROM expertise WHERE status = 'Active' ORDER BY display_order ASC, created_at DESC");
    return rows.length ? rows : editableExpertise;
  } catch (error) {
    console.error("PUBLIC_DB expertise query failed", error);
    return editableExpertise;
  }
}

export async function getExpertiseBySlug(slug: string): Promise<ExpertiseRow | null> {
  const db = getPublicDb();
  if (!db) return editableExpertise.find(item => item.slug === slug) || null;
  try {
    const [rows] = await db.query<ExpertiseRow[]>("SELECT id,title,slug,icon,color,short_description,full_description,bullet_points,price_range,delivery_time,sub_services,key_benefits FROM expertise WHERE slug = ? AND status = 'Active' LIMIT 1", [slug]);
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
    const [rows] = await db.query<BrandDivisionRow[]>("SELECT id,name,tagline,svg_code,display_order,status FROM brand_divisions WHERE status = 'Active' ORDER BY display_order ASC, id ASC");
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
