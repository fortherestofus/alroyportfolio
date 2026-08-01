#!/usr/bin/env node
/**
 * PRD §12b behavioural gates, run against the built site in a real
 * rendering browser.
 *
 * This exists because the interactive browser tools available during
 * development run their tab in the background, where Chrome suspends
 * the rendering loop: no requestAnimationFrame, and no scroll events.
 * Anything scroll-driven silently appears broken there, so scroll
 * behaviour has to be checked somewhere that actually paints.
 *
 * Serves dist/ on an ephemeral port, then checks:
 *   - zero console errors/warnings on load and while scrolling
 *   - the timeline nav tracks scroll in both directions
 *   - clicking a label lands on the right section
 *   - dragging the knob scrubs the page
 *   - the left column pins and releases without jumping
 *   - no horizontal overflow, and touch targets are big enough
 *   - reduced motion disables smooth scroll and drag scrubbing
 *
 * Usage: npm run qa:browser
 */
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const DIST = join(ROOT, "dist");

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
  ".svg": "image/svg+xml",
  ".xml": "application/xml",
  ".txt": "text/plain",
  ".pdf": "application/pdf",
};

/** Desktop widths from §12b, plus a deliberately short viewport. */
const DESKTOP_VIEWPORTS = [
  { width: 1280, height: 800, label: "1280x800" },
  { width: 1440, height: 900, label: "1440x900" },
  { width: 1920, height: 1080, label: "1920x1080" },
  { width: 1440, height: 700, label: "1440x700 (short)" },
];

const MOBILE_VIEWPORTS = [
  { width: 375, height: 812, label: "375x812" },
  { width: 768, height: 1024, label: "768x1024" },
];

const SECTION_IDS = ["who", "experience", "education", "portfolio", "case-studies", "contact"];

const results = [];
const record = (name, passed, detail = "") => results.push({ name, passed, detail });

/* ---------------------------------------------------------------- */

function serveDist() {
  const server = createServer(async (req, res) => {
    try {
      const urlPath = decodeURIComponent((req.url ?? "/").split("?")[0]);
      let filePath = join(DIST, urlPath);

      const info = await stat(filePath).catch(() => null);
      if (!info || info.isDirectory()) filePath = join(filePath, "index.html");

      const body = await readFile(filePath);
      res.writeHead(200, {
        "Content-Type": MIME[extname(filePath)] ?? "application/octet-stream",
        // Never let a stale bundle mask a fix.
        "Cache-Control": "no-store",
      });
      res.end(body);
    } catch {
      res.writeHead(404).end("Not found");
    }
  });

  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({ server, origin: `http://127.0.0.1:${port}` });
    });
  });
}

/** Collect console errors/warnings and page exceptions for one page. */
function watchConsole(page) {
  const problems = [];
  page.on("console", (msg) => {
    if (msg.type() === "error" || msg.type() === "warning") {
      problems.push(`${msg.type()}: ${msg.text()}`);
    }
  });
  page.on("pageerror", (error) => problems.push(`pageerror: ${error.message}`));
  return problems;
}

/* ---------------------------------------------------------------- */

