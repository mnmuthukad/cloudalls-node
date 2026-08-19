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
    // --- brand_divisions: reconcile to the 4 consolidated subsidiaries ---
    const targetDivisions = loadJson<BrandDivisionData>("brand_divisions.json");
    if (targetDivisions.length && (await tableExists(pool, "brand_divisions"))) {
      await pool.query(`DELETE FROM brand_divisions WHERE status = 'Active'`);
      await pool.query(`DELETE FROM brand_divisions WHERE 1 = 1`);
      for (const div of targetDivisions) {
        await pool.query(
          `INSERT INTO brand_divisions (name, tagline, display_order, status) VALUES (?, ?, ?, 'Active')`,
          [div.name, div.tagline, div.display_order ?? 0],
        );
      }
      console.log(`[db-restructure] brand_divisions reconciled to ${targetDivisions.length} subsidiaries`);
    }

    // --- expertise: add `division` column if missing ---
    if (await tableExists(pool, "expertise") && !(await columnExists(pool, "expertise", "division"))) {
      await pool.query(`ALTER TABLE expertise ADD COLUMN division VARCHAR(100) NULL AFTER display_order`);
    }

    // --- expertise: sync division assignments from JSON (idempotent by id) ---
    const targetExpertise = loadJson<ExpertiseData>("expertise.json");
    if (targetExpertise.length && (await tableExists(pool, "expertise"))) {
      for (const item of targetExpertise) {
        if (item.division) {
          await pool.query(`UPDATE expertise SET division = ? WHERE id = ?`, [item.division, item.id]);
        }
      }
      console.log(`[db-restructure] expertise division assignments synced (${targetExpertise.length} rows referenced)`);
    }
  } catch (error) {
    console.error("[db-restructure] failed (non-fatal):", error);
  }
}
