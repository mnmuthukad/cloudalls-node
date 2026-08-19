// Produces a production deploy tarball containing only what the Node.js runtime needs:
// dist contents + root package.json (lockfile for reproducible install) + .env loader note.
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, cpSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const staging = join(root, "deploy-stage");

if (existsSync(staging)) execSync(`rm -rf ${staging}`);
mkdirSync(staging, { recursive: true });

cpSync(join(root, "dist"), join(staging, "dist"), { recursive: true });
cpSync(join(root, "package.json"), join(staging, "package.json"));
cpSync(join(root, "package-lock.json"), join(staging, "package-lock.json"));

// Production server entry at root (tiny wrapper delegating to dist/server.js)
writeFileSync(join(staging, "server.js"), `import("./dist/server.js");\n`);

writeFileSync(join(staging, ".env.example"), `NODE_ENV=production
PORT=8080
APP_URL=https://cloudalls.com
SESSION_SECRET=<unique random string, at least 64 characters>
DB_HOST=<Hostinger MySQL host>
DB_PORT=3306
DB_PUB_NAME=u372413020_cloudalls
DB_PUB_USER=u372413020_cloudalls
DB_PUB_PASS=<database password>
DB_RESP_NAME=u372413020_caresp
DB_RESP_USER=u372413020_caresp
DB_RESP_PASS=<database password>
MAX_UPLOAD_MB=8
`);

execSync(`cd ${staging} && tar -czf ${root}/cloudalls-deploy.tar.gz .`, { stdio: "inherit" });
console.log("[package] deploy bundle created: cloudalls-deploy.tar.gz");
execSync(`ls -la ${root}/cloudalls-deploy.tar.gz`, { stdio: "inherit" });
