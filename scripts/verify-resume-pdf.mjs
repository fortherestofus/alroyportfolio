#!/usr/bin/env node
/**
 * Prove the ATS résumé actually parses, by parsing it.
 *
 * This is the gate the old résumé would have failed on day one. That
 * file looked finished and was unreadable to every applicant tracking
 * system it was ever sent to, and nothing said so — an ATS that cannot
 * extract a name does not report an error, it just records a candidate
 * with no name. So the check cannot be "does the PDF exist" or "does it
 * look right"; it has to re-open the file, pull the text out the way a
 * parser would, and fail the build when something is missing.
 *
 * What it asserts, for public/alroy-ndhlovu-resume.pdf:
 *   - the name, email, phone and city are on page 1, in the body
 *   - every standard section heading is present and spelled the way a
 *     parser matches on
 *   - every company and every date range from experience.ts extracts
 *   - page 1 clears a character floor — the tripwire for the font
 *     regression where glyphs are embedded as outlines and the page
 *     still looks perfect while extracting to nothing
 *   - page count and file size stay within budget
 *
 * The visual PDF is checked far more loosely. It is not meant to parse;
 * it only has to exist, be a plausible size, and not have lost its text
 * layer entirely.
 *
 * Usage: npm run resume (runs after build-resume-pdf.mjs), or directly.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { EXPERIENCE } from "../src/data/experience.ts";

const ROOT = new URL("..", import.meta.url).pathname;
const PUBLIC = join(ROOT, "public");

const ATS = "alroy-ndhlovu-resume.pdf";
const VISUAL = "alroy-ndhlovu-resume-visual.pdf";

/**
 * Section names an ATS matches on. These are the conventional spellings
 * for a reason: "Professional Experience" is in every parser's synonym
 * list and "Where I've Been" is in none of them.
 */
const REQUIRED_HEADINGS = [
  "PROFESSIONAL SUMMARY",
  "CORE COMPETENCIES",
  "PROFESSIONAL EXPERIENCE",
  "PRODUCTS BUILT",
  "EDUCATION",
  "TECHNICAL SKILLS",
];

const REQUIRED_ON_PAGE_ONE = [
  "Alroy Ndhlovu",
  "hello@alroyndhlovu.com",
  "+27 76 267 8936",
  "Johannesburg",
  "alroyndhlovu.com",
  "linkedin.com/in/alroyndhlovu",
];

/**
 * Below this, page 1 is a picture. A text-based first page of a résumé
 * runs well over 2,000 characters; the old one yielded 213 across the
 * entire document.
 */
const MIN_PAGE_ONE_CHARS = 1500;
const MAX_ATS_PAGES = 4;
const MAX_ATS_BYTES = 1_000_000;
const MAX_VISUAL_BYTES = 12_000_000;

const failures = [];
const notes = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

/**
 * Pull the text out the way a parser does: per page, in the order the
 * content stream paints it, with runs joined on their own spacing
 * rather than glued together. `normalise` then flattens the whitespace
 * and the en dashes the data files use, so a check for "Jul 2025 - Mar
 * 2026" matches "Jul 2025 – Mar 2026" on the page.
 */
async function extract(file) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const data = new Uint8Array(await readFile(join(PUBLIC, file)));
  /*
   * Read the size now: pdf.js transfers the buffer to its worker, which
   * detaches it, and `data.byteLength` reads 0 from here afterwards.
   */
  const bytes = data.byteLength;
  const document = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;

  const pages = [];
  for (let number = 1; number <= document.numPages; number += 1) {
    const page = await document.getPage(number);
    const content = await page.getTextContent();
    pages.push(
      content.items
        .map((item) => (item.str ?? "") + (item.hasEOL ? "\n" : ""))
        .join("")
        .trim(),
    );
  }

  return { pages, text: pages.join("\n\n"), bytes };
}

const TYPOGRAPHIC_DASHES = new RegExp("[\\u2010-\\u2015\\u2212]", "g");
const NON_BREAKING_SPACE = new RegExp("\\u00a0", "g");

function normalise(text) {
  return text
    .replace(TYPOGRAPHIC_DASHES, "-")
    .replace(NON_BREAKING_SPACE, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ---------------------------------------------------------------- ATS

const ats = await extract(ATS).catch((error) => {
  failures.push(`${ATS} could not be opened: ${error.message}`);
  return null;
});

if (ats) {
  const flat = normalise(ats.text);
  const pageOne = normalise(ats.pages[0] ?? "");

  for (const needle of REQUIRED_ON_PAGE_ONE) {
    check(
      pageOne.includes(normalise(needle)),
      `${ATS}: "${needle}" is not extractable from page 1 — a parser would not find it.`,
    );
  }

  for (const heading of REQUIRED_HEADINGS) {
    check(flat.toUpperCase().includes(heading), `${ATS}: section heading "${heading}" is missing.`);
  }

  for (const role of EXPERIENCE) {
    check(flat.includes(normalise(role.company)), `${ATS}: company "${role.company}" is missing.`);
    check(
      flat.includes(normalise(role.dates)),
      `${ATS}: dates "${role.dates}" for ${role.company} are missing.`,
    );
  }

  check(
    pageOne.length >= MIN_PAGE_ONE_CHARS,
    `${ATS}: page 1 extracted only ${pageOne.length} characters (floor is ${MIN_PAGE_ONE_CHARS}). ` +
      `The page may look right and still be unreadable — check that the webfont is embedding a ` +
      `ToUnicode map, and fall back to a system font for this document if it is not.`,
  );

  check(
    ats.pages.length <= MAX_ATS_PAGES,
    `${ATS}: ${ats.pages.length} pages, budget is ${MAX_ATS_PAGES}.`,
  );

  check(
    ats.bytes <= MAX_ATS_BYTES,
    `${ATS}: ${Math.round(ats.bytes / 1024)} KB, budget is ${Math.round(MAX_ATS_BYTES / 1024)} KB.`,
  );

  notes.push(
    `${ATS}: ${ats.pages.length} pages, ${Math.round(ats.bytes / 1024)} KB, ` +
      `${flat.length} extractable characters (${pageOne.length} on page 1).`,
  );
}

// ------------------------------------------------------------- VISUAL

const visual = await extract(VISUAL).catch((error) => {
  failures.push(`${VISUAL} could not be opened: ${error.message}`);
  return null;
});

if (visual) {
  const flat = normalise(visual.text);

  check(flat.includes("Alroy Ndhlovu"), `${VISUAL}: the name is not extractable.`);
  check(
    flat.includes("hello@alroyndhlovu.com"),
    `${VISUAL}: the contact email is not extractable.`,
  );
  check(
    visual.bytes <= MAX_VISUAL_BYTES,
    `${VISUAL}: ${Math.round(visual.bytes / 1024 / 1024)} MB, budget is ` +
      `${MAX_VISUAL_BYTES / 1_000_000} MB.`,
  );

  notes.push(
    `${VISUAL}: ${visual.pages.length} pages, ${Math.round(visual.bytes / 1024)} KB, ` +
      `${flat.length} extractable characters.`,
  );
}

// ------------------------------------------------------------- REPORT

for (const note of notes) console.log(`  ${note}`);

if (failures.length > 0) {
  console.error(`\n✗ Résumé PDF verification failed (${failures.length}):\n`);
  for (const failure of failures) console.error(`  - ${failure}`);
  console.error("");
  process.exit(1);
}

console.log("\n✓ Résumé PDFs verified: both parse, and the ATS one carries every field.\n");