async function checkDesktop(browser, origin, viewport) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const problems = watchConsole(page);

  await page.goto(`${origin}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);

  const tag = viewport.label;

  // --- The environment itself: these must be true or nothing else means anything.
  const alive = await page.evaluate(
    () =>
      new Promise((resolve) => {
        let frames = 0;
        const tick = () => {
          frames++;
          if (frames < 3) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        setTimeout(() => resolve({ frames, visibility: document.visibilityState }), 300);
      }),
  );
  record(
    `[${tag}] browser is actually rendering`,
    alive.frames >= 3,
    `frames=${alive.frames} visibility=${alive.visibility}`,
  );

  // --- Smooth scroll is active (Lenis survived its watchdog).
  const lenisOn = await page.evaluate(() => document.documentElement.classList.contains("lenis"));
  record(`[${tag}] Lenis smooth scroll active`, lenisOn);

  // --- Nav tracks scroll, downward then upward.
  const trackDown = await page.evaluate(async (ids) => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const nav = document.getElementById("journey-nav");
    const knob = document.getElementById("journey-knob");
    const out = [];
    for (const id of ids) {
      const section = document.getElementById(id);
      const top = section.getBoundingClientRect().top + window.scrollY - nav.offsetHeight;
      window.scrollTo({ top: top + 4, behavior: "instant" });
      await wait(260);
      const active = document.querySelector('[aria-current="true"]');
      out.push({
        id,
        active: active?.getAttribute("href"),
        knob: parseFloat(knob.style.left) || 0,
      });
    }
    return out;
  }, SECTION_IDS);

  const downOk = trackDown.every((r) => r.active === `#${r.id}`);
  record(
    `[${tag}] nav active state follows scroll (down)`,
    downOk,
    downOk ? "" : JSON.stringify(trackDown),
  );

  const knobAscends = trackDown.every((r, i) => i === 0 || r.knob >= trackDown[i - 1].knob);
  record(
    `[${tag}] knob advances monotonically`,
    knobAscends,
    trackDown.map((r) => r.knob.toFixed(1)).join(" → "),
  );

  const trackUp = await page.evaluate(async (ids) => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const nav = document.getElementById("journey-nav");
    const out = [];
    for (const id of [...ids].reverse()) {
      const section = document.getElementById(id);
      const top = section.getBoundingClientRect().top + window.scrollY - nav.offsetHeight;
      window.scrollTo({ top: top + 4, behavior: "instant" });
      await wait(260);
      out.push({
        id,
        active: document.querySelector('[aria-current="true"]')?.getAttribute("href"),
      });
    }
    return out;
  }, SECTION_IDS);

  const upOk = trackUp.every((r) => r.active === `#${r.id}`);
  record(
    `[${tag}] nav active state follows scroll (up)`,
    upOk,
    upOk ? "" : JSON.stringify(trackUp),
  );

  // --- Clicking a label lands on that section.
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(300);

  const clickTargets = ["portfolio", "experience", "contact"];
  for (const id of clickTargets) {
    await page.click(`[data-nav-link][href="#${id}"]`);
    await page.waitForTimeout(2200);
    const delta = await page.evaluate((sectionId) => {
      const nav = document.getElementById("journey-nav");
      const section = document.getElementById(sectionId);
      return Math.round(section.getBoundingClientRect().top - nav.offsetHeight);
    }, id);
    record(`[${tag}] click "${id}" lands on section`, Math.abs(delta) <= 8, `off by ${delta}px`);
  }

  // --- Dragging the knob scrubs the page.
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(400);

  const knobBox = await page.locator("#journey-knob").boundingBox();
  const trackBox = await page.locator("#journey-track").boundingBox();
  if (knobBox && trackBox) {
    const before = await page.evaluate(() => window.scrollY);
    await page.mouse.move(knobBox.x + knobBox.width / 2, knobBox.y + knobBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(trackBox.x + trackBox.width * 0.55, knobBox.y + knobBox.height / 2, {
      steps: 18,
    });
    await page.waitForTimeout(220);
    const during = await page.evaluate(() => window.scrollY);
    await page.mouse.up();
    await page.waitForTimeout(320);

    record(
      `[${tag}] dragging the knob scrubs the page`,
      during > before + 500,
      `scrollY ${Math.round(before)} → ${Math.round(during)}`,
    );

    const knobFollowed = await page.evaluate(() => {
      const knob = document.getElementById("journey-knob");
      const trackEl = document.getElementById("journey-track");
      // The handle is placed in pixels along the wire, so compare it to
      // the track width rather than reading a percentage.
      return (
        ((parseFloat(knob.style.left) || 0) / (trackEl.getBoundingClientRect().width || 1)) * 100
      );
    });
    record(
      `[${tag}] knob sits mid-track after drag`,
      knobFollowed > 35 && knobFollowed < 75,
      `${knobFollowed.toFixed(1)}% along the track`,
    );
  } else {
    record(`[${tag}] dragging the knob scrubs the page`, false, "knob or track not visible");
  }

  // --- The wire bends toward the handle rather than staying straight.
  const sag = await page.evaluate(async () => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const knob = document.getElementById("journey-knob");
    const base = document.getElementById("journey-wire-base");
    const nav = document.getElementById("journey-nav");

    const read = () => ({ top: parseFloat(knob.style.top) || 0, d: base.getAttribute("d") });

    window.scrollTo({ top: 0, behavior: "instant" });
    await wait(700);
    const atStart = read();

    const middle = document.getElementById("portfolio");
    window.scrollTo({
      top: middle.getBoundingClientRect().top + window.scrollY - nav.offsetHeight,
      behavior: "instant",
    });
    await wait(900);
    const atMiddle = read();

    return { atStart, atMiddle };
  });

  record(
    `[${tag}] wire sags toward the handle mid-track`,
    sag.atMiddle.top > sag.atStart.top + 4,
    `handle y ${sag.atStart.top.toFixed(1)} at the start → ${sag.atMiddle.top.toFixed(1)} mid-track`,
  );
  record(
    `[${tag}] wire path redraws as the handle moves`,
    Boolean(sag.atStart.d) && sag.atStart.d !== sag.atMiddle.d,
  );

  /*
   * Pinning. The left column is expected to do three things in order:
   * scroll in, hold at its sticky offset for a stretch, then release
   * and scroll away with the end of its section. So this does not
   * assert the column never moves; it asserts that a genuine pinned
   * stretch exists, that the hold is exact while it lasts, and that
   * nothing anywhere moves discontinuously (that is what a jump or a
   * flicker would look like).
   */
  const STEP = 100;
  const pinning = await page.evaluate(async (step) => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const section = document.getElementById("experience");
    const aside = section.querySelector("[data-section-aside]");
    const nav = document.getElementById("journey-nav");
    const stickyTop = parseFloat(getComputedStyle(aside).top);
    const base = section.getBoundingClientRect().top + window.scrollY - nav.offsetHeight;
    const span = Math.round(section.getBoundingClientRect().height);

    const samples = [];
    for (let offset = -step; offset <= span; offset += step) {
      window.scrollTo({ top: Math.max(0, base + offset), behavior: "instant" });
      await wait(110);
      samples.push({ offset, top: Math.round(aside.getBoundingClientRect().top) });
    }
    return { samples, stickyTop, navHeight: nav.offsetHeight };
  }, STEP);

  const pinnedSamples = pinning.samples.filter((s) => Math.abs(s.top - pinning.stickyTop) <= 2);
  record(
    `[${tag}] left column actually pins`,
    pinnedSamples.length >= 3,
    `${pinnedSamples.length} sample(s) held at ${pinning.stickyTop}px`,
  );

  // Between consecutive samples the column may hold still or move by at
  // most the distance scrolled. Anything more is a jump.
  const jumps = pinning.samples
    .slice(1)
    .map((s, i) => ({ from: pinning.samples[i], to: s, delta: pinning.samples[i].top - s.top }))
    .filter((d) => d.delta < -2 || d.delta > STEP + 2);
  record(
    `[${tag}] pin engages and releases without jumping`,
    jumps.length === 0,
    jumps.map((j) => `${j.from.offset}→${j.to.offset}: moved ${j.delta}px`).join(", "),
  );

  // --- Layout hygiene.
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  record(`[${tag}] no horizontal overflow`, !overflow);

  record(`[${tag}] no console errors or warnings`, problems.length === 0, problems.join(" | "));

  await context.close();
}

