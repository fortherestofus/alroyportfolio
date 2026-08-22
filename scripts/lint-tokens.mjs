#!/usr/bin/env node
/**
 * PRD §12b gate: no hardcoded hex colors, font sizes or spacing
 * outside the token files. Everything must route through the
 * custom properties declared in src/styles/tokens.css.
 *
 * Scans src/** for:
 *   - hex literals (#abc / #aabbcc / #aabbccdd)
 *   - raw px values in CSS declarations
 *   - Tailwind arbitrary values (class="p-[13px]", text-[#fff])
 *
 * Exits non-zero on any violation.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const SRC = join(ROOT, "src");

/** Files allowed to declare raw values: the token definitions themselves. */
const ALLOWED_FILES = new Set([
  join("src", "styles", "tokens.css"),
  join("src", "styles", "fonts.css"),
]);

/**
 * The token layer. Inside it, a line that *defines* a custom property
 * may hold a raw value, because that is what defining a token means.
 * Everywhere else a raw value is a bypass, including a component that
 * invents its own `--local: 13px`.
 */
const TOKEN_LAYER = join("src", "styles");
const CUSTOM_PROPERTY_DECLARATION = /^\s*--[\w-]+\s*:/;

/**
 * Declarations where a raw px value is structural rather than a
 * design decision, so a token would add indirection without value.
 */
const PX_EXEMPT_PROPERTIES = [
  "border", // 1px hairlines, per the design system
  "border-top",
  "border-right",
  "border-bottom",
  "border-left",
  "border-block",
  "border-block-start",
  "border-block-end",
  "border-inline",
  "border-inline-start",
  "border-inline-end",
  "border-width",
  "outline",
  "outline-width",
  "outline-offset",
  "stroke-width",
  "box-shadow", // shadows are tokens; inline ones are caught by the hex rule
  "text-shadow",
  "backdrop-filter",
  "filter",
  "transform",
  "translate",
];

const HEX = /#[0-9a-fA-F]{3,8}\b/g;
const PX = /(-?\d*\.?\d+)px/g;
/**
 * Tailwind arbitrary values are always a utility prefix followed by
 * brackets (`p-[13px]`, `text-[#fff]`). Matching on the prefix keeps
 * ordinary JS arrays in `class:list={[...]}` from tripping the rule.
 */
const ARBITRARY = /(?:^|[\s"'`])-?[a-z][a-z0-9]*(?:-[a-z0-9]+)*-\[[^\]\s]+\]/g;
/**
 * Only the Regular (400) and Mittel (500) cuts ship. A literal weight
 * anywhere else means either a faux-bold render or a request for a
 * font file that does not exist, so weights must come from
 * --weight-body / --weight-heading.
 */
const RAW_FONT_WEIGHT = /font-weight\s*:\s*(?!var\()([a-z0-9]+)/g;

const violations = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full);
    } else if (/\.(astro|css|ts|tsx|js|mjs)$/.test(entry)) {
      check(full);
    }
  }
}

function check(file) {
  const rel = relative(ROOT, file);
  if (ALLOWED_FILES.has(rel)) return;

  const source = readFileSync(file, "utf8");
  const lines = source.split("\n");

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmed = line.trim();

    // Skip comments; they legitimately quote token values for reference.
    if (trimmed.startsWith("*") || trimmed.startsWith("//") || trimmed.startsWith("/*")) return;

    /**
     * Media query conditions are the one place a raw length is
     * unavoidable: CSS does not resolve var() inside a query
     * condition. Breakpoints are still declared once, as
     * --breakpoint-* in the @theme block.
     */
    /*
     * A matchMedia() query is the JavaScript twin of a media condition
     * and has the same constraint: it is a string parsed by the browser,
     * so var() cannot appear in it. Same exemption, same reason.
     */
    const inMediaCondition = /^@(media|container)\b/.test(trimmed) || /matchMedia\(/.test(trimmed);

    const isTokenDefinition = rel.startsWith(TOKEN_LAYER) && CUSTOM_PROPERTY_DECLARATION.test(line);
    if (isTokenDefinition) return;

    /*
     * The theme-color meta is the one HTML attribute that must carry a
     * literal color: it is read by the browser chrome before any CSS
     * loads, and var() does not resolve in attribute values. It mirrors
     * --color-bg in tokens.css.
     */
    if (/name="theme-color"/.test(line)) return;

    for (const match of line.matchAll(HEX)) {
      violations.push({ rel, lineNumber, value: match[0], rule: "hardcoded hex color" });
    }

    const property = trimmed.split(":")[0].trim().toLowerCase();
    if (!inMediaCondition && !PX_EXEMPT_PROPERTIES.includes(property)) {
      for (const match of line.matchAll(PX)) {
        violations.push({ rel, lineNumber, value: match[0], rule: "raw px value" });
      }
    }

    for (const match of line.matchAll(ARBITRARY)) {
      violations.push({
        rel,
        lineNumber,
        value: match[0].slice(0, 60),
        rule: "Tailwind arbitrary value",
      });
    }

    for (const match of line.matchAll(RAW_FONT_WEIGHT)) {
      violations.push({
        rel,
        lineNumber,
        value: match[0],
        rule: "raw font-weight (use --weight-body / --weight-heading)",
      });
    }
  });
}

