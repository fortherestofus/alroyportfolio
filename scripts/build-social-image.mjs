#!/usr/bin/env node
/**
 * Render the LinkedIn ad's cover slide to a PNG.
 *
 * Same pipeline as build-resume-pdf.mjs, and deliberately so: it serves
 * dist/, prints the page under `media: print` so the screen-only sheet
 * stack and drop shadow drop away, then screenshots the first .slide
 * element. What comes out is the PDF's page 1 exactly, rather than a
 * screenshot of a browser looking at it.
 *
 * deviceScaleFactor 2 gives 2560 x 1440 from a 1280 x 720 sheet, which
 * is well above anything LinkedIn will serve and leaves room to crop.
 *
 * Usage: node scripts/build-social-image.mjs <out.png> [route] [slideIndex]
 *
 * Route defaults to /linkedin/, where the slide index is 0-based: 0 is
 * the cover and 8 is "How I build". Any sheet can be lifted out this
 * way, which is what makes this worth keeping — a boosted post needs a
 * single image and LinkedIn will not take a PDF for one.
 *
 * /linkedin-social/ is the purpose-built feed card, and has one slide.
 */
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const DIST = join(ROOT, "dist");

const OUT = process.argv[2];
const ROUTE = process.argv[3] ?? "/linkedin/";
const INDEX = Number(process.argv[4] ?? 0);
if (!OUT) {
  console.error("usage: node scripts/build-social-image.mjs <out.png> [route] [slideIndex]");
  process.exit(1);
}

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
  ".txt": "text/plain",
};

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

const { server, port } = await serve();
const browser = await chromium.launch();

try {
  const page = await browser.newPage({
    viewport: { width: 1500, height: 1500 },
    deviceScaleFactor: 2,
  });

  const response = await page.goto(`http://127.0.0.1:${port}${ROUTE}`, {
    waitUntil: "networkidle",
  });
  if (!response?.ok()) {
    throw new Error(`${ROUTE} returned ${response?.status()} — run \`npm run build\` first.`);
  }

  // Print media first: the layout changes, and a decode finished against
  // the screen layout would be re-laid-out underneath the print one.
  await page.emulateMedia({ media: "print" });

  // Astro emits loading="lazy"; nothing below the fold would ever load.
  await page.evaluate(async () => {
    const images = Array.from(document.images);
    for (const image of images) {
      image.loading = "eager";
      image.decoding = "sync";
    }
    await Promise.all([
      Promise.all(
        images.map((image) =>
          image.complete
            ? null
            : new Promise((resolve) => {
                image.addEventListener("load", resolve, { once: true });
                image.addEventListener("error", resolve, { once: true });
              }),
        ),
      ),
      document.fonts.ready,
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

  const slide = page.locator(".slide, .card").nth(INDEX);
  await slide.screenshot({ path: OUT, type: "png" });

  const box = await slide.boundingBox();
  console.log(`✓ ${OUT}  (${ROUTE} slide ${INDEX + 1}, ${box.width * 2} x ${box.height * 2})`);
} finally {
  await browser.close();
  server.close();
}
