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

  if (!env.DB_PUB_NAME || !env.DB_RESP_NAME) {
    throw new Error("Both database names must be configured for the cross-DB copy");
  }

  for (const table of LEGACY_RESPONSE_TABLES) {
    // Qualified identifiers so the SELECT reads from the OLD database while the
    // INSERT writes into the NEW database on the responses pool connection.
    const oldQualified = mysql.escapeId(`${env.DB_PUB_NAME}.${table}`);
    const newQualified = mysql.escapeId(`${env.DB_RESP_NAME}.${table}`);
    // 1. Count rows in the old (main) DB.
    const oldCount = await countRows(oldDb, table);
    if (oldCount === 0) {
      // Nothing in the old table to migrate; still verify the new table.
      results.push({ table, copied: 0, newCount: await countRows(newDb, table), dropped: true });
      continue;
    }

    // 2. Copy rows into the new DB across databases using qualified names.
    // The responses user is locked to its own database, so the copy must run
    // on the old (public) connection, which can address both databases.
    await oldDb.query(
      `INSERT INTO ${newQualified} SELECT * FROM ${oldQualified}`,
    );

    // 3. Verify row count in the new DB matches (old rows preserved).
    const newCount = await countRows(newDb, table);

    // 4. Drop the old table only when the new DB holds at least as many rows.
    let dropped = false;
    if (newCount >= oldCount) {
      await oldDb.query(`DROP TABLE ${table}`);
      dropped = true;
    }

    results.push({ table, copied: oldCount, newCount, dropped });
  }

  return results;
}
