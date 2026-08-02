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

const SECTION_IDS = [
  "who",
  "experience",
  "education",
  "portfolio",
  "products",
  "case-studies",
  "contact",
];

/**
 * What the data files should put on the page (PRD §12b "data logic").
 * These are deliberately hard numbers rather than a count of whatever
 * rendered: the point is to catch an entry silently dropping out. Update
 * them in the same commit as the data file that changes.
 */
const EXPECTED = {
  roles: 12, // src/data/experience.ts
  studyGroups: 4, // src/data/education.ts
  studyEntries: 10,
  services: 5, // src/data/services.ts
  testimonials: 3, // src/data/testimonials.ts
  clientLogos: 7, // CLIENT_LOGOS, rendered twice for the seamless marquee
  products: 4, // src/data/products.ts
  productShots: 18,
  caseStudyCards: 5, // CASE_STUDIES — Thrifty, Innovatr, Hakkan, ISIT, tapa
  upcomingStudies: 1, // UPCOMING_STUDIES — Lumiskin
  stripShots: 22, // strip entries across all studies, rendered twice for the marquee
};

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
        // Explicit, because without it Node falls back to chunked
        // encoding and the weight checks silently measure every asset
        // as zero bytes.
        "Content-Length": body.length,
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

/**
 * Origins whose console output is not ours to fix. The booking embed
 * runs a third-party application inside an iframe and warns about its
 * own font preloading; failing our build on that would mean either
 * dropping the embed or dropping the gate, and the gate is worth more
 * pointed only at code we wrote. Anything from our own origin, and any
 * page error at all, still fails.
 */
const THIRD_PARTY = [/\bapp\.cal\.com\b/, /\bcal\.com\b/];

const isThirdParty = (text) => THIRD_PARTY.some((pattern) => pattern.test(text));

/**
 * Wait until the document stops changing height.
 *
 * Anything that measures scroll position has to do this first. The
 * booking embed swaps a reserved box for a real iframe when it loads,
 * and the page is at its full height only after that settles — so a
 * check that reads scrollY, waits, and reads again can see the page
 * shrink underneath it and blame whatever it was testing. That is
 * exactly what made the reduced-motion drag test look like a failure
 * while the drag itself moved nothing.
 */
async function settleHeight(page, timeout = 8000) {
  const deadline = Date.now() + timeout;
  let previous = -1;
  let stable = 0;
  while (Date.now() < deadline) {
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    stable = height === previous ? stable + 1 : 0;
    previous = height;
    if (stable >= 3) return height;
    await page.waitForTimeout(150);
  }
  return previous;
}

