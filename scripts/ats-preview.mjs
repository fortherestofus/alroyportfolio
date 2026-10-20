#!/usr/bin/env node
/**
 * Print a résumé PDF exactly as a parser reads it.
 *
 * verify-resume-pdf.mjs answers "did everything survive?" with a pass
 * or a fail. This answers the other question, the one you want before
 * sending the file anywhere: what does the machine on the other end
 * actually see? It prints the extracted text per page, in the order the
 * content stream paints it, with nothing tidied up.
 *
 * Read it the way an ATS would. If a job title has a skills string
 * welded onto the end of it, that is a column doing what columns do. If
 * a section is missing, it is an image. If it reads like the document
 * you designed, it will parse like it too.
 *
 * Usage:
 *   npm run resume:preview            # the ATS résumé
 *   npm run resume:preview -- visual  # the portfolio one
 *   npm run resume:preview -- visual --keywords
 *
 * --keywords adds a frequency count of the terms that matter for the
 * roles being targeted, so a keyword pass can be checked rather than
 * guessed at.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { KEYWORD_TARGETS } from "../src/data/resume.ts";

const ROOT = new URL("..", import.meta.url).pathname;
const PUBLIC = join(ROOT, "public");

const FILES = {
  ats: "alroy-ndhlovu-resume.pdf",
  visual: "alroy-ndhlovu-resume-visual.pdf",
};

const args = process.argv.slice(2);
const which = args.find((arg) => !arg.startsWith("--")) ?? "ats";
const withKeywords = args.includes("--keywords");

const file = FILES[which];
if (!file) {
  console.error(`Unknown document "${which}". Use "ats" or "visual".`);
  process.exit(1);
}

const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
const data = new Uint8Array(await readFile(join(PUBLIC, file)));
const document = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;

const pages = [];
for (let number = 1; number <= document.numPages; number += 1) {
  const page = await document.getPage(number);
  const content = await page.getTextContent();
  pages.push(
    content.items
      .map((item) => (item.str ?? "") + (item.hasEOL ? "\n" : ""))
      .join("")
      .replace(/\n{3,}/g, "\n\n")
      .trim(),
  );
}

console.log(`\n${file} — ${pages.length} page(s), as a parser reads them\n`);

for (const [index, text] of pages.entries()) {
  console.log(
    `${"=".repeat(64)}\nPAGE ${index + 1}  (${text.length} characters)\n${"=".repeat(64)}`,
  );
  console.log(text || "[no extractable text on this page — it is an image]");
  console.log("");
}

if (withKeywords) {
  const haystack = pages.join("\n").toLowerCase();

  console.log(`${"=".repeat(64)}\nKEYWORD COVERAGE\n${"=".repeat(64)}`);

  for (const target of KEYWORD_TARGETS) {
    console.log(`\n${target.role}`);
    const missing = [];
    for (const term of target.terms) {
      const count = haystack.split(term.toLowerCase()).length - 1;
      if (count === 0) missing.push(term);
      else console.log(`  ${String(count).padStart(2)} x  ${term}`);
    }
    if (missing.length > 0) console.log(`   —  missing: ${missing.join(", ")}`);
  }

  console.log("");
}
