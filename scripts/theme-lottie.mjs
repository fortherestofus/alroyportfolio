#!/usr/bin/env node
/**
 * Recolour the section Lottie illustrations into the site palette.
 *
 * The source files are bright multi-colour flat illustrations — blue,
 * orange, red, yellow, green, on white. Dropped onto this page as-is
 * they read as clip-art stickers: five new hues on a site that spends
 * one accent very deliberately.
 *
 * They are pure vector with flat fills and no expressions or
 * gradients, so every colour is a literal [r,g,b,a] in the JSON and can
 * be remapped. This maps the source palette onto site tokens, inverting
 * the value structure for a dark page: the illustrations' black line
 * work becomes warm white, their white fills become the page's own
 * surfaces, and the five accent hues collapse onto the pthalo family.
 *
 * Collapsing five hues onto one risks merging adjacent shapes into
 * flat blobs, so they map to three distinct values rather than one —
 * enough separation to keep forms readable.
 *
 * Run: npm run lottie
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const SRC = new URL("../src/assets/lottie/", import.meta.url).pathname;
const OUT = new URL("../public/lottie/", import.meta.url).pathname;

/** Site tokens, duplicated here because a build script cannot read CSS. */
const T = {
  ink: [0.976, 0.965, 0.949], // --color-text
  surface: [0.102, 0.102, 0.102], // --color-surface
  skin: [0.69, 0.478, 0.306], // --color-skin, caramel
  skinShade: [0.541, 0.353, 0.216], // --color-skin-shade
  pthalo: [0.565, 0.659, 0.259], // --color-accent
  olive: [0.71, 0.702, 0.145], // --color-accent-olive
  gold: [0.941, 0.702, 0.192], // --color-gold
  goldMid: [0.761, 0.631, 0.259], // --color-gold-mid
  goldDeep: [0.71, 0.506, 0.016], // --color-gold-deep
};

/**
 * Source hex -> site colour. Keyed on the exact values these six files
 * use; anything unmapped is reported rather than silently passed
 * through, so a new illustration cannot quietly smuggle a hue in.
 */
const MAP = {
  "020202": T.ink, // line work: black on light becomes white on dark
  ffffff: T.surface, // white fills become the page's raised surface

  /*
   * Skin. These two warm tones carry every face and hand in the set,
   * and they get real caramel rather than the accent or a grey. The
   * first pass sent orange to deep pthalo and produced green faces; the
   * second sent both to neutral greys and produced lifeless ones. A
   * hex-keyed map cannot see what a shape is, so these two keys are
   * pinned by hand and everything else works around them.
   */
  efe4b5: T.skin, // cream — skin, and light warm fills
  fef7cf: T.skin,
  ff7c51: T.skinShade, // orange — skin shadow, warm objects
  fb8502: T.skinShade,

  /*
   * Objects take the two brand families across their full range. The
   * ramps exist — Goldie is three colours, pthalo is three — and using
   * one value from each was what made the first attempt look flat.
   */
  "4683ec": T.pthalo, // blue   -> lively pthalo
  "2344cc": T.pthalo,
  "028b34": T.olive, // green  -> olive, so the two greens stay distinct
  "2f7c24": T.olive,
  fe3456: T.goldDeep, // red    -> deep goldie
  e81e21: T.goldDeep,
  ffc044: T.gold, // yellow -> bright goldie
  f4c20c: T.goldMid,
};

const hex = (c) =>
  c
    .slice(0, 3)
    .map((v) =>
      Math.round(v * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("");

const unmapped = new Set();
let recoloured = 0;

function walk(node) {
  if (Array.isArray(node)) return node.forEach(walk);
  if (!node || typeof node !== "object") return;

  // A flat fill or stroke carries its colour as a static [r,g,b,a].
  if ((node.ty === "fl" || node.ty === "st") && node.c && Array.isArray(node.c.k)) {
    const k = node.c.k;
    if (typeof k[0] === "number") {
      const key = hex(k);
      const target = MAP[key];
      if (target) {
        node.c.k = [...target, k[3] ?? 1];
        recoloured++;
      } else {
        unmapped.add(key);
      }
    }
  }

  for (const key of Object.keys(node)) walk(node[key]);
}

mkdirSync(OUT, { recursive: true });

/**
 * One illustration per section that gets one. The spare
 * `online-job-illustration…` file in the source folder is a second take
 * on work experience and is deliberately not built (Alroy, 2 Aug 2026),
 * so it costs nothing in the bundle while staying available.
 */
const WANTED = new Set([
  "workexperience.json",
  "education.json",
  "portfolio.json",
  "products.json",
  "case studies.json",
]);

const files = readdirSync(SRC).filter((f) => WANTED.has(f));
if (files.length !== WANTED.size) {
  console.error(`\n✖ Expected ${WANTED.size} source animations, found ${files.length}.`);
  process.exit(1);
}
for (const file of files) {
  const animation = JSON.parse(readFileSync(join(SRC, file), "utf8"));
  walk(animation);
  // Spaces in a filename become %20 in a URL; normalise on the way out.
  const name = file.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
  writeFileSync(join(OUT, name), JSON.stringify(animation));
  process.stdout.write(`  ${name}\n`);
}

console.log(`\n✓ Recoloured ${recoloured} fills across ${files.length} animations.`);
if (unmapped.size > 0) {
  console.error(`\n✖ Unmapped colours: ${[...unmapped].join(", ")}`);
  console.error("Add them to MAP in scripts/theme-lottie.mjs so nothing ships off-palette.\n");
  process.exit(1);
}