/** Collect console errors/warnings and page exceptions for one page. */
function watchConsole(page) {
  const problems = [];
  page.on("console", (msg) => {
    if (msg.type() !== "error" && msg.type() !== "warning") return;
    const location = msg.location()?.url ?? "";
    if (isThirdParty(location) || isThirdParty(msg.text())) return;
    problems.push(`${msg.type()}: ${msg.text()}`);
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

  /*
   * Press the pendant, not the knob wrapper. The wrapper also contains
   * the "Drag to scrub" label, which is pointer-events: none, so its
   * centre sometimes lands on dead space and no drag begins — the test
   * was passing or failing depending on whether that label happened to
   * be showing. The pendant is what a hand actually grabs.
   */
  const knobBox = await page.locator(".jnav__knob-pendant").boundingBox();
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

  /*
   * The hero must not fill the viewport exactly.
   *
   * NN/g's "illusion of completeness" study found readers who did not
   * realise a page scrolled at all, because a full-screen hero ended
   * precisely at the fold and nothing hinted at more. A sparse dark
   * hero is the textbook case, so the next section has to be visibly
   * intruding before the reader touches anything.
   */
  const fold = await page.evaluate(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    const hero = document.querySelector(".hero");
    const next = document.querySelector(".jsection");
    if (!hero || !next) return null;
    return {
      heroBottom: Math.round(hero.getBoundingClientRect().bottom),
      viewport: window.innerHeight,
      peek: Math.round(window.innerHeight - next.getBoundingClientRect().top),
    };
  });
  if (fold) {
    record(
      `[${tag}] the next section peeks above the fold`,
      fold.peek >= 24,
      `${fold.peek}px of section 01 visible (hero ends at ${fold.heroBottom} of ${fold.viewport})`,
    );
  }

  // --- Data logic (§12b): the content actually rendered, not the source.
  const content = await page.evaluate(() => ({
    roles: document.querySelectorAll(".roles__row").length,
    studyGroups: document.querySelectorAll(".study__group").length,
    studyRows: document.querySelectorAll(".study__row").length,
    services: document.querySelectorAll("[data-service]").length,
    testimonials: document.querySelectorAll(".who__quote").length,
    products: document.querySelectorAll(".product").length,
    productShots: document.querySelectorAll(".product__shot").length,
    caseStudyCards: document.querySelectorAll(".stack__card").length,
    upcomingStudies: document.querySelectorAll(".stack__upcoming-item").length,
    stripShots: document.querySelectorAll(".stack__shot").length,
    /* Every overview card must reach the page it promises. */
    deadCaseLinks: [...document.querySelectorAll(".stack__cta")].filter(
      (a) => !a.getAttribute("href")?.startsWith("/case-studies/"),
    ).length,
    clientLogos: document.querySelectorAll(".strip__item").length,
    brokenImages: [...document.querySelectorAll("img")].filter(
      (img) => img.complete && img.naturalWidth === 0,
    ).length,
    emptyDates: [...document.querySelectorAll(".roles__dates, .study__dates")].filter(
      (el) => !el.textContent.trim(),
    ).length,
  }));

  const expect = (label, actual, wanted) =>
    record(`[${tag}] ${label}`, actual === wanted, `got ${actual}, expected ${wanted}`);

  expect(`${EXPECTED.roles} experience rows`, content.roles, EXPECTED.roles);
  expect(`${EXPECTED.studyGroups} education groups`, content.studyGroups, EXPECTED.studyGroups);
  expect(`${EXPECTED.studyEntries} education entries`, content.studyRows, EXPECTED.studyEntries);
  expect(`${EXPECTED.services} service pills`, content.services, EXPECTED.services);
  expect(`${EXPECTED.testimonials} testimonials`, content.testimonials, EXPECTED.testimonials);
  // The marquee renders the list twice so the loop has no seam.
  expect("client marquee is doubled", content.clientLogos, EXPECTED.clientLogos * 2);
  expect(`${EXPECTED.products} products`, content.products, EXPECTED.products);
  expect(`${EXPECTED.productShots} product shots`, content.productShots, EXPECTED.productShots);

  /*
   * Screenshots arrive at whatever size the device or window happened
   * to be, so a rail of them will only look deliberate if every frame
   * is the same size and every image fills the frame it is in. Flex
   * stretches the frames to match on its own, which is exactly what
   * hides the bug: the boxes line up while the images inside them stop
   * short, leaving a band of card behind. So this checks both.
   */
  const shotGaps = await page.evaluate(() => {
    const problems = [];
    const RAILS = [
      [".product__rail", ".product__shot"],
      [".stack__track", ".stack__shot"],
    ];
    const rails = RAILS.flatMap(([container, item]) =>
      [...document.querySelectorAll(container)].map((el) => [el, item]),
    );
    for (const [rail, itemSelector] of rails) {
      const name = rail.getAttribute("aria-label") ?? rail.className;
      const shots = [...rail.querySelectorAll(itemSelector)];
      if (shots.length === 0) continue;

      const boxes = shots.map((s) => s.getBoundingClientRect());
      const [first] = boxes;
      for (const [i, box] of boxes.entries()) {
        if (Math.abs(box.width - first.width) > 1 || Math.abs(box.height - first.height) > 1) {
          problems.push(
            `${name} #${i + 1} is ${Math.round(box.width)}×${Math.round(box.height)}, ` +
              `first is ${Math.round(first.width)}×${Math.round(first.height)}`,
          );
        }
      }

      for (const [i, shot] of shots.entries()) {
        const img = shot.querySelector("img");
        if (!img) continue;
        // clientHeight, not the bounding rect: the frame's hairline
        // border is outside the box the image is asked to fill.
        const short = shot.clientHeight - img.getBoundingClientRect().height;
        if (short > 1) {
          problems.push(`${name} #${i + 1} leaves a ${Math.round(short)}px gap under the image`);
        }
      }
    }
    return problems;
  });
  record(
    `[${tag}] product shots fill uniform frames`,
    shotGaps.length === 0,
    shotGaps.slice(0, 4).join("; "),
  );

  expect(
    `${EXPECTED.caseStudyCards} case study card(s)`,
    content.caseStudyCards,
    EXPECTED.caseStudyCards,
  );
  expect(
    `${EXPECTED.upcomingStudies} upcoming studies`,
    content.upcomingStudies,
    EXPECTED.upcomingStudies,
  );
  // The strip renders the list twice so the marquee loop has no seam.
  expect("case study strip is doubled", content.stripShots, EXPECTED.stripShots * 2);
  record(
    `[${tag}] every case study card links to its page`,
    content.deadCaseLinks === 0,
    `${content.deadCaseLinks} card(s) point elsewhere`,
  );

  /*
   * The peel only works if the cards are opaque. A translucent card
   * shows the one it is covering straight through, which reads as a
   * rendering fault rather than as depth.
   */
  const seeThrough = await page.evaluate(() =>
    [...document.querySelectorAll(".stack__card, .stack__upcoming")]
      .filter((el) => {
        const bg = getComputedStyle(el).backgroundColor;
        if (bg === "transparent") return true;
        /*
         * An element with no background computes to "rgba(0, 0, 0, 0)",
         * so the alpha has to be read properly. Splitting on the comma
         * leaves a trailing ")" that turns Number() into NaN, and every
         * comparison against NaN is false — which is how this check
         * passed against a panel that had no background at all.
         */
        const alpha = bg.match(/^rgba?\([^)]*?,\s*([\d.]+)\s*\)$/);
        return alpha !== null && Number(alpha[1]) < 1;
      })
      .map((el) => el.className),
  );
  record(`[${tag}] stacking panels are opaque`, seeThrough.length === 0, seeThrough.join(", "));

  /*
   * Every case study card's CTA must be clickable at the moment that
   * card is the topmost of the stack. A pinned card taller than the
   * space under its pin point hides its own button at every scroll
   * position — which happened at 1440x700 — so this is checked per
   * viewport rather than assumed from the layout.
   */
  const deadCtas = await page.evaluate(async () => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const cards = [...document.querySelectorAll(".stack__card")];
    const problems = [];
    for (let i = 0; i < cards.length; i++) {
      const cta = cards[i].querySelector(".stack__cta");
      if (!cta) continue;
      const next = cards[i + 1] ?? document.querySelector(".stack__upcoming");
      if (next) {
        // Scroll so this card is fully presented and the next has not covered it.
        const nextTop = next.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: Math.max(0, nextTop - window.innerHeight), behavior: "instant" });
      } else {
        cta.scrollIntoView({ block: "center", behavior: "instant" });
      }
      await wait(200);
      let box = cta.getBoundingClientRect();
      // Static regimes may need a nudge to bring the CTA into view.
      if (box.bottom > window.innerHeight || box.top < 0) {
        cta.scrollIntoView({ block: "center", behavior: "instant" });
        await wait(200);
        box = cta.getBoundingClientRect();
      }
      const visible = box.top >= 0 && box.bottom <= window.innerHeight;
      const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
      if (!visible || !hit || !(cta === hit || cta.contains(hit))) {
        problems.push(
          `card ${i} CTA ${visible ? "covered by " + (hit?.className || hit?.tagName || "nothing") : "outside the viewport"}`,
        );
      }
    }
    window.scrollTo({ top: 0, behavior: "instant" });
    return problems;
  });
  record(
    `[${tag}] every case study CTA is clickable when its card is on top`,
    deadCtas.length === 0,
    deadCtas.join("; "),
  );

  const missingStacks = await page.evaluate(() =>
    [...document.querySelectorAll(".product")]
      .filter((p) => p.querySelectorAll(".product__tech").length === 0)
      .map((p) => p.querySelector(".product__name")?.textContent?.trim() ?? "?"),
  );
  record(
    `[${tag}] every product lists its stack`,
    missingStacks.length === 0,
    missingStacks.join(", "),
  );
  record(`[${tag}] every date renders`, content.emptyDates === 0, `${content.emptyDates} empty`);
  record(`[${tag}] no broken images`, content.brokenImages === 0, `${content.brokenImages} broken`);

  /*
   * Every logo must actually be visible against the frame it sits in.
   * A white-on-transparent mark on a light frame renders as a blank
   * square: the image loads fine, so no other check notices. This
   * samples each rendered mark composited over its own frame colour and
   * fails when there is not enough contrast between the ink and the
   * backing.
   */
  const invisibleLogos = await page.evaluate(async () => {
    const frames = [...document.querySelectorAll(".frame")].filter((f) => f.querySelector("img"));
    const offenders = [];

    for (const frame of frames) {
      const img = frame.querySelector("img");
      if (!img.complete || img.naturalWidth === 0) continue;

      const backing = getComputedStyle(frame)
        .backgroundColor.match(/[\d.]+/g)
        .map(Number);
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = `rgb(${backing[0]},${backing[1]},${backing[2]})`;
      ctx.fillRect(0, 0, 32, 32);
      try {
        ctx.drawImage(img, 0, 0, 32, 32);
      } catch {
        continue;
      }

      const data = ctx.getImageData(0, 0, 32, 32).data;
      let min = 255;
      let max = 0;
      for (let i = 0; i < data.length; i += 4) {
        const lum = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
        min = Math.min(min, lum);
        max = Math.max(max, lum);
      }
      // A mark that reads has light and dark pixels. A blank square does not.
      if (max - min < 40) {
        offenders.push(`${img.currentSrc.split("/").pop()} (range ${Math.round(max - min)})`);
      }
    }
    return offenders;
  });

  record(
    `[${tag}] every logo is visible against its frame`,
    invisibleLogos.length === 0,
    invisibleLogos.join(", "),
  );

  // --- Service pills: hovering swaps the shared caption line.
  const pills = await page.evaluate(async () => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const caption = document.querySelector("[data-service-caption]");
    const all = [...document.querySelectorAll("[data-service]")];
    const first = caption.textContent.trim();
    all[2].dispatchEvent(new PointerEvent("pointerenter", { bubbles: true }));
    await wait(400);
    const third = caption.textContent.trim();
    return { first, third, pressed: all[2].getAttribute("aria-pressed") };
  });
  record(
    `[${tag}] service pill swaps the caption`,
    pills.first.length > 0 && pills.third.length > 0 && pills.first !== pills.third,
    `"${pills.first.slice(0, 28)}…" → "${pills.third.slice(0, 28)}…"`,
  );

  // --- Layout hygiene.
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  record(`[${tag}] no horizontal overflow`, !overflow);

  // Reveals must never strand content: after scrolling the whole page,
  // every item that was hidden pre-animation has to be showing.
  const stuck = await page.evaluate(async () => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const height = document.documentElement.scrollHeight;
    for (let y = 0; y <= height; y += window.innerHeight / 2) {
      window.scrollTo({ top: y, behavior: "instant" });
      await wait(90);
    }
    await wait(500);
    return [...document.querySelectorAll("[data-reveal-item]")].filter(
      (el) => parseFloat(getComputedStyle(el).opacity) < 0.9,
    ).length;
  });
  record(`[${tag}] no content stranded by reveals`, stuck === 0, `${stuck} item(s) still hidden`);

  record(`[${tag}] no console errors or warnings`, problems.length === 0, problems.join(" | "));

  await context.close();
}

