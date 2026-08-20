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
      // Ensure the description column exists so full division details reach the brand page.
      if (!(await columnExists(pool, "brand_divisions", "description"))) {
        await pool.query(`ALTER TABLE brand_divisions ADD COLUMN description TEXT NULL AFTER tagline`);
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
    if (await tableExists(pool, "brand_divisions") && !(await columnExists(pool, "brand_divisions", "wing"))) {
      await pool.query(`ALTER TABLE brand_divisions ADD COLUMN wing VARCHAR(50) NULL AFTER display_order`);
    }

    // --- expertise: sync division assignments from JSON (idempotent by id) ---
    const targetExpertise = loadJson<ExpertiseData>("expertise.json");
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

    // --- expertise: sync rich service-detail columns (idempotent per column) ---
    const detailColumns: [string, string][] = [
      ["full_description", "TEXT NULL AFTER short_description"],
      ["what_we_deliver", "TEXT NULL AFTER full_description"],
      ["use_cases", "TEXT NULL AFTER what_we_deliver"],
      ["tech_stack", "TEXT NULL AFTER use_cases"],
      ["process_detail", "TEXT NULL AFTER tech_stack"],
    ];
    for (const [column, spec] of detailColumns) {
      if (await tableExists(pool, "expertise") && !(await columnExists(pool, "expertise", column))) {
        await pool.query(`ALTER TABLE expertise ADD COLUMN ${column} ${spec}`);
      }
    }
    if (targetExpertise.length && (await tableExists(pool, "expertise"))) {
      for (const item of targetExpertise) {
        const values: (string | number | null)[] = [];
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
      for (const f of targetFaqs) {
        await pool.query(
          `INSERT IGNORE INTO faqs (id, question, answer, expertise_id, display_order, status) VALUES (?, ?, ?, ?, ?, ?)`,
          [f.id, f.question, f.answer, f.expertise_id ?? null, f.display_order ?? 0, f.status || "Published"],
        );
      }
      console.log(`[db-restructure] faqs service FAQs synced (${targetFaqs.length} rows referenced)`);
    }
  } catch (error) {
    console.error("[db-restructure] failed (non-fatal):", error);
  }
}
