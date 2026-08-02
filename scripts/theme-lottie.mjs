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
   * Objects take the two brand families across their full range. The
   * ramps exist — Goldie is three colours, pthalo is three — and using
   * one value from each is what made an early pass look flat.
   */
  "4683ec": T.pthalo, // blue   -> lively pthalo
  "2344cc": T.pthalo,
  "028b34": T.olive, // green  -> olive, so the two greens stay distinct
  "2f7c24": T.olive,
  fe3456: T.goldDeep, // red    -> deep goldie
  e81e21: T.goldDeep,
  ffc044: T.gold, // yellow -> bright goldie
  f4c20c: T.goldMid,

  /*
   * The two warm tones default to light surfaces — screens, paper,
   * panels — which is what they mostly are.
   */
  efe4b5: T.ink, // cream  -> a light panel: screens, paper, walls
  fef7cf: T.ink,
  ff7c51: T.goldMid, // orange -> mid goldie, for warm objects
  fb8502: T.goldMid,
};

/**
 * Skin is decided by layer, not by colour, and that distinction is the
 * whole reason this script is more than a find-and-replace.
 *
 * The same cream carries a character's face and the screen of a monitor,
 * so a hex-keyed map has to choose one meaning for both. Choosing skin
 * turned every panel to caramel, and gold bars on a caramel panel
 * measure about 1:1 — invisible, which is exactly what Alroy saw in
 * section 04. Choosing paper turned every face grey.
 *
 * Lottie layers carry names, and these files name their people: "Guy",
 * "Character", "Hands", "Right_Hand", "Mouth". So the walk tracks its
 * ancestry, and inside a person the warm tones become caramel while
 * everywhere else they stay light.
 */
const PERSON = new Set([
  "guy",
  "character",
  "person",
  "man",
  "woman",
  "girl",
  "boy",
  "head",
  "face",
  "mouth",
  "nose",
  "ear",
  "eye",
  "hair",
  "neck",
  "torso",
  "body",
  "chest",
  "shoulder",
  "arm",
  "forearm",
  "elbow",
  "hand",
  "hands",
  "thumb",
  "finger",
  "leg",
  "thigh",
  "knee",
  "foot",
  "feet",
  "skin",
]);

/*
 * Split rather than match. Layer names here are `Right_Hand`,
 * `Left_Forearm`, `Isolation Mode 9` — and a word-boundary regex does
 * not fire across an underscore, because `_` is itself a word
 * character. `\bhand\b` therefore misses `Right_Hand` entirely, which
 * is how the education figure ended up with a white face while its
 * hands stayed caramel. Splitting on anything that is not a letter and
 * testing each token has no such blind spot.
 */
const isPerson = (name) =>
  typeof name === "string" &&
  name
    .toLowerCase()
    .split(/[^a-z]+/)
    .some((word) => PERSON.has(word));

const SKIN_MAP = {
  efe4b5: T.skin,
  fef7cf: T.skin,
  ff7c51: T.skinShade,
  fb8502: T.skinShade,
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
let skinned = 0;

function walk(node, inPerson = false) {
  if (Array.isArray(node)) return node.forEach((child) => walk(child, inPerson));
  if (!node || typeof node !== "object") return;

  // Once inside a person, stay inside: limbs are nested under the figure.
  const here = inPerson || isPerson(node.nm);

  // A flat fill or stroke carries its colour as a static [r,g,b,a].
  if ((node.ty === "fl" || node.ty === "st") && node.c && Array.isArray(node.c.k)) {
    const k = node.c.k;
    if (typeof k[0] === "number") {
      const key = hex(k);
      const skinTone = here ? SKIN_MAP[key] : undefined;
      const target = skinTone ?? MAP[key];
      if (target) {
        node.c.k = [...target, k[3] ?? 1];
        recoloured++;
        if (skinTone) skinned++;
      } else {
        unmapped.add(key);
      }
    }
  }

  for (const key of Object.keys(node)) walk(node[key], here);
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

console.log(
  `\n✓ Recoloured ${recoloured} fills across ${files.length} animations (${skinned} skin).`,
);
if (unmapped.size > 0) {
  console.error(`\n✖ Unmapped colours: ${[...unmapped].join(", ")}`);
  console.error("Add them to MAP in scripts/theme-lottie.mjs so nothing ships off-palette.\n");
  process.exit(1);
}