/**
 * WCAG AA contrast across everything actually rendered (PRD §12).
 * Written against the real computed colours rather than the token
 * table, so a component that pairs two tokens badly is still caught.
 */
/**
 * The portfolio modal, against the §12b list: opens, traps focus, Esc
 * and scrim close, focus returns to the trigger, arrows and keyboard
 * both work, and background scroll locks.
 */
/**
 * Image weight, measured from real network traffic rather than from
 * what is sitting in dist/ (PRD §10, and Alroy's standing "light but
 * quality" bar).
 *
 * Two separate things matter and they fail differently:
 *   - what a first visit actually costs, which is a speed problem
 *   - whether any single asset shipped unoptimised, which is usually a
 *     file that slipped past astro:assets and is being served raw
 */
const IMAGE_BUDGET = {
  /** Everything fetched before any interaction, in KB. */
  initialLoadKb: 900,
  /** No single image should exceed this, in KB. */
  singleImageKb: 260,
};

async function checkImageWeight(browser, origin) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const images = [];
  page.on("response", async (response) => {
    const type = response.headers()["content-type"] ?? "";
    if (!type.startsWith("image/")) return;
    /*
     * Only our own assets. The booking embed serves its own avatars and
     * icons from Cal's CDN; those are neither in our weight budget nor
     * ours to convert, and counting them made this gate fail on an
     * account profile picture.
     */
    if (!response.url().startsWith(origin)) return;
    const length = Number(response.headers()["content-length"] ?? 0);
    images.push({
      url: response.url().split("/").pop(),
      kb: length / 1024,
      type: type.replace("image/", ""),
    });
  });

  await page.goto(`${origin}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);

  // Everything above and around the fold, before opening any gallery.
  await page.evaluate(async () => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const height = document.documentElement.scrollHeight;
    for (let y = 0; y <= height; y += window.innerHeight) {
      window.scrollTo({ top: y, behavior: "instant" });
      await wait(140);
    }
  });
  await page.waitForTimeout(900);

  const totalKb = images.reduce((sum, i) => sum + i.kb, 0);
  record(
    "[images] a full scroll stays inside the weight budget",
    totalKb <= IMAGE_BUDGET.initialLoadKb,
    `${Math.round(totalKb)}KB across ${images.length} images (budget ${IMAGE_BUDGET.initialLoadKb}KB)`,
  );

  /*
   * Open every gallery too. Slides are lazy, so without this the
   * per-image budget would only ever see the handful of images on the
   * page itself and quietly pass over the largest assets on the site.
   */
  const scrolledKb = totalKb;
  for (const id of ["uxui", "web", "branding", "content", "photography"]) {
    await page.locator(`[data-open-portfolio="${id}"]`).click();
    await page.waitForTimeout(400);
    const shots = await page.locator("[data-portfolio-next]").count();
    if (shots) {
      for (let i = 0; i < 6; i++) {
        const disabled = await page.locator("[data-portfolio-next]").isDisabled();
        if (disabled) break;
        await page.locator("[data-portfolio-next]").click();
        await page.waitForTimeout(350);
      }
    }
    await page.keyboard.press("Escape");
    await page.waitForTimeout(250);
  }

  const heavy = images.filter((i) => i.kb > IMAGE_BUDGET.singleImageKb);
  record(
    "[images] no single image is oversized",
    heavy.length === 0,
    heavy.map((i) => `${i.url} ${Math.round(i.kb)}KB`).join(", "),
  );
  record(
    "[images] gallery slides were actually measured",
    images.length > 20,
    `${images.length} images seen, ${Math.round(scrolledKb)}KB of them before opening a gallery`,
  );

  // Anything still served as PNG or JPEG has bypassed astro:assets.
  const unconverted = images.filter(
    (i) =>
      ["png", "jpeg", "jpg"].includes(i.type) &&
      !i.url.includes("favicon") &&
      !i.url.includes("apple-touch"),
  );
  record(
    "[images] everything is served as a modern format",
    unconverted.length === 0,
    unconverted.map((i) => `${i.url} (${i.type})`).join(", "),
  );

  await context.close();
}

async function checkPortfolioModal(browser, origin) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const problems = watchConsole(page);

  await page.goto(`${origin}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);

  const cards = await page.locator("[data-open-portfolio]").count();
  record("[modal] 5 category cards", cards === 5, `${cards}`);

  // Nothing in the gallery should be fetched before it is opened.
  const preOpen = await page.evaluate(
    () =>
      [...document.querySelectorAll("#portfolio-modal img")].filter(
        (img) => img.complete && img.naturalWidth > 0,
      ).length,
  );
  record("[modal] gallery images not loaded until opened", preOpen === 0, `${preOpen} preloaded`);

  await page.locator('[data-open-portfolio="branding"]').scrollIntoViewIfNeeded();
  await page.locator('[data-open-portfolio="branding"]').click();
  await page.waitForTimeout(500);

  const opened = await page.evaluate(() => {
    const modal = document.getElementById("portfolio-modal");
    const slides = [...modal.querySelectorAll("[data-portfolio-slide]")].filter((s) => !s.hidden);
    return {
      visible: !modal.hidden,
      title: modal.querySelector("[data-portfolio-title]").textContent.trim(),
      counter: modal.querySelector("[data-portfolio-counter]").textContent.trim(),
      visibleSlides: slides.length,
      dots: modal.querySelectorAll("[data-dot]").length,
      // Counting elements is not enough: these are built in JS, so a
      // scoping mismatch can leave them present but zero-sized.
      sizedDots: [...modal.querySelectorAll("[data-dot]")].filter((d) => {
        const r = d.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      }).length,
      // The caption has to sit inside the panel, not be pushed out by
      // an unconstrained image.
      // The image must actually occupy the stage. Constraining it to
      // fit is easy to get wrong in a way that renders nothing at all.
      mediaHeight: (() => {
        const img = slides[0]?.querySelector("img");
        return img ? Math.round(img.getBoundingClientRect().height) : 0;
      })(),
      captionInPanel: (() => {
        const slide = slides[0];
        const caption = slide?.querySelector(".pm__caption");
        const panelBox = modal.querySelector(".pm__panel").getBoundingClientRect();
        if (!caption) return false;
        const box = caption.getBoundingClientRect();
        return box.height > 0 && box.bottom <= panelBox.bottom + 1;
      })(),
      focusInside: modal.contains(document.activeElement),
      locked: document.documentElement.classList.contains("is-scroll-locked"),
    };
  });

  record("[modal] opens", opened.visible);
  record("[modal] shows the right category", opened.title === "Branding", opened.title);
  record(
    "[modal] exactly one slide visible",
    opened.visibleSlides === 1,
    `${opened.visibleSlides}`,
  );
  record("[modal] a dot per shot", opened.dots === 6, `${opened.dots}`);
  record("[modal] dots are actually visible", opened.sizedDots === 6, `${opened.sizedDots} sized`);
  record("[modal] caption stays inside the panel", opened.captionInPanel);
  record(
    "[modal] the shot actually fills the stage",
    opened.mediaHeight > 300,
    `image rendered ${opened.mediaHeight}px tall`,
  );
  record("[modal] counter reads correctly", opened.counter === "1 of 6", opened.counter);
  record("[modal] focus moves into the dialog", opened.focusInside);
  record("[modal] background scroll locks", opened.locked);

  // Background must not move while the modal is up. Baseline is taken
  // once the modal is already open, so opening the card's own
  // scroll-into-view is not mistaken for leakage.
  const scrollAtOpen = await page.evaluate(() => window.scrollY);
  await page.mouse.wheel(0, 800);
  await page.waitForTimeout(500);
  const scrollDuring = await page.evaluate(() => window.scrollY);
  record(
    "[modal] background does not scroll behind it",
    Math.abs(scrollDuring - scrollAtOpen) < 8,
    `scrollY moved ${Math.round(Math.abs(scrollDuring - scrollAtOpen))}px`,
  );

  // Arrow buttons.
  await page.locator("[data-portfolio-next]").click();
  await page.waitForTimeout(250);
  const afterNext = await page.evaluate(() =>
    document.querySelector("[data-portfolio-counter]").textContent.trim(),
  );
  record("[modal] next advances", afterNext === "2 of 6", afterNext);

  await page.locator("[data-portfolio-prev]").click();
  await page.waitForTimeout(250);
  const afterPrev = await page.evaluate(() =>
    document.querySelector("[data-portfolio-counter]").textContent.trim(),
  );
  record("[modal] previous goes back", afterPrev === "1 of 6", afterPrev);

  record(
    "[modal] previous is disabled on the first shot",
    await page.locator("[data-portfolio-prev]").isDisabled(),
  );

  // Keyboard arrows.
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(250);
  const afterKey = await page.evaluate(() =>
    document.querySelector("[data-portfolio-counter]").textContent.trim(),
  );
  record("[modal] arrow keys navigate", afterKey === "2 of 6", afterKey);

  // Focus trap: tabbing many times must never escape the dialog.
  let escaped = false;
  for (let i = 0; i < 14; i++) {
    await page.keyboard.press("Tab");
    const inside = await page.evaluate(() =>
      document.getElementById("portfolio-modal").contains(document.activeElement),
    );
    if (!inside) {
      escaped = true;
      break;
    }
  }
  record("[modal] focus stays trapped", !escaped);

  // Escape closes and hands focus back to the card that opened it.
  await page.keyboard.press("Escape");
  await page.waitForTimeout(350);
  const afterEsc = await page.evaluate(() => ({
    hidden: document.getElementById("portfolio-modal").hidden,
    focusedCategory: document.activeElement?.dataset?.openPortfolio ?? null,
    locked: document.documentElement.classList.contains("is-scroll-locked"),
  }));
  record("[modal] Escape closes", afterEsc.hidden);
  record(
    "[modal] focus returns to the trigger",
    afterEsc.focusedCategory === "branding",
    `focus on ${afterEsc.focusedCategory}`,
  );
  record("[modal] scroll unlocks on close", !afterEsc.locked);

  // Scrim closes too.
  await page.locator('[data-open-portfolio="uxui"]').click();
  await page.waitForTimeout(350);
  await page.locator(".pm__scrim").click({ position: { x: 5, y: 5 } });
  await page.waitForTimeout(350);
  record(
    "[modal] clicking the scrim closes",
    await page.evaluate(() => document.getElementById("portfolio-modal").hidden),
  );

  // A video slide should carry a poster and preload nothing.
  await page.locator('[data-open-portfolio="web"]').click();
  await page.waitForTimeout(500);
  const video = await page.evaluate(() => {
    const el = document.querySelector("[data-portfolio-group='web'] video");
    return el ? { preload: el.preload, hasPoster: Boolean(el.poster), muted: el.muted } : null;
  });
  record("[modal] video slides do not preload", video?.preload === "none", JSON.stringify(video));
  record("[modal] video slides have a poster", Boolean(video?.hasPoster));
  await page.keyboard.press("Escape");

  record("[modal] no console errors or warnings", problems.length === 0, problems.join(" | "));

  await context.close();
}

