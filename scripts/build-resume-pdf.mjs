#!/usr/bin/env node
/**
 * Render the two résumé routes to PDF.
 *
 *   dist/resume/ats/     → public/alroy-ndhlovu-resume.pdf
 *   dist/resume/visual/  → public/alroy-ndhlovu-resume-visual.pdf
 *
 * Printed through Chromium rather than screenshotted, and that is the
 * whole point of the exercise. The résumé this replaced was a single
 * 595 × 6520pt page made of four JPEGs: an applicant tracking system
 * extracted seven lines from it and no name, job title, date or skill,
 * and it failed silently, which is the worst way for a résumé to fail.
 * A printed DOM carries real text, real hyperlinks and a structure
 * tree, so the parser gets the document and not a picture of it.
 *
 * Output lands in public/, not dist/: the PDFs are committed source
 * assets from that point on, served at the paths SITE.resume and
 * SITE.resumeVisual already point at. That avoids the circular build
 * where dist has to exist to make a file that dist is supposed to
 * contain — the next `npm run build` copies them through.
 *
 * Usage: npm run resume
 */
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, writeFile, stat } from "node:fs/promises";
import { join, extname } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const DIST = join(ROOT, "dist");
const PUBLIC = join(ROOT, "public");

const MIME = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".woff2": "font/woff2",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".txt": "text/plain",
  ".pdf": "application/pdf",
};

/**
 * `preferCSSPageSize` hands page geometry to the @page rule in each
 * document, which is the only way the two can differ: the ATS sheet
 * prints at A4 with 16mm margins, and the visual one at A4 with none,
 * so its black reaches the edge of the paper.
 */
const DOCUMENTS = [
  {
    route: "/resume/ats/",
    file: "alroy-ndhlovu-resume.pdf",
    label: "ATS résumé",
  },
  {
    route: "/resume/visual/",
    file: "alroy-ndhlovu-resume-visual.pdf",
    label: "Visual résumé",
  },
  /*
   * The LinkedIn document ad. Same pipeline, different geometry: its
   * @page rule asks for 960 × 540pt, which is the 16:9 sheet LinkedIn's
   * document format takes, and `preferCSSPageSize` is what lets one
   * script print A4 and 16:9 without knowing about either.
   */
  {
    route: "/linkedin/",
    file: "alroy-ndhlovu-linkedin.pdf",
    label: "LinkedIn document ad",
  },
];

function serve() {
  const server = createServer(async (request, response) => {
    try {
      const path = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
      let file = join(DIST, path);
      const found = await stat(file).catch(() => null);
      if (found?.isDirectory()) file = join(file, "index.html");
      const body = await readFile(file);
      response.writeHead(200, {
        "content-type": MIME[extname(file)] ?? "application/octet-stream",
      });
      response.end(body);
    } catch {
      response.writeHead(404).end("not found");
    }
  });

  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve({ server, port: server.address().port }));
  });
}

/**
 * Wait until there is nothing left that could still change the layout.
 *
 * A headless print is a single shot with no chance to repaint, so a
 * font or an image that arrives a frame late is not merely late — it is
 * absent from the file, and every line it would have sized has already
 * been laid out against the fallback. `networkidle` alone does not
 * cover it: decoding finishes after the response does.
 */
async function settle(page) {
  await page.evaluate(async () => {
    /*
     * Force every image eager before waiting on any of them.
     *
     * Astro's <Image> emits loading="lazy", which is right on the site
     * and fatal here: a print document is one continuous page that is
     * never scrolled, so nothing below the first viewport ever enters
     * view, the loads never fire, and a wait on them never returns.
     * The templates ask for eager too — this is the belt to that
     * braces, and it also covers any image Astro adds in future.
     */
    const images = Array.from(document.images);
    for (const image of images) {
      image.loading = "eager";
      image.decoding = "sync";
    }

    const loaded = Promise.all(
      images.map((image) =>
        image.complete
          ? null
          : new Promise((resolve) => {
              image.addEventListener("load", resolve, { once: true });
              image.addEventListener("error", resolve, { once: true });
            }),
      ),
    );

    /*
     * Never wait forever. If something cannot load, the broken-image
     * check below should be the one to say so — a build that hangs
     * tells you nothing about which file is at fault.
     */
    const LOAD_TIMEOUT_MS = 30_000;
    await Promise.race([
      Promise.all([loaded, document.fonts.ready]),
      new Promise((resolve) => setTimeout(resolve, LOAD_TIMEOUT_MS)),
    ]);
  });

  const broken = await page.evaluate(() =>
    Array.from(document.images)
      .filter((image) => !image.complete || image.naturalWidth === 0)
      .map((image) => image.currentSrc || image.src),
  );

  if (broken.length > 0) {
    throw new Error(`images failed to load:\n  ${broken.join("\n  ")}`);
  }
}

const { server, port } = await serve();
const browser = await chromium.launch();

try {
  for (const document of DOCUMENTS) {
    const page = await browser.newPage();
    const failures = [];
    page.on("pageerror", (error) => failures.push(String(error)));
    page.on("console", (message) => {
      if (message.type() === "error") failures.push(message.text());
    });

    const url = `http://127.0.0.1:${port}${document.route}`;
    const response = await page.goto(url, { waitUntil: "networkidle" });
    if (!response?.ok()) {
      throw new Error(
        `${document.route} returned ${response?.status()} — run \`npm run build\` first.`,
      );
    }

    /*
     * Print media before settling, not after: @media print changes the
     * layout, and a decode finished against the screen layout can still
     * be re-laid-out underneath the print one.
     */
    await page.emulateMedia({ media: "print" });
    await settle(page);

    if (failures.length > 0) {
      throw new Error(`${document.route} logged errors:\n  ${failures.join("\n  ")}`);
    }

    const pdf = await page.pdf({
      preferCSSPageSize: true,
      printBackground: true,
      /*
       * A structure tree in the output. Costs nothing, and it is what
       * lets a screen reader — and the better parsers — read headings
       * as headings and lists as lists rather than as loose runs of
       * positioned text.
       */
      tagged: true,
      outline: true,
    });

    await writeFile(join(PUBLIC, document.file), pdf);
    await page.close();

    const kb = Math.round(pdf.byteLength / 1024);
    console.log(`✓ ${document.label.padEnd(16)} public/${document.file}  (${kb} KB)`);
  }
} finally {
  await browser.close();
  server.close();
}
