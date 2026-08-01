#!/usr/bin/env node
/**
 * Delete emitted assets that nothing in the build references.
 *
 * Why this is needed: the image lookups in src/data use
 * `import.meta.glob(..., { eager: true })`, which is what lets Alroy
 * drop a file into a folder and name it in a data file with no code
 * change. The cost is that Vite emits *every* globbed file into the
 * build, whether or not it is used, and separately from the optimised
 * copies astro:assets produces. That quietly doubled the image weight
 * of the build.
 *
 * Rather than give up the drop-in convenience, the originals are
 * removed afterwards. Anything referenced from HTML, CSS or JS is kept,
 * so a file only disappears when genuinely nothing points at it.
 *
 * Runs as part of `npm run build`.
 */
import { readdirSync, readFileSync, statSync, unlinkSync } from "node:fs";
import { join, extname, basename } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const DIST = join(ROOT, "dist");
const ASSETS = join(DIST, "_astro");

/** File types that can reference an asset by name. */
const TEXT_TYPES = new Set([".html", ".css", ".js", ".json", ".xml", ".txt"]);
/** Only ever prune media; never touch CSS or JS chunks. */
const PRUNABLE = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif", ".svg"]);

function walk(dir, onFile) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, onFile);
    else onFile(full);
  }
}

let referenced = "";
walk(DIST, (file) => {
  if (TEXT_TYPES.has(extname(file).toLowerCase())) referenced += readFileSync(file, "utf8");
});

let removed = 0;
let bytes = 0;

try {
  for (const entry of readdirSync(ASSETS)) {
    if (!PRUNABLE.has(extname(entry).toLowerCase())) continue;
    // Substring match against every text file in the build. Blunt, but
    // that is the point: it errs towards keeping a file.
    if (referenced.includes(entry)) continue;

    const full = join(ASSETS, entry);
    bytes += statSync(full).size;
    unlinkSync(full);
    removed++;
  }
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

if (removed > 0) {
  console.log(
    `✓ Pruned ${removed} unreferenced asset(s), ${(bytes / 1048576).toFixed(2)}MB (${basename(ASSETS)}/).`,
  );
} else {
  console.log("✓ No unreferenced assets to prune.");
}
