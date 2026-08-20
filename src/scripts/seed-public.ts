import "dotenv/config";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";
import { env } from "../config/env.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const dataDir = join(__dirname, "../../data");

function load<T>(file: string): T[] {
  const parsed = JSON.parse(readFileSync(join(dataDir, file), "utf8"));
  if (Array.isArray(parsed)) return parsed as T[];
  const rows = parsed?.rows ?? parsed?.sections ?? Object.values(parsed);
  return (Array.isArray(rows) ? rows : []) as T[];
}

async function seed(): Promise<void> {
  if (!env.DB_HOST || !env.DB_PUB_NAME || !env.DB_PUB_USER) {
    console.error("Public database is not configured.");
    process.exit(1);
  }
  const pool = mysql.createPool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    database: env.DB_PUB_NAME,
    user: env.DB_PUB_USER,
    password: env.DB_PUB_PASS,
    charset: "utf8mb4",
    timezone: "+05:30",
  });

  const seedTable = async (table: string, file: string, map: (row: Record<string, unknown>) => Record<string, unknown>) => {
    const rows = load<Record<string, unknown>>(file);
    if (!rows.length) return console.log(`[seed] ${table}: no JSON rows, skipped`);
    const [existing] = await pool.query<import("mysql2").RowDataPacket[]>(`SELECT id FROM ${table} LIMIT 1`);
    if (existing.length > 0) return console.log(`[seed] ${table}: already populated, skipped`);
    for (const row of rows) {
      const mapped = map(row);
      const keys = Object.keys(mapped);
      await pool.query(
        `INSERT IGNORE INTO ${table} (${keys.join(", ")}) VALUES (${keys.map(() => "?").join(", ")})`,
        keys.map(key => mapped[key] ?? null),
      );
    }
    console.log(`[seed] ${table}: inserted ${rows.length} rows`);
  };

  await seedTable("expertise", "expertise.json", row => ({
    title: row.title, slug: row.slug ?? row.title, icon: row.icon, color: row.color,
    short_description: row.short_description ?? row.description, full_description: row.full_description,
    bullet_points: row.bullet_points, price_range: row.price_range, delivery_time: row.delivery_time,
    sub_services: row.sub_services, key_benefits: row.key_benefits, status: row.status ?? "Active",
    division: row.division ?? null, wing: row.wing ?? null, display_order: row.display_order ?? 0,
  }));
  await seedTable("faqs", "faqs.json", row => ({
    question: row.question, answer: row.answer, expertise_id: row.expertise_id,
    status: row.status ?? "Published", display_order: row.display_order ?? 0,
  }));
  await seedTable("careers", "careers.json", row => ({
    title: row.title, type: row.type ?? "Full-time", location: row.location,
    location_type: row.location_type, department: row.department, description: row.description,
    start_date: row.start_date, end_date: row.end_date, form_link: row.form_link,
    status: row.status ?? "Active",
  }));
  await seedTable("insights", "insights.json", row => ({
    title: row.title, slug: row.slug ?? row.title, excerpt: row.excerpt, content: row.content,
    image_url: row.image_url, meta_title: row.meta_title, meta_description: row.meta_description,
    meta_keywords: row.meta_keywords, status: row.status ?? "Published",
  }));
  await seedTable("portfolio", "portfolio.json", row => ({
    title: row.title, slug: row.slug ?? row.title, client_name: row.client_name,
    short_desc: row.short_desc ?? row.description, full_content: row.full_content,
    image_url: row.image_url, live_link: row.live_link, status: row.status ?? "Published",
  }));
  await seedTable("testimonials", "testimonials.json", row => ({
    client_name: row.client_name ?? row.name, client_role: row.client_role ?? row.role,
    expertise_id: row.expertise_id, review_text: row.review_text ?? row.text ?? row.review,
    rating: row.rating, client_image: row.client_image ?? row.image, status: row.status ?? "Published",
  }));
  await seedTable("brand_divisions", "brand_divisions.json", row => ({
    name: row.name, tagline: row.tagline, svg_code: row.svg_code,
    display_order: row.display_order ?? 0, status: row.status ?? "Active",
  }));
  await pool.end();
  console.log("[seed] public database seeding complete.");
}

await seed().catch(error => {
  console.error("[seed] failed:", error);
  process.exit(1);
});
