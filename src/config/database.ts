import mysql, { type Pool } from "mysql2/promise";
import { env, hasPublicDatabaseConfig, hasResponsesDatabaseConfig } from "./env.js";

let publicPool: Pool | null = null;
let responsesPool: Pool | null = null;

function createPool(database: string, user: string, password: string): Pool {
  return mysql.createPool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    database,
    user,
    password,
    charset: "utf8mb4",
    timezone: "+05:30",
    waitForConnections: true,
    connectionLimit: 8,
    maxIdle: 4,
    idleTimeout: 30000,
    queueLimit: 24,
    connectTimeout: 5000,
    enableKeepAlive: true,
  });
}

export function getPublicDb(): Pool | null {
  if (!hasPublicDatabaseConfig()) return null;
  publicPool ??= createPool(env.DB_PUB_NAME, env.DB_PUB_USER, env.DB_PUB_PASS);
  return publicPool;
}

export function getResponsesDb(): Pool | null {
  if (!hasResponsesDatabaseConfig()) return null;
  responsesPool ??= createPool(env.DB_RESP_NAME, env.DB_RESP_USER, env.DB_RESP_PASS);
  return responsesPool;
}

export async function closeDatabases(): Promise<void> {
  await Promise.all([
    publicPool?.end(),
    responsesPool?.end(),
  ]);
  publicPool = null;
  responsesPool = null;
}
