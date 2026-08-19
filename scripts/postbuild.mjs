// Post-build step: verifies dist layout and writes a version marker.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const dist = join(root, "dist");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

const required = ["dist/server.js", "dist/views/layouts/header.ejs", "dist/views/layouts/footer.ejs", "dist/views/pages/home.ejs", "dist/data", "dist/public"];
const missing = required.filter(file => {
  try {
    return false;
  } catch {
    return true;
  }
});

// Validate critical dist artifacts exist
const fs = await import("node:fs");
for (const file of required) {
  if (!fs.existsSync(join(root, file))) {
    console.error(`[postbuild] MISSING REQUIRED ARTIFACT: ${file}`);
    process.exit(1);
  }
}

// Write package.json into dist so production installs resolve correctly
const prodPkg = {
  name: pkg.name,
  version: pkg.version,
  private: true,
  type: "module",
  engines: pkg.engines,
  scripts: { start: "node server.js" },
  dependencies: pkg.dependencies,
  overrides: pkg.overrides,
};
writeFileSync(join(dist, "package.json"), JSON.stringify(prodPkg, null, 2) + "\n");

writeFileSync(join(dist, "BUILD_VERSION.txt"), `${pkg.version} ${new Date().toISOString()}\n`);
console.log(`[postbuild] dist verified (${required.length} artifacts), version ${pkg.version}`);
