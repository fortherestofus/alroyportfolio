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
 *   public/media/portfolio/<name>.mp4      played on demand, never preloaded
 *   public/media/case-studies/<name>.mp4   the silent copies
 *   src/assets/portfolio/<name>-poster.webp  goes through astro:assets
 *
 * These deliberately do NOT live under /portfolio/. That path is also
 * the old WordPress portfolio namespace, which `public/.htaccess`
 * redirects — and for a while it redirected these files too, so every
 * clip 301'd to the homepage. The rule is fixed, but a 301 is cached by
 * the browser indefinitely: anyone who loaded the site during that
 * window still has a permanent redirect stored against those URLs and
 * would never see a video again. Serving them from a path that has
 * never been redirected is the only fix that reaches those visitors.
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
const VIDEO_OUT = join(ROOT, "public", "media", "portfolio");
const POSTER_OUT = SOURCE_DIR;

/** Constant Rate Factor: 28 is visually clean for screen capture at this size. */
const CRF = "28";
const MAX_WIDTH = 1280;

/**
 * Where to grab the poster frame, in seconds.
 *
 * One second in is a fine default — it clears the fade from black most
 * clips open on. It is wrong for a clip whose point only assembles
 * later: the LumiSkin hero spends its first seconds walking the
 * chameleon into shot, and the frame that actually explains the piece
 * (colour matched to the product, card revealed) is around six.
 */
const POSTER_AT = {
  website_video_lumiskin: "6.5",
  social_sweep_demo: "8",
  website_video_filosofee: "3",
};
const POSTER_DEFAULT = "1";

/**
 * Clips that keep their audio track.
 *
 * The default is to strip it: these play as silent loops in a portfolio
 * tile, the audio is dead weight, and dropping it is what lets them
 * autoplay everywhere. A narrated product demo is the exception — the
 * commentary is the point. The element still starts muted so autoplay
 * is never blocked; the controls are what let a reader turn it on.
 */
const KEEP_AUDIO = new Set(["social_sweep_demo"]);

/**
 * Clips that also ship a silent copy for a case study page.
 *
 * The same demo appears in two places with different jobs. In the
 * portfolio it is a thing to watch, so it keeps its narration. On a
 * case study page it sits inside an argument the reader is already
 * reading, and a video that can be unmuted mid-paragraph is a
 * liability — so that copy has no audio track at all rather than an
 * audio track behind a mute button.
 */
const SILENT_COPY = {
  social_sweep_demo: "social-sweep",
  website_video_filosofee: "filosofee-site",
};
const CASE_VIDEO_OUT = join(ROOT, "public", "media", "case-studies");

mkdirSync(VIDEO_OUT, { recursive: true });
mkdirSync(CASE_VIDEO_OUT, { recursive: true });

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
    ...(KEEP_AUDIO.has(name) ? ["-c:a", "aac", "-b:a", "96k"] : ["-an"]),
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
    POSTER_AT[name] ?? POSTER_DEFAULT,
    "-i",
    source,
    "-frames:v",
    "1",
    "-vf",
    `scale='min(${MAX_WIDTH},iw)':-2`,
    /*
     * 68, not 80. A poster is on screen only until the clip starts, and
     * at 80 the travel reel's frame alone came to 97KB — the single
     * heaviest image on the home page, and enough to push a full scroll
     * past the weight budget once another study was added. The
     * difference is not visible at the size these are shown.
     */
    "-q:v",
    "68",
    poster,
  ]);

  const silentName = SILENT_COPY[name];
  if (silentName) {
    run([
      "-y",
      "-i",
      video,
      "-c:v",
      "copy",
      "-an",
      "-movflags",
      "+faststart",
      join(CASE_VIDEO_OUT, `${silentName}.mp4`),
    ]);
  }

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
