import { getPublicDb, getResponsesDb } from "./database.js";

const PUBLIC_TABLES: Record<string, string> = {
  expertise: `CREATE TABLE IF NOT EXISTS expertise (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    icon VARCHAR(60) NULL,
    color VARCHAR(60) NULL,
    short_description VARCHAR(600) NULL,
    full_description TEXT NULL,
    bullet_points TEXT NULL,
    price_range VARCHAR(100) NULL,
    delivery_time VARCHAR(100) NULL,
    sub_services TEXT NULL,
    key_benefits TEXT NULL,
    status ENUM('Active','Archived') NOT NULL DEFAULT 'Active',
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_expertise_status (status),
    INDEX idx_expertise_slug (slug)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  faqs: `CREATE TABLE IF NOT EXISTS faqs (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    question VARCHAR(400) NOT NULL,
    answer TEXT NULL,
    expertise_id INT UNSIGNED NULL,
    status ENUM('Published','Draft') NOT NULL DEFAULT 'Published',
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_faqs_status (status)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  careers: `CREATE TABLE IF NOT EXISTS careers (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    type ENUM('Full-time','Part-time','Contract','Internship') NOT NULL DEFAULT 'Full-time',
    location VARCHAR(120) NULL,
    location_type ENUM('On-site','Remote','Hybrid') NULL,
    department VARCHAR(120) NULL,
    description TEXT NULL,
    start_date DATE NULL,
    end_date DATE NULL,
    form_link VARCHAR(500) NULL,
    status ENUM('Active','Closed') NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_careers_status (status)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  insights: `CREATE TABLE IF NOT EXISTS insights (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    excerpt TEXT NULL,
    content TEXT NULL,
    image_url VARCHAR(500) NULL,
    meta_title VARCHAR(300) NULL,
    meta_description VARCHAR(400) NULL,
    meta_keywords VARCHAR(300) NULL,
    status ENUM('Published','Draft') NOT NULL DEFAULT 'Published',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_insights_status (status),
    INDEX idx_insights_slug (slug)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  portfolio: `CREATE TABLE IF NOT EXISTS portfolio (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    client_name VARCHAR(200) NULL,
    short_desc VARCHAR(400) NULL,
    full_content TEXT NULL,
    image_url VARCHAR(500) NULL,
    live_link VARCHAR(500) NULL,
    status ENUM('Published','Draft') NOT NULL DEFAULT 'Published',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_portfolio_status (status),
    INDEX idx_portfolio_slug (slug)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  testimonials: `CREATE TABLE IF NOT EXISTS testimonials (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    client_name VARCHAR(200) NOT NULL,
    client_role VARCHAR(200) NULL,
    expertise_id INT UNSIGNED NULL,
    review_text TEXT NOT NULL,
    rating TINYINT UNSIGNED NULL,
    client_image VARCHAR(500) NULL,
    status ENUM('Published','Draft') NOT NULL DEFAULT 'Published',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_testimonials_status (status)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  brand_divisions: `CREATE TABLE IF NOT EXISTS brand_divisions (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    tagline VARCHAR(400) NULL,
    svg_code TEXT NULL,
    display_order INT NOT NULL DEFAULT 0,
    status ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_brand_divisions_status (status)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  legal_directory: `CREATE TABLE IF NOT EXISTS legal_directory (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    link VARCHAR(200) NOT NULL UNIQUE,
    icon VARCHAR(60) NULL,
    title VARCHAR(300) NOT NULL,
    description TEXT NULL,
    color_class VARCHAR(60) NULL,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  legal_documents: `CREATE TABLE IF NOT EXISTS legal_documents (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(120) NOT NULL UNIQUE,
    title VARCHAR(300) NOT NULL,
    version VARCHAR(40) NULL,
    effective_date DATE NULL,
    content TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_legal_documents_slug (slug)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  legal_compliance_pillars: `CREATE TABLE IF NOT EXISTS legal_compliance_pillars (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    icon VARCHAR(60) NULL,
    title VARCHAR(300) NOT NULL,
    description TEXT NULL,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  legal_crisis_response: `CREATE TABLE IF NOT EXISTS legal_crisis_response (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    step_number INT NOT NULL,
    title VARCHAR(300) NOT NULL,
    color VARCHAR(60) NULL,
    description TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  legal_frameworks: `CREATE TABLE IF NOT EXISTS legal_frameworks (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    jurisdiction VARCHAR(120) NULL,
    region_code VARCHAR(40) NULL,
    framework_name VARCHAR(200) NOT NULL,
    authority VARCHAR(200) NULL,
    framework_type VARCHAR(120) NULL,
    scope_summary TEXT NULL,
    review_status ENUM('Current','Under Review','Deprecated') NULL DEFAULT 'Current',
    source_url VARCHAR(500) NULL,
    last_reviewed DATE NULL,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
};

const RESPONSES_TABLES: Record<string, string> = {
  contact_inquiries: `CREATE TABLE IF NOT EXISTS contact_inquiries (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(320) NOT NULL,
    whatsapp VARCHAR(30) NULL,
    service VARCHAR(120) NULL,
    message TEXT NOT NULL,
    status ENUM('New','In Review','Resolved','Closed') NOT NULL DEFAULT 'New',
    source_path VARCHAR(500) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_contact_inquiries_status (status)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  partnership_applications: `CREATE TABLE IF NOT EXISTS partnership_applications (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    company VARCHAR(255) NOT NULL,
    website VARCHAR(300) NULL,
    tier VARCHAR(60) NULL,
    email VARCHAR(320) NOT NULL,
    proposal TEXT NOT NULL,
    status ENUM('Pending','Under Review','Approved','Declined') NOT NULL DEFAULT 'Pending',
    source_path VARCHAR(500) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_partnership_status (status)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  job_applications: `CREATE TABLE IF NOT EXISTS job_applications (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    job_id INT UNSIGNED NULL,
    job_title VARCHAR(200) NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(320) NOT NULL,
    phone VARCHAR(30) NULL,
    portfolio_url VARCHAR(500) NULL,
    cover_letter TEXT NOT NULL,
    status ENUM('New','Shortlisted','Interview','Declined','Hired') NOT NULL DEFAULT 'New',
    source_path VARCHAR(500) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_job_applications_status (status)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  dsr_requests: `CREATE TABLE IF NOT EXISTS dsr_requests (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    requester_name VARCHAR(255) NOT NULL,
    requester_email VARCHAR(320) NOT NULL,
    request_type ENUM('Access','Modification','Deletion','Portability','Objection','Other') NOT NULL,
    specific_details TEXT NOT NULL,
    request_ip VARCHAR(45) NULL,
    status ENUM('Pending','In Progress','Completed','Rejected') NOT NULL DEFAULT 'Pending',
    source_path VARCHAR(500) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_dsr_requests_status (status)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
};

async function ensureTables(tables: Record<string, string>): Promise<string[]> {
  const ensured: string[] = [];
  for (const [name, ddl] of Object.entries(tables)) {
    const executor = name.startsWith("contact_") || name.startsWith("partnership_") || name.startsWith("job_") || name.startsWith("dsr_") ? getResponsesDb() : getPublicDb();
    if (!executor) continue;
    try {
      await executor.query(ddl);
      ensured.push(name);
    } catch (error) {
      console.warn(`[schema] table ${name} initialization skipped:`, (error as Error).message);
    }
  }
  return ensured;
}

export async function initializeSchemas(): Promise<void> {
  const publicEnsured = await ensureTables(PUBLIC_TABLES);
  if (publicEnsured.length) console.log(`[schema] public tables ensured: ${publicEnsured.join(", ")}`);
  const responsesEnsured = await ensureTables(RESPONSES_TABLES);
  if (responsesEnsured.length) console.log(`[schema] responses tables ensured: ${responsesEnsured.join(", ")}`);
}

export const PUBLIC_TABLE_NAMES = Object.keys(PUBLIC_TABLES);
export const RESPONSES_TABLE_NAMES = Object.keys(RESPONSES_TABLES);
