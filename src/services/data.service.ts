import fs from "node:fs";
import path from "node:path";

const cache = new Map<string, unknown>();
const warned = new Set<string>();

function warnFallback(filename: string, error: unknown): void {
  if (warned.has(filename)) return;
  warned.add(filename);
  console.warn(
    `CloudAlls editable data unavailable for ${filename}; using the in-code fallback.`,
    error instanceof Error ? error.message : error,
  );
}

export function loadJsonData<T>(filename: string, fallback: T): T {
  if (cache.has(filename)) return cache.get(filename) as T;

  const dataPath = path.join(process.cwd(), "data", filename);
  try {
    const raw = fs.readFileSync(dataPath, "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (parsed === null || parsed === undefined) throw new Error("JSON value is empty");
    cache.set(filename, parsed);
    return parsed as T;
  } catch (error) {
    warnFallback(filename, error);
    cache.set(filename, fallback);
    return fallback;
  }
}

export function clearJsonDataCache(): void {
  cache.clear();
  warned.clear();
}
