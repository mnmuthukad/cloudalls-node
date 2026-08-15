import session from "express-session";
import MySQLStoreFactory from "express-mysql-session";
import { env, hasResponsesDatabaseConfig } from "../config/env.js";
import { secureCookieOptions } from "./security.js";

const MySQLStore = MySQLStoreFactory(session);

export function createSessionMiddleware() {
  const options: session.SessionOptions = {
    name: "cloudalls_session",
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: secureCookieOptions(),
  };

  if (hasResponsesDatabaseConfig()) {
    options.store = new MySQLStore({
      host: env.DB_HOST,
      port: env.DB_PORT,
      user: env.DB_RESP_USER,
      password: env.DB_RESP_PASS,
      database: env.DB_RESP_NAME,
      createDatabaseTable: true,
      schema: {
        tableName: "node_sessions",
        columnNames: {
          session_id: "session_id",
          expires: "expires",
          data: "data",
        },
      },
    });
  } else if (env.NODE_ENV === "production") {
    console.warn("Responses database is not configured; using the in-memory session store is not production safe.");
  }

  return session(options);
}

declare module "express-session" {
  interface SessionData {
    csrfToken?: string;
    flash?: { type: "success" | "error"; message: string };
  }
}