async function checkContrast(browser, origin) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(`${origin}/`, { waitUntil: "networkidle" });

  // Reveal everything, so hidden-then-faded text is measured too.
  await page.evaluate(async () => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const height = document.documentElement.scrollHeight;
    for (let y = 0; y <= height; y += window.innerHeight / 2) {
      window.scrollTo({ top: y, behavior: "instant" });
      await wait(80);
    }
    await wait(500);
  });

  const failures = await page.evaluate(() => {
    const parse = (value) => {
      const nums = value.match(/[\d.]+/g)?.map(Number) ?? [];
      return { r: nums[0] ?? 0, g: nums[1] ?? 0, b: nums[2] ?? 0, a: nums[3] ?? 1 };
    };

    const channel = (c) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    const luminance = ({ r, g, b }) =>
      0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);

    const over = (fg, bg) => ({
      r: fg.r * fg.a + bg.r * (1 - fg.a),
      g: fg.g * fg.a + bg.g * (1 - fg.a),
      b: fg.b * fg.a + bg.b * (1 - fg.a),
      a: 1,
    });

    /** Walk up for the first non-transparent background. */
    const backgroundOf = (el) => {
      let node = el;
      while (node && node !== document.documentElement) {
        const bg = parse(getComputedStyle(node).backgroundColor);
        if (bg.a > 0.95) return bg;
        if (bg.a > 0) {
          const parent = backgroundOf(node.parentElement);
          return over(bg, parent);
        }
        node = node.parentElement;
      }
      return parse(getComputedStyle(document.body).backgroundColor);
    };

    const ratio = (a, b) => {
      const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
      return (hi + 0.05) / (lo + 0.05);
    };

    const results = [];
    const seen = new Set();

    document
      .querySelectorAll("p, h1, h2, h3, h4, a, span, li, dt, dd, button, time")
      .forEach((el) => {
        // Only elements with their own visible text.
        const text = [...el.childNodes]
          .filter((n) => n.nodeType === 3)
          .map((n) => n.textContent.trim())
          .join("");
        if (!text) return;

        const style = getComputedStyle(el);
        if (style.visibility === "hidden" || style.display === "none") return;
        if (parseFloat(style.opacity) < 0.5) return;
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        const fg = parse(style.color);
        const bg = backgroundOf(el);
        const contrast = ratio(over(fg, bg), bg);

        const size = parseFloat(style.fontSize);
        const bold = parseInt(style.fontWeight, 10) >= 700;
        const isLarge = size >= 24 || (size >= 18.66 && bold);
        const required = isLarge ? 3 : 4.5;

        if (contrast < required) {
          const key = `${style.color}|${size}|${text.slice(0, 20)}`;
          if (seen.has(key)) return;
          seen.add(key);
          results.push({
            text: text.slice(0, 34),
            color: style.color,
            size: Math.round(size),
            contrast: contrast.toFixed(2),
            required,
          });
        }
      });

    return results;
  });

  record(
    "[contrast] all text meets WCAG AA",
    failures.length === 0,
    failures
      .map((f) => `"${f.text}" ${f.color} ${f.size}px = ${f.contrast}:1 (need ${f.required})`)
      .join(" | "),
  );

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

  /*
   * Every interactive element, not just the nav pills. The old check
   * measured [data-nav-link] alone, which passed happily while the
   * email address, the phone number and a booking link sat at 35px, 35px
   * and 23px on a phone — the three things a reader on a phone is most
   * likely to tap.
   *
   * The page is scrolled through first so lazily-revealed content is
   * actually in the DOM to be measured.
   */
  await page.evaluate(async () => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const height = document.documentElement.scrollHeight;
    for (let y = 0; y <= height; y += window.innerHeight) {
      window.scrollTo({ top: y, behavior: "instant" });
      await wait(60);
    }
    window.scrollTo(0, 0);
    await wait(120);
  });

  const undersized = await page.evaluate(() => {
    const MIN = 44;
    const seen = new Map();
    for (const el of document.querySelectorAll("a, button, [role='button'], summary, input")) {
      const box = el.getBoundingClientRect();
      // Not rendered, or inside something hidden: nothing to tap.
      if (box.width === 0 || box.height === 0) continue;
      // Half a pixel of slack for sub-pixel layout.
      if (box.height >= MIN - 0.5) continue;
      const name =
        el.tagName.toLowerCase() +
        (el.className ? `.${el.className.toString().trim().split(/\s+/)[0]}` : "");
      if (!seen.has(name)) {
        seen.set(
          name,
          `${name} ${Math.round(box.height)}px "${(el.textContent ?? "").trim().slice(0, 24)}"`,
        );
      }
    }
    return [...seen.values()];
  });
  record(
    `[${tag}] every tap target >= 44px`,
    undersized.length === 0,
    undersized.slice(0, 5).join(" | "),
  );

  record(`[${tag}] no console errors or warnings`, problems.length === 0, problems.join(" | "));

  await context.close();
}

