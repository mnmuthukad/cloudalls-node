import { createServer } from "node:http";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { closeDatabases } from "./config/database.js";

const app = createApp();
const server = createServer(app);

server.listen(env.PORT, "0.0.0.0", () => {
  console.log(`CloudAlls Node.js listening on port ${env.PORT}`);
});

async function shutdown(signal: string): Promise<void> {
  console.log(`Received ${signal}; shutting down gracefully.`);
  server.close(async () => {
    await closeDatabases();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