async function checkMobile(browser, origin, viewport) {
  const context = await browser.newContext({
    viewport,
    hasTouch: true,
    isMobile: viewport.width < 500,
  });
  const page = await context.newPage();
  const problems = watchConsole(page);

  await page.goto(`${origin}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);

  const tag = viewport.label;

  const layout = await page.evaluate(() => {
    const grid = document.querySelector(".jsection__grid");
    const track = document.getElementById("journey-track");
    const list = document.getElementById("journey-list");
    return {
      columns: getComputedStyle(grid).gridTemplateColumns.split(" ").length,
      trackHidden: getComputedStyle(track).display === "none",
      // Every pill must be reachable: either they all fit, or the bar
      // scrolls. What must never happen is pills clipped out of reach.
      pillsReachable:
        list.scrollWidth <= list.clientWidth + 1 ||
        ["auto", "scroll"].includes(getComputedStyle(list).overflowX),
      pillsOverflow: list.scrollWidth > list.clientWidth + 1,
      overflow: document.documentElement.scrollWidth > window.innerWidth,
      minTouch: Math.min(
        ...[...document.querySelectorAll("[data-nav-link]")].map(
          (el) => el.getBoundingClientRect().height,
        ),
      ),
    };
  });

  record(`[${tag}] columns stack`, layout.columns === 1, `${layout.columns} column(s)`);
  record(`[${tag}] timeline track hidden`, layout.trackHidden);
  record(
    `[${tag}] every nav pill is reachable`,
    layout.pillsReachable,
    layout.pillsOverflow ? "bar overflows and scrolls" : "all pills fit",
  );
  record(`[${tag}] no horizontal overflow`, !layout.overflow);
  record(`[${tag}] nav touch targets >= 44px`, layout.minTouch >= 44, `${layout.minTouch}px`);
  record(`[${tag}] no console errors or warnings`, problems.length === 0, problems.join(" | "));

  await context.close();
}

async function checkReducedMotion(browser, origin) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const problems = watchConsole(page);

  await page.goto(`${origin}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);

  const lenisOff = await page.evaluate(() => !document.documentElement.classList.contains("lenis"));
  record("[reduced-motion] Lenis not initialised", lenisOff);

  // Content must be visible, not stuck in its pre-reveal hidden state.
  const visible = await page.evaluate(() => {
    const items = [...document.querySelectorAll("[data-reveal-item]")];
    return items.every((el) => parseFloat(getComputedStyle(el).opacity) > 0.9);
  });
  record("[reduced-motion] revealed content is visible", visible);

  // Drag must be inert; the labels remain the way to move.
  const knobBox = await page.locator("#journey-knob").boundingBox();
  const trackBox = await page.locator("#journey-track").boundingBox();
  const before = await page.evaluate(() => window.scrollY);
  await page.mouse.move(knobBox.x + knobBox.width / 2, knobBox.y + knobBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(trackBox.x + trackBox.width * 0.6, knobBox.y + knobBox.height / 2, {
    steps: 12,
  });
  await page.waitForTimeout(200);
  const during = await page.evaluate(() => window.scrollY);
  await page.mouse.up();

  record(
    "[reduced-motion] knob drag does not scrub",
    during === before,
    `scrollY ${before} → ${during}`,
  );

  // Clicking still navigates.
  await page.click('[data-nav-link][href="#education"]');
  await page.waitForTimeout(900);
  const delta = await page.evaluate(() => {
    const nav = document.getElementById("journey-nav");
    return Math.round(
      document.getElementById("education").getBoundingClientRect().top - nav.offsetHeight,
    );
  });
  record(
    "[reduced-motion] clicking a label still jumps",
    Math.abs(delta) <= 8,
    `off by ${delta}px`,
  );

  record(
    "[reduced-motion] no console errors or warnings",
    problems.length === 0,
    problems.join(" | "),
  );

  await context.close();
}

/**
 * Loading in a background tab must not permanently cost the visitor
 * smooth scrolling: a hidden tab gets no frames by design, and the
 * watchdog has to tell that apart from a genuinely stalled loop.
 */
async function checkBackgroundTabLoad(browser, origin) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  /*
   * Playwright cannot genuinely background a page in headless Chromium,
   * so the condition is reproduced directly: report the document as
   * hidden and stop delivering frames, which is exactly what a
   * background tab looks like from the page's point of view. Without
   * the visibility guard the watchdog reads this as a stalled loop and
   * tears smooth scrolling down for good.
   */
  await page.addInitScript(() => {
    let hidden = true;
    Object.defineProperty(document, "hidden", { get: () => hidden, configurable: true });
    Object.defineProperty(document, "visibilityState", {
      get: () => (hidden ? "hidden" : "visible"),
      configurable: true,
    });

    const realRaf = window.requestAnimationFrame.bind(window);
    // Every requester is queued, not just the most recent one: dropping
    // all but the last would silently kill whichever loop asked first.
    const pending = [];

    /*
     * A hidden tab does not drop frame callbacks, it defers them and
     * runs them on becoming visible, which is what lets an animation
     * loop resume. Simply no-oping would permanently break the
     * reference libraries captured at startup and test a failure real
     * browsers never produce.
     */
    window.requestAnimationFrame = (callback) => {
      if (!hidden) return realRaf(callback);
      pending.push(callback);
      return 0;
    };

    window.__becomeVisible = () => {
      hidden = false;
      document.dispatchEvent(new Event("visibilitychange"));
      const queued = pending.splice(0, pending.length);
      for (const callback of queued) realRaf(callback);
    };
  });

  await page.goto(`${origin}/`, { waitUntil: "networkidle" });
  // Longer than the watchdog's own delay, so a naive one would have fired.
  await page.waitForTimeout(2000);

  const survivedHidden = await page.evaluate(() =>
    document.documentElement.classList.contains("lenis"),
  );
  record("[background tab] smooth scroll is not torn down while hidden", survivedHidden);

  await page.evaluate(() => window.__becomeVisible());
  await page.waitForTimeout(2000);

  const aliveAfter = await page.evaluate(() =>
    document.documentElement.classList.contains("lenis"),
  );
  record("[background tab] smooth scroll still active once visible", aliveAfter);

  const scrolls = await page.evaluate(async () => {
    const before = window.scrollY;
    window.scrollTo({ top: 1500, behavior: "instant" });
    await new Promise((r) => setTimeout(r, 500));
    return { before, after: window.scrollY };
  });
  record(
    "[background tab] page scrolls after being brought forward",
    scrolls.after > scrolls.before + 100,
    `scrollY ${Math.round(scrolls.before)} → ${Math.round(scrolls.after)}`,
  );

  await context.close();
}