/**
 * Contrast of the hero copy against the pixels actually rendered behind
 * it, rather than against the background colour it inherits.
 *
 * The main contrast gate walks the DOM and composites declared colours.
 * That is the right check almost everywhere, and useless over the hero
 * collage, where the background is a moving photograph. The dimming
 * there is chosen from the WCAG formula — an image layer at or below
 * 0.44 opacity over the page base keeps even a pure-white source pixel
 * under the luminance white text needs — but that is an argument, not a
 * measurement. This measures.
 *
 * Method: hide the copy, screenshot the exact box it occupied, and find
 * the brightest pixel that was sitting behind it. Then compute the real
 * ratio against the text's own colour.
 */
/**
 * WCAG SC 1.4.4 Resize Text: text has to survive being doubled in size
 * without the page scrolling sideways or content being lost.
 *
 * Page zoom would pass this trivially, because it scales everything
 * including the viewport. This raises the *root font size* instead,
 * which is what a reader who has set a larger default in their browser
 * actually experiences — and which only rem-based type responds to at
 * all. The scale used to be px and vw throughout, so this test would
 * once have passed by doing nothing: not one character changed size.
 *
 * The assertion is that the page cannot be scrolled horizontally, not
 * that nothing reports overflow. Deliberately horizontal things — the
 * mobile nav bar, the chapter bar — scroll inside themselves by design,
 * and their content stays reachable.
 */
