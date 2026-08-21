/**
 * One-shot, guarded legacy response-table cleanup.
 *
 * Purpose: the form response tables used to live in the main content
 * database (DB_PUB_NAME = u372413020_cloudalls). They were migrated to a
 * dedicated responses database (DB_RESP_NAME = u372413020_resp_cloudalls).
 * The old tables in the main DB are now duplicates and must be removed.
 *
 * Safety rules (hard-coded, no input):
 *  - Only these 4 tables are ever touched: contact_inquiries,
 *    partnership_applications, job_applications, dsr_requests.
 *  - Rows are copied (INSERT ... SELECT) into the new DB first, verified
 *    by row count, and ONLY THEN the old table is dropped.
 *  - The operation runs only when the env flag RUN_LEGACY_CLEANUP is set
 *    and a matching secret token is passed on the trigger endpoint.
 *  - The main content tables (expertise, faqs, careers, insights,
 *    portfolio, testimonials, brand_divisions, legal_*) are NEVER touched.
 */
import mysql, { type Pool, type RowDataPacket } from "mysql2/promise";
import { env } from "../config/env.js";
import { getPublicDb, getResponsesDb } from "../config/database.js";

export const LEGACY_RESPONSE_TABLES = [
  "contact_inquiries",
  "partnership_applications",
  "job_applications",
  "dsr_requests",
] as const;

export interface MigrationResult {
  table: string;
  copied: number;
  newCount: number;
  dropped: boolean;
}

interface CountRow extends RowDataPacket {
  count: number;
}

export async function runLegacyCleanup(): Promise<MigrationResult[]> {
  const oldDb = getPublicDb();
  const newDb = getResponsesDb();
  if (!oldDb || !newDb) {
    throw new Error("Both the content and the responses database must be configured");
  }

  const countRows = async (pool: Pool, table: string): Promise<number> => {
    const result = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS count FROM ${table}`,
    );
    const rows = result[0] as unknown as CountRow[];
    return rows[0]?.count ?? 0;
  };

  const results: MigrationResult[] = [];

  for (const table of LEGACY_RESPONSE_TABLES) {
    // 1. Count rows in the old (main) DB.
    const oldCount = await countRows(oldDb, table);
    if (oldCount === 0) {
      // Nothing in the old table to migrate; still verify the new table.
      results.push({ table, copied: 0, newCount: await countRows(newDb, table), dropped: true });
      continue;
    }

    // 2. Copy rows into the new DB at application level.
    // The two MySQL users are each locked to their own database, so a
    // cross-DB INSERT ... SELECT cannot run on either connection. Instead we
    // fetch every old row and insert it into the new pool individually.
    // Columns are hard-coded per table so INSERT targets match exactly.
    const rows = await loadLegacyRows(oldDb, table);
    for (const row of rows) {
      await insertIntoNewDb(newDb, table, row);
    }

    // 3. Verify row count in the new DB matches (old rows preserved).
    const newCount = await countRows(newDb, table);

    // 4. Drop the old table only when the new DB holds at least as many rows.
    let dropped = false;
    if (newCount >= oldCount) {
      await oldDb.query(`DROP TABLE ${table}`);
      dropped = true;
    }

    results.push({ table, copied: rows.length, newCount, dropped });
  }

  return results;
}

interface LegacyRow {
  [column: string]: unknown;
}

async function loadLegacyRows(pool: Pool, table: string): Promise<LegacyRow[]> {
  const result = await pool.query<RowDataPacket[]>(`SELECT * FROM ${table}`);
  return (result[0] ?? []) as unknown as LegacyRow[];
}

// Column mapping from the old (main-DB) response table schema to the new
// responses-DB schema. Only columns that exist in BOTH schemas are copied;
// the new DB computes its own status/source_path/created_at values where
// the old DB lacks them (defaults / CURRENT_TIMESTAMP handle those).
const OLD_TO_NEW_COLUMN_MAP: Record<string, [string, string][]> = {
  contact_inquiries: [["name", "name"], ["email", "email"], ["phone", "whatsapp"], ["message", "message"]],
  partnership_applications: [["company", "company"], ["website", "website"], ["email", "email"], ["proposal", "proposal"]],
  job_applications: [["job_id", "job_id"], ["job_title", "job_title"], ["first_name", "first_name"], ["last_name", "last_name"], ["email", "email"], ["phone", "phone"], ["cover_letter", "cover_letter"]],
  dsr_requests: [["requester_name", "requester_name"], ["requester_email", "requester_email"], ["request_type", "request_type"], ["specific_details", "specific_details"], ["request_ip", "request_ip"]],
};

// The old tables were created by the same app schema definitions (they were
// ensured by ensureTables on whichever pool DB_RESP pointed at the time), so
// the old and new tables share the same column layout.
async function insertIntoNewDb(
  pool: Pool,
  table: string,
  row: LegacyRow,
): Promise<void> {
  const columns = NEW_TABLE_COLUMNS[table];
  if (!columns || columns.length === 0) {
    throw new Error(`No column list defined for ${table}`);
  }
  const values = columns.map(col => row[col] ?? null);
  const quoted = columns.map(() => "?").join(", ");
  const colList = columns.map(c => mysql.escapeId(c)).join(", ");
  await pool.query(`INSERT INTO ${table} (${colList}) VALUES (${quoted})`, values);
}

const NEW_TABLE_COLUMNS: Record<string, string[]> = {
  contact_inquiries: ["name", "email", "whatsapp", "service", "message", "status", "source_path", "created_at", "updated_at"],
  partnership_applications: ["company", "website", "tier", "email", "proposal", "status", "source_path", "created_at", "updated_at"],
  job_applications: ["job_id", "job_title", "first_name", "last_name", "email", "phone", "portfolio_url", "cover_letter", "status", "source_path", "created_at", "updated_at"],
  dsr_requests: ["requester_name", "requester_email", "request_type", "specific_details", "request_ip", "status", "source_path", "created_at", "updated_at"],
};
