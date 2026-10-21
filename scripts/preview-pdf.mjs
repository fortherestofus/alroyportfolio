#!/usr/bin/env node
/**
 * Render pages of a résumé PDF to a PNG, so they can actually be looked at.
 *
 * This exists because of a specific mistake. The visual résumé was
 * given a 13mm page margin on the assumption that the root background
 * would paint it; Chromium does not, so every sheet printed with a
 * white frame around the artwork. Two separate checks of the file's
 * internals came back clean, because both were asking the wrong
 * question — "is there a full-sheet fill somewhere" rather than "what
 * does the page look like". Nothing caught it until Alroy opened it.
 *
 * ats-preview.mjs answers what a parser reads. verify-resume-pdf.mjs
 * answers whether the fields survived. This answers the third question,
 * the one neither of those can: what does it look like.
 *
 * Pages render through pdf.js in a real browser, which is the same
 * engine a reader's viewer uses, so what comes out is what they see.
 *
 * Usage:
 *   npm run resume:render                        # visual résumé, page 1
 *   npm run resume:render -- visual 1 2 3        # several pages
 *   npm run resume:render -- ats 1
 *
 * The PNG path is printed when it finishes.
 */
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname } from "node:path";

const ROOT = process.cwd();
const MIME = {
  ".mjs": "text/javascript",
  ".js": "text/javascript",
  ".pdf": "application/pdf",
  ".html": "text/html",
  ".map": "application/json",
};

const server = createServer(async (req, res) => {
  try {
    const p = join(ROOT, decodeURIComponent(new URL(req.url, "http://x").pathname));
    const st = await stat(p);
    const body = await readFile(st.isDirectory() ? join(p, "index.html") : p);
    res.writeHead(200, { "content-type": MIME[extname(p)] ?? "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404).end("nope");
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const port = server.address().port;

const FILES = {
  ats: "alroy-ndhlovu-resume.pdf",
  visual: "alroy-ndhlovu-resume-visual.pdf",
};

const args = process.argv.slice(2);
const which = args.find((a) => Number.isNaN(Number(a))) ?? "visual";
const pdf = FILES[which] ?? which;
const wanted = args.filter((a) => !Number.isNaN(Number(a))).map(Number);
if (wanted.length === 0) wanted.push(1);

const OUT = join(ROOT, ".resume-pages.png");

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "domcontentloaded" }).catch(() => {});
await page.setContent(`<body style="margin:0;background:#888"><div id="out"></div></body>`);

await page.evaluate(
  async ({ port, pdf, wanted }) => {
    const pdfjs = await import(`http://127.0.0.1:${port}/node_modules/pdfjs-dist/build/pdf.mjs`);
    pdfjs.GlobalWorkerOptions.workerSrc = `http://127.0.0.1:${port}/node_modules/pdfjs-dist/build/pdf.worker.mjs`;
    const doc = await pdfjs.getDocument({ url: `http://127.0.0.1:${port}/public/${pdf}` }).promise;
    const out = document.getElementById("out");
    for (const n of wanted) {
      const p = await doc.getPage(n);
      const vp = p.getViewport({ scale: 1.1 });
      const c = document.createElement("canvas");
      c.width = vp.width;
      c.height = vp.height;
      c.style.cssText = "display:block;margin:12px auto;";
      out.appendChild(c);
      await p.render({ canvasContext: c.getContext("2d"), viewport: vp }).promise;
    }
  },
  { port, pdf, wanted },
);

await page.locator("#out").screenshot({ path: OUT });
console.log(`${pdf} page(s) ${wanted.join(", ")} -> ${OUT}`);
await browser.close();
server.close();
