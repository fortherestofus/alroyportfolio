#!/usr/bin/env node
/**
 * Prepare portfolio video for the web.
 *
 * The source clips are 6-7 Mbps screen and camera captures, which is
 * far more than a portfolio tile needs. Each one is re-encoded to a
 * sane bitrate, capped at 720p, moved into an mp4 container (one source
 * is a .mov, which Firefox will not reliably play), and given a poster
 * frame so nothing has to load until the visitor asks for it.
 *
 * Outputs:
 *   public/portfolio/video/<name>.mp4     played on demand, never preloaded
 *   src/assets/portfolio/<name>-poster.webp  goes through astro:assets
 *
 * Posters live in src/assets so Astro can size and optimise them; the
 * video itself cannot go through astro:assets, so it is served from
 * public/ with long cache headers from .htaccess.
 *
 * Idempotent: a clip is skipped when its output is newer than its
 * source. Run `npm run video` after dropping new clips in.
 */
import { execFileSync } from "node:child_process";
import { readdirSync, mkdirSync, existsSync, statSync } from "node:fs";
import { join, extname, basename } from "node:path";
import ffmpeg from "ffmpeg-static";

const ROOT = new URL("..", import.meta.url).pathname;
const SOURCE_DIR = join(ROOT, "src", "assets", "portfolio");
const VIDEO_OUT = join(ROOT, "public", "portfolio", "video");
const POSTER_OUT = SOURCE_DIR;

/** Constant Rate Factor: 28 is visually clean for screen capture at this size. */
const CRF = "28";
const MAX_WIDTH = 1280;

mkdirSync(VIDEO_OUT, { recursive: true });

const sources = readdirSync(SOURCE_DIR).filter((f) =>
  [".mp4", ".mov"].includes(extname(f).toLowerCase()),
);

if (sources.length === 0) {
  console.log("No source video in src/assets/portfolio/.");
  process.exit(0);
}

const run = (args) => execFileSync(ffmpeg, args, { stdio: ["ignore", "ignore", "pipe"] });
const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)}MB`;

let savedBefore = 0;
let savedAfter = 0;

for (const file of sources) {
  const name = basename(file, extname(file));
  const source = join(SOURCE_DIR, file);
  const video = join(VIDEO_OUT, `${name}.mp4`);
  const poster = join(POSTER_OUT, `${name}-poster.webp`);

  const sourceTime = statSync(source).mtimeMs;
  const upToDate = existsSync(video) && existsSync(poster) && statSync(video).mtimeMs > sourceTime;

  if (upToDate) {
    console.log(`· ${name} already current`);
    continue;
  }

  process.stdout.write(`· ${name} … `);

  run([
    "-y",
    "-i",
    source,
    // Never upscale: only shrink clips wider than the cap, keeping even
    // dimensions because H.264 requires them.
    "-vf",
    `scale='min(${MAX_WIDTH},iw)':-2`,
    "-c:v",
    "libx264",
    "-crf",
    CRF,
    "-preset",
    "slow",
    "-pix_fmt",
    "yuv420p",
    // These play as silent loops in a portfolio tile, so the audio is
    // dead weight. Dropping it also lets them autoplay everywhere.
    "-an",
    // Puts the index up front so playback can start before the whole
    // file has arrived.
    "-movflags",
    "+faststart",
    video,
  ]);

  // A frame from a little way in: frame zero is often a fade from black.
  run([
    "-y",
    "-ss",
    "1",
    "-i",
    source,
    "-frames:v",
    "1",
    "-vf",
    `scale='min(${MAX_WIDTH},iw)':-2`,
    "-q:v",
    "80",
    poster,
  ]);

  const before = statSync(source).size;
  const after = statSync(video).size;
  savedBefore += before;
  savedAfter += after;

  console.log(`${mb(before)} → ${mb(after)} (${Math.round((1 - after / before) * 100)}% smaller)`);
}

if (savedBefore > 0) {
  console.log(
    `\n✓ ${mb(savedBefore)} of source video → ${mb(savedAfter)} served (${Math.round(
      (1 - savedAfter / savedBefore) * 100,
    )}% smaller).`,
  );
}
