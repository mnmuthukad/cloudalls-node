/**
 * One-time, idempotent database restructure for the CloudAlls subsidiary model.
 * Reconciles the live `brand_divisions` and `expertise` tables with the new
 * consolidated structure defined in data/brand_divisions.json and data/expertise.json.
 * Runs silently at startup; if the public database is unavailable it fails open
 * (the app falls back to JSON data, which already carries the new structure).
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { Pool } from "mysql2/promise";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dataDir = join(__dirname, "../../data");

interface BrandDivisionData {
  name: string;
  tagline: string;
  description?: string;
  wing?: string;
  display_order?: number;
  status?: string;
}

interface ExpertiseData {
  id?: number;
  title: string;
  slug: string;
  icon?: string;
  color?: string;
  division?: string;
  wing?: string;
  display_order?: number;
  status?: string;
  full_description?: string;
  what_we_deliver?: string;
  use_cases?: string;
  tech_stack?: string;
  process_detail?: string;
}

interface FaqData {
  id: number;
  question: string;
  answer: string;
  expertise_id?: number | null;
  display_order?: number;
  status?: string;
}

function loadJson<T>(file: string): T[] {
  try {
    const parsed = JSON.parse(readFileSync(join(dataDir, file), "utf8"));
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

async function existingColumns(pool: Pool, table: string): Promise<string[]> {
  try {
    const [rows] = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ?`, [table]);
    return (rows as { column_name: string }[]).map(r => r.column_name);
  } catch {
    return [];
  }
}

async function columnExists(pool: Pool, table: string, column: string): Promise<boolean> {
  try {
    const [rows] = await pool.query(`SELECT COUNT(*) AS c FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?`, [table, column]);
    const c = (rows as { c: number }[])[0]?.c ?? 0;
    return c > 0;
  } catch {
    return false;
  }
}

async function tableExists(pool: Pool, table: string): Promise<boolean> {
  try {
    const [rows] = await pool.query(`SELECT COUNT(*) AS c FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?`, [table]);
    const c = (rows as { c: number }[])[0]?.c ?? 0;
    return c > 0;
  } catch {
    return false;
  }
}

export async function restructureBrandDatabase(pool: Pool | null): Promise<void> {
  if (!pool) return;
  try {
    // --- brand_divisions: reconcile to the current subsidiary list from the data file ---
    const targetDivisions = loadJson<BrandDivisionData>("brand_divisions.json");
    if (targetDivisions.length && (await tableExists(pool, "brand_divisions"))) {
      await pool.query(`DELETE FROM brand_divisions WHERE status = 'Active'`);
      await pool.query(`DELETE FROM brand_divisions WHERE 1 = 1`);
      // Ensure every column used by the insert exists before the loop — a failed INSERT
      // inside brand_divisions reconciliation aborts the whole restructure, hiding the
      // faqs sync that depends on it.
      if (!(await columnExists(pool, "brand_divisions", "description"))) {
        await pool.query(`ALTER TABLE brand_divisions ADD COLUMN description TEXT NULL AFTER tagline`);
      }
      if (!(await columnExists(pool, "brand_divisions", "wing"))) {
        await pool.query(`ALTER TABLE brand_divisions ADD COLUMN wing VARCHAR(50) NULL AFTER display_order`);
      }
      for (const div of targetDivisions) {
        await pool.query(
          `INSERT INTO brand_divisions (name, tagline, description, wing, display_order, status) VALUES (?, ?, ?, ?, ?, 'Active')`,
          [div.name, div.tagline, div.description || null, div.wing || "capabilities", div.display_order ?? 0],
        );
      }
      console.log(`[db-restructure] brand_divisions reconciled to ${targetDivisions.length} entities`);
    }

    // --- expertise: add `division` column if missing ---
    if (await tableExists(pool, "expertise") && !(await columnExists(pool, "expertise", "division"))) {
      await pool.query(`ALTER TABLE expertise ADD COLUMN division VARCHAR(100) NULL AFTER display_order`);
    }
    if (await tableExists(pool, "expertise") && !(await columnExists(pool, "expertise", "wing"))) {
      await pool.query(`ALTER TABLE expertise ADD COLUMN wing VARCHAR(50) NULL AFTER division`);
    }
    // --- expertise: full upsert of every JSON row (idempotent via INSERT IGNORE on id) ---
    // Without this, services that exist in the JSON catalogue but are missing from the
    // live table (e.g. the 51-row catalogue vs. the legacy rows) are never created, and
    // any downstream reference (faqs.expertise_id, detail pages) cannot resolve them.
    const targetExpertise = loadJson<ExpertiseData>("expertise.json");
    const upsertColumns = [
      "id", "title", "slug", "icon", "color", "division", "wing", "short_description",
      "full_description", "bullet_points", "price_range", "delivery_time",
      "sub_services", "key_benefits", "status", "display_order",
      "what_we_deliver", "use_cases", "tech_stack", "process_detail",
    ] as const;
    if (targetExpertise.length && (await tableExists(pool, "expertise"))) {
      const liveCols = await existingColumns(pool, "expertise");
      const cols = upsertColumns.filter(c => liveCols.includes(c));
      let inserted = 0;
      for (const item of targetExpertise) {
        const values: unknown[] = [];
        for (const col of cols) {
          values.push((item as unknown as Record<string, unknown>)[col] ?? null);
        }
        const [result] = await pool.query(
          `INSERT IGNORE INTO expertise (${cols.join(", ")}) VALUES (${cols.map(() => "?").join(", ")})`,
          values,
        );
        if ((result as { affectedRows: number })?.affectedRows) inserted += 1;
      }
      console.log(`[db-restructure] expertise rows upserted (${inserted} inserted of ${targetExpertise.length} referenced)`);
    }
    if (targetExpertise.length && (await tableExists(pool, "expertise"))) {
      for (const item of targetExpertise) {
        if (item.division) {
          await pool.query(`UPDATE expertise SET division = ? WHERE id = ?`, [item.division, item.id]);
        }
        if (item.wing) {
          await pool.query(`UPDATE expertise SET wing = ? WHERE id = ?`, [item.wing, item.id]);
        }
      }
      console.log(`[db-restructure] expertise division assignments synced (${targetExpertise.length} rows referenced)`);
    }

    // --- expertise: refresh rich service-detail columns for existing rows (idempotent per row) ---
    if (targetExpertise.length && (await tableExists(pool, "expertise"))) {
      for (const item of targetExpertise) {
        const values: unknown[] = [];
        const sets: string[] = [];
        for (const col of ["full_description", "what_we_deliver", "use_cases", "tech_stack", "process_detail"] as const) {
          const v = (item as unknown as Record<string, unknown>)[col];
          if (typeof v === "string" && v.trim().length) {
            sets.push(`${col} = ?`);
            values.push(v.trim());
          }
        }
        if (sets.length) {
          values.push(item.id ?? 0);
          await pool.query(`UPDATE expertise SET ${sets.join(", ")} WHERE id = ?`, values);
        }
      }
      console.log(`[db-restructure] expertise service-detail columns synced (${targetExpertise.length} rows referenced)`);
    }

    // --- faqs: sync per-service FAQs from JSON (idempotent via INSERT IGNORE on id) ---
    const targetFaqs = loadJson<FaqData>("faqs.json").filter(f => typeof f.expertise_id === "number");
    if (targetFaqs.length && (await tableExists(pool, "faqs"))) {
      if (!(await columnExists(pool, "faqs", "expertise_id"))) {
        await pool.query(`ALTER TABLE faqs ADD COLUMN expertise_id INT NULL AFTER answer`);
      }
      if (!(await columnExists(pool, "faqs", "display_order"))) {
        await pool.query(`ALTER TABLE faqs ADD COLUMN display_order INT NOT NULL DEFAULT 0 AFTER expertise_id`);
      }
      if (!(await columnExists(pool, "faqs", "status"))) {
        await pool.query(`ALTER TABLE faqs ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'Published' AFTER display_order`);
      }
      let faqInserted = 0;
      let faqSkipped = 0;
      for (const f of targetFaqs) {
        const [faqResult] = await pool.query(
          `INSERT IGNORE INTO faqs (id, question, answer, expertise_id, display_order, status) VALUES (?, ?, ?, ?, ?, ?)`,
          [f.id, f.question, f.answer, f.expertise_id ?? null, f.display_order ?? 0, f.status || "Published"],
        );
        if ((faqResult as { affectedRows: number })?.affectedRows) faqInserted += 1; else faqSkipped += 1;
      }
      console.log(`[db-restructure] faqs service FAQs synced (${faqInserted} inserted, ${faqSkipped} already present, ${targetFaqs.length} referenced)`);
    }
  } catch (error) {
    console.error("[db-restructure] failed (non-fatal):", error);
  }
}
