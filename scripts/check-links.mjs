#!/usr/bin/env node
/**
 * PRD §12b gate: every internal link, anchor and image reference in
 * dist/ resolves. Run after `astro build`.
 *
 * Checks:
 *   - href="/path/" resolves to a built HTML file
 *   - href="#id" / href="/#id" resolves to an element with that id
 *   - src="..." resolves to a file on disk
 * External (http/mailto/tel) links are reported but not fetched.
 */
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, relative, dirname, resolve } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const DIST = join(ROOT, "dist");

if (!existsSync(DIST)) {
  console.error("✖ dist/ not found. Run `npm run build` first.");
  process.exit(1);
}

const htmlFiles = [];
function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full);
    else if (entry.endsWith(".html")) htmlFiles.push(full);
  }
}
walk(DIST);

/** id attributes present in each built page, for anchor resolution. */
const idsByPage = new Map();
for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  idsByPage.set(file, ids);
}

/** Map a site-absolute URL path to the HTML file that serves it. */
function pageForPath(urlPath) {
  const clean = urlPath.split("?")[0].replace(/\/$/, "");
  const candidates = [
    join(DIST, clean, "index.html"),
    join(DIST, `${clean}.html`),
    clean === "" ? join(DIST, "index.html") : null,
  ].filter(Boolean);
  return candidates.find((c) => existsSync(c)) ?? null;
}

const problems = [];
let checked = 0;

for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  const rel = relative(DIST, file);

  const refs = [
    ...[...html.matchAll(/\shref="([^"]+)"/g)].map((m) => ({ kind: "href", value: m[1] })),
    ...[...html.matchAll(/\ssrc="([^"]+)"/g)].map((m) => ({ kind: "src", value: m[1] })),
  ];

  for (const { kind, value } of refs) {
    if (/^(https?:|mailto:|tel:|data:|#$)/.test(value)) continue;
    checked++;

    // Same-page anchor
    if (value.startsWith("#")) {
      const id = value.slice(1);
      if (!idsByPage.get(file).has(id)) {
        problems.push(`${rel}: anchor ${value} has no matching id on the page`);
      }
      continue;
    }

    const [pathPart, hash] = value.split("#");

    if (kind === "src" || /\.[a-z0-9]{2,5}$/i.test(pathPart)) {
      // Asset reference: must exist on disk.
      const onDisk = pathPart.startsWith("/")
        ? join(DIST, pathPart)
        : resolve(dirname(file), pathPart);
      if (!existsSync(onDisk)) {
        problems.push(`${rel}: ${kind} "${value}" does not resolve to a file`);
      }
      continue;
    }

    // Internal page link
    const target = pageForPath(pathPart.startsWith("/") ? pathPart : `/${pathPart}`);
    if (!target) {
      problems.push(`${rel}: href "${value}" does not resolve to a built page`);
      continue;
    }
    if (hash && !idsByPage.get(target).has(hash)) {
      problems.push(`${rel}: href "${value}" targets a page without id="${hash}"`);
    }
  }
}

if (problems.length > 0) {
  console.error(`\n✖ Link check failed: ${problems.length} problem(s)\n`);
  for (const p of problems) console.error(`  ${p}`);
  console.error("");
  process.exit(1);
}

console.log(
  `✓ Link check passed: ${checked} internal reference(s) across ${htmlFiles.length} page(s).`,
);
