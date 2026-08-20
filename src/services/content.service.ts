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
  { id: 1, title: "Web & Software", slug: "web-development", icon: "fa-code", color: "primary", short_description: "Enterprise-grade web architecture and custom software platforms.", full_description: "CloudAlls architects production-ready web systems built for scale, security, and long-term maintainability. Platform teams work with PHP/Laravel and Node.js backends, React and Vue.js interfaces, and cloud-native AWS/GCP deployments, with technical SEO, accessibility, and performance budgets baked into the architecture from the first commit.", bullet_points: "Enterprise Web Platforms, SaaS & Internal Systems, E-Commerce & API Gateways", price_range: "₹15,000 - ₹45,000 (indicative)", delivery_time: "2 - 4 Weeks", sub_services: "Corporate Websites, Executive Dashboards, Landing Pages, Custom Portals", key_benefits: "Production-Grade Code, Performance Budgets, Accessible by Design", division: "Foundry" } as ExpertiseRow,
  { id: 2, title: "Mobile Apps", slug: "mobile-apps", icon: "fa-mobile-screen-button", color: "primary", short_description: "Cross-platform mobile systems for iOS and Android.", full_description: "Cross-platform mobile products engineered with Flutter — a single codebase compiling natively for iOS and Android with fluid 60FPS performance, offline-first data caching (SQLite/Hive), and bank-grade session security.", bullet_points: "Cross-Platform (Flutter), Production MVPs, Offline-First Architecture", price_range: "₹20,000 - ₹50,000 (indicative)", delivery_time: "4 - 6 Weeks", sub_services: "Flutter Applications, Android Systems, iOS Builds, MVP Sprints", key_benefits: "Single Codebase, Native Performance, Faster Time-to-Market", division: "Foundry" } as ExpertiseRow,
  { id: 3, title: "AI & Tech", slug: "ai-tech", icon: "fa-brain", color: "dark", short_description: "Responsible AI systems integrated into your operating workflow.", full_description: "AI integration where it creates measurable operational value — agentic workflows, automated customer service, and decision support — with Localized AI Models and Private RAG architectures for sensitive enterprise contexts so proprietary data never leaves your secure environment.", bullet_points: "Agentic AI Workflows, Private RAG & Localized Models, Workflow Automation", price_range: "₹20,000 - ₹60,000 (indicative)", delivery_time: "2 - 5 Weeks", sub_services: "Intelligent Assistants, Process Automation, Data Pipelines", key_benefits: "Data Sovereignty, Reduced Operational Overhead, Audit-Ready Outputs", division: "Intelligence" } as ExpertiseRow,
  { id: 4, title: "Innovation & Research", slug: "innovation-research", icon: "fa-flask", color: "info", short_description: "Deep-tech research and strategic feasibility assurance.", full_description: "Before capital is committed, CloudAlls de-risks it. The R&D practice delivers technical feasibility studies, proof-of-concept engineering, and architecture blueprints — investor-ready by design.", bullet_points: "Feasibility Assurance, Proof-of-Concept Engineering, Architecture Blueprints", price_range: "Custom Quoted", delivery_time: "2 - 6 Weeks", sub_services: "Technology Research, System Blueprints, Viability Validation", key_benefits: "Capital De-Risking, Clear Roadmaps, Investor-Ready Evidence", division: "Intelligence" } as ExpertiseRow,
  { id: 5, title: "Product Development", slug: "product-development", icon: "fa-box-open", color: "warning", short_description: "End-to-end delivery from concept to market-ready product.", full_description: "The complete product lifecycle under one accountable team: rapid prototyping, 3D modeling, software architecture, user testing, and full-scale agile delivery in bi-weekly sprints — documented for the teams who will operate the product next.", bullet_points: "Rapid Prototyping, Agile Delivery Sprints, Full Lifecycle Ownership", price_range: "₹40,000+ (indicative)", delivery_time: "1 - 3 Months", sub_services: "3D Modeling, Software Architecture, User Testing & Validation", key_benefits: "Faster Time-to-Market, Scalable Architecture, User-Centric Delivery", division: "Foundry" } as ExpertiseRow,
  { id: 6, title: "Custom Hardware", slug: "custom-hardware", icon: "fa-microchip", color: "dark", short_description: "Engineered hardware ecosystems, from workstations to IoT devices.", full_description: "CloudAlls designs, sources, and commissions custom hardware where software needs a physical brain — enterprise workstations, purpose-built electronics, and IoT devices — delivered with firmware, integration APIs, and warranty-backed support.", bullet_points: "Enterprise Workstations, IoT Device Engineering, Machinery Integration", price_range: "Hardware Dependent", delivery_time: "2 - 4 Weeks", sub_services: "Workstation Builds, IoT Devices, Specialized Machinery", key_benefits: "Custom Engineered, Integration-Ready, Warranty Backed", division: "Foundry" } as ExpertiseRow,
  { id: 7, title: "Design & Print", slug: "design-print", icon: "fa-pen-nib", color: "danger", short_description: "Brand systems across digital and physical touchpoints.", full_description: "Brand presence unified across digital interfaces and physical materials — visual identity systems, UI/UX flow mapping validated through wireframing and A/B testing, and premium printing, book binding, and corporate stationery.", bullet_points: "Brand Identity Systems, UI/UX Design, Premium Print Production", price_range: "₹5,000 - ₹30,000 (indicative)", delivery_time: "1 - 3 Weeks", sub_services: "Logo & Brand Kits, UI Wireframes, Print & Binding", key_benefits: "Unified Brand System, Validated User Flows, Fast Turnaround", division: "Studio" } as ExpertiseRow,
  { id: 8, title: "Photo & Video", slug: "photo-video", icon: "fa-camera", color: "danger", short_description: "Cinematic media production and visual storytelling.", full_description: "End-to-end corporate media production — scripted video shoots, post-production with premium 3D motion graphics, and color-graded product photography delivered as high-resolution masters and web-optimized formats.", bullet_points: "Corporate Video Production, 3D Motion Graphics, Product Photography", price_range: "₹8,000 - ₹25,000 (indicative)", delivery_time: "1 - 2 Weeks", sub_services: "Promotional Video, Product Shoots, Short-Form Content", key_benefits: "End-to-End Production, Campaign-Ready Assets, Consistent Brand Voice", division: "Studio" } as ExpertiseRow,
  { id: 9, title: "Digital Marketing", slug: "digital-marketing", icon: "fa-chart-line", color: "success", short_description: "Growth operations with closed-loop performance analytics.", full_description: "Marketing as an engineering discipline — closed-loop analytics connecting Google Ads, Meta pixels, and your CRM to trace a customer from first ad click through to signed invoice, with technical SEO baked into web architecture from day one.", bullet_points: "Closed-Loop Analytics, Technical & Content SEO, Performance Campaigns", price_range: "₹2,500 - ₹35,000/month (indicative)", delivery_time: "Ongoing Sprint", sub_services: "Local & Enterprise SEO, Paid Campaigns, Social Operations", key_benefits: "Transparent ROI, Measurable Targets, Scalable Spend", division: "Growth" } as ExpertiseRow,
  { id: 10, title: "Security & Automation", slug: "security-automation", icon: "fa-shield-halved", color: "dark", short_description: "Zero-trust physical security and intelligent environments.", full_description: "Physical environments secured with the same rigor as digital systems — high-definition CCTV networks, biometric access control, and smart environment automation under a zero-trust architecture with micro-segmented device zones and encrypted telemetry.", bullet_points: "Zero-Trust Security Design, CCTV & Biometric Access, Smart Environment Control", price_range: "₹15,000+ (indicative)", delivery_time: "1 - 2 Weeks", sub_services: "CCTV Networks, Biometric Access, Lighting & Climate Automation", key_benefits: "Single Monitoring Dashboard, Micro-Segmented Network, 24/7 Telemetry", division: "Operations & Security" } as ExpertiseRow,
  { id: 11, title: "Management & Events", slug: "management-events", icon: "fa-calendar-check", color: "primary", short_description: "Corporate operations management and live event orchestration.", full_description: "Fractional operations management and end-to-end event orchestration — digital ticketing gateways, RSVP and CRM workflows, venue logistics, A/V production, and live-streaming infrastructure — plus lean agile operations consulting.", bullet_points: "Event Operations & Production, Operations Consulting, Lean Agile Workflows", price_range: "Custom Quoted", delivery_time: "Ongoing", sub_services: "Corporate Events, Tech Summits, Operations Consulting", key_benefits: "Stress-Free Execution, Professional Production, Strategic Oversight", division: "Operations & Security" } as ExpertiseRow,
  { id: 12, title: "Training & Academy", slug: "training-academy", icon: "fa-graduation-cap", color: "success", short_description: "Workforce upskilling and the next-generation talent pipeline.", full_description: "The CloudAlls Academy delivers professional masterclasses, corporate upskilling programs, and structured internships with direct hiring pathways — top-performing interns are frequently offered full-time engineering and design roles.", bullet_points: "Corporate Upskilling, Structured Internships, Direct Hiring Pipeline", price_range: "Varies by Program", delivery_time: "3 - 6 Months", sub_services: "Coding Bootcamps, UI/UX Masterclasses, Career Consulting", key_benefits: "Real-World Delivery Experience, Certification, Placement Pathways", division: "Academy" } as ExpertiseRow,
  { id: 13, title: "Cloud Infrastructure", slug: "cloud-infrastructure", icon: "fa-cloud", color: "info", short_description: "Cloud-native hosting, migration, and infrastructure engineering.", full_description: "CloudAlls engineers and operates cloud infrastructure designed around uptime, security, and predictable cost — cloud-native deployment on AWS, GCP, and Azure, zero-downtime migrations, containerized workloads, database provisioning and backup strategy, and managed hosting for production web systems. Every deployment ships with infrastructure-as-code documentation, monitoring dashboards, and an incident response playbook.", bullet_points: "Cloud-Native Deployments, Zero-Downtime Migrations, Infrastructure-as-Code", price_range: "₹10,000+ (indicative)", delivery_time: "1 - 3 Weeks", sub_services: "AWS / GCP / Azure, Serverless Systems, Database Engineering", key_benefits: "Predictable Monthly Cost, 99.9% Uptime Targets, Documented Operations", division: "Foundry" } as ExpertiseRow,
  { id: 14, title: "Business Automation", slug: "business-automation", icon: "fa-gears", color: "warning", short_description: "Workflow automation that removes manual operational overhead.", full_description: "CloudAlls eliminates repetitive operational work by connecting your existing tools — CRM, spreadsheets, email, billing, and inventory — into automated workflows with API integrations, document generation pipelines, scheduled reporting, and approval chains that require no new software purchases.", bullet_points: "Workflow Automation, API Integrations, Automated Reporting", price_range: "₹8,000 - ₹30,000 (indicative)", delivery_time: "1 - 3 Weeks", sub_services: "CRM Automation, Document Pipelines, Notification Workflows", key_benefits: "Hours Saved Weekly, Fewer Manual Errors, No New Software Required", division: "Intelligence" } as ExpertiseRow,
  { id: 15, title: "Brand Consulting", slug: "brand-consulting", icon: "fa-compass-drafting", color: "danger", short_description: "Strategic brand audits and identity direction for growing businesses.", full_description: "CloudAlls partners with leadership teams to audit, position, and evolve their brand before design and media work begins — covering brand positioning audits, competitor and market perception analysis, naming and messaging frameworks, and identity system blueprints that direct every future investment.", bullet_points: "Brand Positioning Audits, Naming & Messaging, Identity System Blueprints", price_range: "₹12,000 - ₹40,000 (indicative)", delivery_time: "2 - 4 Weeks", sub_services: "Positioning Strategy, Market Perception Review, Brand Guidelines", key_benefits: "Decision-Ready Strategy, Aligned Teams, Clear Design Direction", division: "Growth" } as ExpertiseRow,
];

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
    const [rows] = await db.query<ExpertiseRow[]>("SELECT id,title,slug,icon,color,short_description,full_description,bullet_points,price_range,delivery_time,sub_services,key_benefits,division FROM expertise WHERE status = 'Active' ORDER BY display_order ASC, created_at DESC");
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
    const [rows] = await db.query<ExpertiseRow[]>("SELECT id,title,slug,icon,color,short_description,full_description,bullet_points,price_range,delivery_time,sub_services,key_benefits,division FROM expertise WHERE slug = ? AND status = 'Active' LIMIT 1", [slug]);
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
