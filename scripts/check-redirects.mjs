#!/usr/bin/env node
/**
 * PRD §12b gate: no legacy redirect may shadow a file the site actually
 * serves.
 *
 * This exists because of a bug that was invisible in every local check.
 * `public/.htaccess` redirects the old WordPress URL space, and one rule
 * was `^/portfolio/.+$` -> the homepage. The new site serves its own
 * clips from `/portfolio/video/*.mp4`, so in production every portfolio
 * video 301'd to an HTML page. The browser fetched the poster, then got
 * a document where it expected an mp4, and each clip sat frozen on its
 * first frame. No .htaccess runs against `dist/` locally, so the whole
 * local suite passed while all five clips were broken on the live site.
 *
 * So: parse the redirect rules, run every built file path through them,
 * and fail if any real file would be redirected away.
 */
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const DIST = join(ROOT, "dist");
const HTACCESS = join(ROOT, "public", ".htaccess");

if (!existsSync(DIST)) {
  console.error("✖ Redirect check needs a build. Run `npm run build` first.");
  process.exit(1);
}

/** Every path the built site serves, as a URL path. */
function servedPaths(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) servedPaths(full, out);
    else out.push("/" + relative(DIST, full).split(sep).join("/"));
  }
  return out;
}

const files = servedPaths(DIST);
/* A directory index is reachable at its directory URL too. */
const paths = new Set(files);
for (const file of files) {
  if (file.endsWith("/index.html")) paths.add(file.replace(/index\.html$/, ""));
}

const source = readFileSync(HTACCESS, "utf8");
const rules = [];

for (const raw of source.split("\n")) {
  const line = raw.trim();
  if (line.startsWith("#") || line === "") continue;

  // RedirectMatch [status] <regex> <target>
  let m = /^RedirectMatch\s+(?:\d{3}\s+)?(\S+)\s+(\S+)/i.exec(line);
  if (m) {
    rules.push({ line, kind: "RedirectMatch", test: (p) => new RegExp(m[1]).test(p) });
    continue;
  }

  // Redirect [status] <path-prefix> <target> — matches by PREFIX, which is
  // the half of this that is easy to forget.
  m = /^Redirect\s+(?:\d{3}\s+)?(\/\S*)\s+(\S+)/i.exec(line);
  if (m) {
    rules.push({ line, kind: "Redirect (prefix)", test: (p) => p.startsWith(m[1]) });
  }
}

if (rules.length === 0) {
  console.log("✓ Redirect check: no redirect rules to verify.");
  process.exit(0);
}

const collisions = [];
for (const path of [...paths].sort()) {
  for (const rule of rules) {
    let hit;
    try {
      hit = rule.test(path);
    } catch {
      continue; // An unparseable pattern is Apache's problem, not ours.
    }
    if (hit) collisions.push({ path, rule });
  }
}

if (collisions.length > 0) {
  console.error(
    `\n✖ Redirect check failed: ${collisions.length} served file(s) would be redirected\n`,
  );
  for (const { path, rule } of collisions) {
    console.error(`  ${path}`);
    console.error(`    caught by ${rule.kind}: ${rule.line}`);
  }
  console.error("\nScope the rule so it cannot match a real asset.\n");
  process.exit(1);
}

console.log(
  `✓ Redirect check passed: ${rules.length} rule(s), none shadow any of the ${paths.size} served paths.`,
);