walk(SRC);

/**
 * Every var(--x) must resolve to a custom property declared somewhere.
 * A reference to a token that does not exist is not an error in CSS:
 * the declaration is simply thrown away at computed-value time, so a
 * renamed token leaves an element silently unstyled and nothing
 * complains. That is exactly how `--color-ink-surface` survived the
 * dark-mode rename and left a label with no background on it.
 *
 * Declarations are collected from anywhere in src/, not just the token
 * layer, because components legitimately define their own locals and
 * pass them in through inline styles (`--bar`, `--card-index`).
 */
const DECLARATION = /(--[\w-]+)\s*:/g;
const USAGE = /var\(\s*(--[\w-]+)/g;

const declared = new Set();
const used = new Map();

function collect(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      collect(full);
      continue;
    }
    if (!/\.(astro|css|ts|tsx|js|mjs)$/.test(entry)) continue;

    const source = readFileSync(full, "utf8");
    for (const match of source.matchAll(DECLARATION)) declared.add(match[1]);

    const rel = relative(ROOT, full);
    source.split("\n").forEach((line, index) => {
      for (const match of line.matchAll(USAGE)) {
        if (!used.has(match[1])) used.set(match[1], `${rel}:${index + 1}`);
      }
    });
  }
}

collect(SRC);

for (const [token, where] of used) {
  if (declared.has(token)) continue;
  const [rel, lineNumber] = where.split(/:(?=\d+$)/);
  violations.push({
    rel,
    lineNumber,
    value: `var(${token})`,
    rule: "undefined custom property (renamed or never declared)",
  });
}

/**
 * The built Lottie animations must contain only site colours.
 *
 * `npm run lottie` remaps them, but the source files stay in the repo
 * and a new illustration could be dropped into public/lottie by hand,
 * or the build step could be skipped. One off-palette fill among
 * hundreds is invisible on a 260px looping animation and completely
 * obvious to a parser, so the parser checks.
 */
const LOTTIE = join(ROOT, "public", "lottie");
const PALETTE = new Set([
  "f9f6f2", // --color-text
  "1a1a1a", // --color-surface
  "b07a4e", // --color-skin
  "8a5a37", // --color-skin-shade
  "90a842", // --color-accent
  "b5b325", // --color-accent-olive
  "f0b331", // --color-gold
  "c2a142", // --color-gold-mid
  "b58104", // --color-gold-deep
]);

const toHex = (channels) =>
  channels
    .slice(0, 3)
    .map((value) =>
      Math.round(value * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("");

function auditLottie() {
  let animations;
  try {
    animations = readdirSync(LOTTIE).filter((file) => file.endsWith(".json"));
  } catch {
    return; // Not built yet; the browser QA covers their presence.
  }

  for (const file of animations) {
    const offenders = new Set();
    const walk = (node) => {
      if (Array.isArray(node)) return node.forEach(walk);
      if (!node || typeof node !== "object") return;
      if ((node.ty === "fl" || node.ty === "st") && Array.isArray(node.c?.k)) {
        const [first] = node.c.k;
        if (typeof first === "number") {
          const hex = toHex(node.c.k);
          if (!PALETTE.has(hex)) offenders.add(hex);
        }
      }
      for (const key of Object.keys(node)) walk(node[key]);
    };
    walk(JSON.parse(readFileSync(join(LOTTIE, file), "utf8")));

    for (const hex of offenders) {
      violations.push({
        rel: join("public", "lottie", file),
        lineNumber: 1,
        value: `#${hex}`,
        rule: "off-palette Lottie colour (run `npm run lottie`)",
      });
    }
  }
}

auditLottie();

if (violations.length > 0) {
  console.error(`\n✖ Token lint failed: ${violations.length} violation(s)\n`);
  for (const v of violations) {
    console.error(`  ${v.rel}:${v.lineNumber}  ${v.rule} → ${v.value}`);
  }
  process.exit(1);
}

console.log("✓ Token lint passed: no hardcoded colors, sizes or arbitrary values.");