/**
 * The SEO/GEO surface (PRD §9): the files and markup an engine reads
 * rather than a person. None of it is visible, which is exactly why it
 * needs a gate — a broken canonical or a JSON-LD typo shows no symptom
 * on the page and is found months later, if ever.
 */
async function checkSeo(browser, origin) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  for (const path of ["/robots.txt", "/llms.txt", "/sitemap-index.xml"]) {
    const response = await page.goto(`${origin}${path}`);
    record(`[seo] ${path} is served`, response?.status() === 200, `status ${response?.status()}`);
  }

  // llms.txt has to be the convention's shape, not just a file that exists.
  const llms = await (await page.goto(`${origin}/llms.txt`))?.text();
  record("[seo] llms.txt leads with an H1 and a summary", /^# .+\n\n> .+/m.test(llms ?? ""));
  record(
    "[seo] llms.txt links the case studies",
    (llms?.match(/\/case-studies\/[a-z-]+\//g) ?? []).length >= EXPECTED.caseStudyCards,
    `${(llms?.match(/\/case-studies\//g) ?? []).length} links`,
  );

  const PAGES = ["/", "/case-studies/hakkan/"];
  for (const path of PAGES) {
    await page.goto(`${origin}${path}`, { waitUntil: "networkidle" });
    const meta = await page.evaluate(() => {
      const attr = (selector, name) =>
        document.querySelector(selector)?.getAttribute(name)?.trim() ?? "";
      const blocks = [...document.querySelectorAll('script[type="application/ld+json"]')];
      const parsed = [];
      const broken = [];
      for (const block of blocks) {
        try {
          parsed.push(JSON.parse(block.textContent ?? ""));
        } catch (error) {
          broken.push(String(error));
        }
      }
      return {
        title: document.title,
        description: attr('meta[name="description"]', "content"),
        canonical: attr('link[rel="canonical"]', "href"),
        ogTitle: attr('meta[property="og:title"]', "content"),
        ogImage: attr('meta[property="og:image"]', "content"),
        h1s: document.querySelectorAll("h1").length,
        types: parsed.map((entry) => entry["@type"]),
        broken,
        graph: JSON.stringify(parsed),
      };
    });

    record(`[seo ${path}] has a title and description`, !!meta.title && !!meta.description);
    record(
      `[seo ${path}] canonical is absolute and matches the path`,
      meta.canonical.startsWith("https://") && new URL(meta.canonical).pathname === path,
      meta.canonical,
    );
    record(`[seo ${path}] exactly one h1`, meta.h1s === 1, `${meta.h1s} found`);
    record(`[seo ${path}] og:title and og:image are set`, !!meta.ogTitle && !!meta.ogImage);
    record(
      `[seo ${path}] every JSON-LD block parses`,
      meta.broken.length === 0,
      meta.broken.join("; "),
    );

    if (path === "/") {
      record(
        "[seo] home declares a ProfilePage and a WebSite",
        meta.types.includes("ProfilePage") && meta.types.includes("WebSite"),
        meta.types.join(", "),
      );
      record(
        "[seo] the Person node carries sameAs profiles",
        /"sameAs":\[[^\]]*linkedin/i.test(meta.graph),
      );
    } else {
      /*
       * The case study must point at the Person defined on the home
       * page rather than restating it, or the two are separate people
       * as far as a parser is concerned.
       */
      record(
        "[seo] case study author references the site's Person node",
        /"author":\{"@id":"[^"]*#alroy"\}/.test(meta.graph),
      );
    }
  }

  await context.close();
}

async function checkTextZoom(browser, origin) {
  const PAGES = ["/", "/case-studies/innovatr/"];
  const WIDTHS = [320, 375, 768, 1280];

  for (const path of PAGES) {
    for (const width of WIDTHS) {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      const page = await context.newPage();
      await page.goto(`${origin}${path}`, { waitUntil: "networkidle" });

      const result = await page.evaluate(async () => {
        const wait = (ms) => new Promise((r) => setTimeout(r, ms));
        const root = document.documentElement;
        const base = parseFloat(getComputedStyle(root).fontSize);

        const body = document.querySelector("p") ?? document.body;
        const headingBefore = parseFloat(getComputedStyle(document.querySelector("h1")).fontSize);
        const bodyBefore = parseFloat(getComputedStyle(body).fontSize);
        root.style.fontSize = `${base * 2}px`;
        await wait(250);
        const headingAfter = parseFloat(getComputedStyle(document.querySelector("h1")).fontSize);
        const bodyAfter = parseFloat(getComputedStyle(body).fontSize);

        // Walk the page so lazily-revealed content is laid out too.
        const height = root.scrollHeight;
        for (let y = 0; y <= height; y += window.innerHeight) {
          window.scrollTo({ top: y, behavior: "instant" });
          await wait(40);
        }
        window.scrollTo(0, 0);
        await wait(100);

        window.scrollTo(9999, 0);
        const scrolled = window.scrollX;
        window.scrollTo(0, 0);

        root.style.fontSize = "";
        return {
          headingBefore,
          headingAfter,
          bodyBefore,
          bodyAfter,
          scrolled: Math.round(scrolled),
        };
      });

      record(
        `[zoom ${width} ${path}] no horizontal scrolling at 200% text`,
        result.scrolled === 0,
        `page scrolled ${result.scrolled}px sideways`,
      );

      // Only worth asserting once; the scale is global.
      if (path === "/" && width === 1280) {
        /*
         * Body copy is pure rem, so doubling the root doubles it.
         */
        record(
          "[zoom] body text doubles with the reader's font size",
          Math.abs(result.bodyAfter - result.bodyBefore * 2) < 1,
          `${result.bodyBefore}px → ${result.bodyAfter}px`,
        );
        /*
         * The display size cannot double, and should not: only the rem
         * term of a fluid clamp scales, while the vw term stays put.
         * That is the whole point — type that tracks the reader without
         * running off the screen. So the assertion is that it moves
         * substantially, which a px or vw-only scale never would.
         */
        record(
          "[zoom] display type responds to the reader's font size",
          result.headingAfter > result.headingBefore * 1.25,
          `h1 went ${Math.round(result.headingBefore)}px → ${Math.round(result.headingAfter)}px`,
        );
      }

      await context.close();
    }
  }
}

async function checkHeroContrast(browser, origin) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(`${origin}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);

  const targets = await page.evaluate(() => {
    const pick = [
      ["headline", ".hero h1"],
      ["eyebrow", ".hero .eyebrow"],
      ["blurb", ".hero__blurb"],
    ];
    return pick
      .map(([name, selector]) => {
        const el = document.querySelector(selector);
        if (!el) return null;
        const box = el.getBoundingClientRect();
        return {
          name,
          selector,
          color: getComputedStyle(el).color,
          box: { x: box.x, y: box.y, width: box.width, height: box.height },
        };
      })
      .filter(Boolean);
  });

  // Hide the copy so the screenshot captures only what is behind it.
  await page.evaluate(() => {
    document.querySelector(".hero__inner")?.style.setProperty("visibility", "hidden");
  });
  await page.waitForTimeout(200);

  for (const target of targets) {
    const shot = await page.screenshot({
      clip: {
        x: Math.max(0, Math.floor(target.box.x)),
        y: Math.max(0, Math.floor(target.box.y)),
        width: Math.max(1, Math.ceil(target.box.width)),
        height: Math.max(1, Math.ceil(target.box.height)),
      },
    });

    const worst = await page.evaluate(
      async ({ dataUrl, color }) => {
        const channel = (v) => {
          const c = v / 255;
          return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        };
        const luminance = (r, g, b) =>
          0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);

        const bitmap = await createImageBitmap(await (await fetch(dataUrl)).blob());
        const canvas = document.createElement("canvas");
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(bitmap, 0, 0);
        const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

        let brightest = 0;
        for (let i = 0; i < data.length; i += 4) {
          const l = luminance(data[i], data[i + 1], data[i + 2]);
          if (l > brightest) brightest = l;
        }

        const [tr, tg, tb] = color.match(/\d+/g).map(Number);
        const text = luminance(tr, tg, tb);
        const hi = Math.max(text, brightest);
        const lo = Math.min(text, brightest);
        return { ratio: (hi + 0.05) / (lo + 0.05), brightest };
      },
      { dataUrl: `data:image/png;base64,${shot.toString("base64")}`, color: target.color },
    );

    /*
     * 4.5:1 for everything, including the headline, which would only
     * need 3:1 as large text. If the display type cannot clear the body
     * threshold over its own background the background is too bright.
     */
    record(
      `[hero] ${target.name} clears 4.5:1 over the collage`,
      worst.ratio >= 4.5,
      `${worst.ratio.toFixed(2)}:1 against the brightest pixel behind it`,
    );
  }

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

  /*
   * Reveals still happen with reduced motion, just as plain fades, so
   * content below the fold is legitimately still hidden on load. What
   * must be true is that anything on screen has revealed, and that
   * nothing stays stuck hidden once it has been scrolled past.
   */
  const onScreenVisible = await page.evaluate(() => {
    const items = [...document.querySelectorAll("[data-reveal-item]")].filter((el) => {
      const rect = el.getBoundingClientRect();
      return rect.top < window.innerHeight * 0.8 && rect.bottom > 0;
    });
    return {
      count: items.length,
      allVisible: items.every((el) => parseFloat(getComputedStyle(el).opacity) > 0.9),
    };
  });
  record(
    "[reduced-motion] on-screen content has revealed",
    onScreenVisible.count > 0 && onScreenVisible.allVisible,
    `${onScreenVisible.count} item(s) in view`,
  );

  const nothingStuck = await page.evaluate(async () => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const height = document.documentElement.scrollHeight;
    for (let y = 0; y <= height; y += window.innerHeight / 2) {
      window.scrollTo({ top: y, behavior: "instant" });
      await wait(90);
    }
    await wait(400);
    return [...document.querySelectorAll("[data-reveal-item]")].filter(
      (el) => parseFloat(getComputedStyle(el).opacity) < 0.9,
    ).length;
  });
  record(
    "[reduced-motion] nothing stays hidden after scrolling through",
    nothingStuck === 0,
    `${nothingStuck} item(s) still hidden`,
  );

  /*
   * Drag must be inert; the labels remain the way to move.
   *
   * Tested from the middle of the page, not the bottom. At the bottom,
   * scrollY is pinned to the document height — and the booking embed
   * re-measures its own iframe asynchronously, so the document can
   * shrink at any moment and clamp scrollY down with it. That looked
   * exactly like a scrub. Mid-page there is nothing to clamp against,
   * so any movement here is really the drag.
   */
  await settleHeight(page);
  await page.evaluate(() => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: Math.round(max / 2), behavior: "instant" });
  });
  await page.waitForTimeout(250);
  const knobBox = await page.locator(".jnav__knob-pendant").boundingBox();
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
  await checkImageWeight(browser, origin);
  await checkPortfolioModal(browser, origin);
  await checkContrast(browser, origin);
  await checkSeo(browser, origin);
  await checkTextZoom(browser, origin);
  await checkHeroContrast(browser, origin);
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