async function checkNoScript(browser, origin) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    javaScriptEnabled: false,
  });
  const page = await context.newPage();
  await page.goto(`${origin}/`, { waitUntil: "load" });

  const contentVisible = await page.locator("h1").isVisible();
  const revealOpacity = await page
    .locator("[data-reveal-item]")
    .first()
    .evaluate((el) => getComputedStyle(el).opacity)
    .catch(() => "1");

  record("[no-js] heading is visible", contentVisible);
  record(
    "[no-js] reveal content is not left hidden",
    parseFloat(revealOpacity) > 0.9,
    `opacity ${revealOpacity}`,
  );

  await context.close();
}

/* ---------------------------------------------------------------- */

const { server, origin } = await serveDist();
const browser = await chromium.launch();

try {
  for (const viewport of DESKTOP_VIEWPORTS) await checkDesktop(browser, origin, viewport);
  for (const viewport of MOBILE_VIEWPORTS) await checkMobile(browser, origin, viewport);
  await checkReducedMotion(browser, origin);
  await checkBackgroundTabLoad(browser, origin);
  await checkNoScript(browser, origin);
} finally {
  await browser.close();
  server.close();
}

const failed = results.filter((r) => !r.passed);

for (const result of results) {
  const mark = result.passed ? "✓" : "✖";
  const detail = result.detail ? `  ${result.detail}` : "";
  console.log(`${mark} ${result.name}${result.passed ? "" : detail}`);
}

console.log("");
if (failed.length > 0) {
  console.error(`✖ Browser QA failed: ${failed.length} of ${results.length} check(s)\n`);
  for (const f of failed) console.error(`  ${f.name}\n    ${f.detail}`);
  console.error("");
  process.exit(1);
}

console.log(`✓ Browser QA passed: ${results.length} checks.`);
