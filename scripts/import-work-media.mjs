#!/usr/bin/env node
/**
 * Bring Alroy's portfolio folder into the site, compressed.
 *
 * The originals live outside the repo (on his machine, in a folder
 * called "Portfolio") and stay there: two of the films alone are
 * 175MB, and committing source footage would bloat every clone for
 * good. Only the web-ready output is written into the repo.
 *
 *   node scripts/import-work-media.mjs ~/Desktop/Portfolio
 *
 * What it writes:
 *   src/assets/work/<slug>/<slug>-<name>.jpg   stills, max 1600px, mozjpeg
 *   src/assets/portfolio/<name>.jpg            stills for the medium galleries
 *   public/media/work/<slug>-<name>.mp4        project clips
 *   public/media/work/<slug>-preview.mp4       5-6s silent loop for the tile
 *   public/media/portfolio/<name>.mp4          clips for the medium galleries
 *   ...plus a <name>-poster.jpg beside each clip's stills, so Astro can
 *   size and optimise the poster like any other image.
 *
 * Clips keep their sound where they have any: they start muted on the
 * page and the viewer chooses to turn it on. Screen recordings of
 * websites have no sound to keep.
 *
 * Idempotent: anything whose output already exists is skipped, so it
 * is safe to re-run after adding a line to the manifest.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { homedir } from "node:os";
import ffmpeg from "ffmpeg-static";
import sharp from "sharp";

const ROOT = new URL("..", import.meta.url).pathname;
const SOURCE = (process.argv[2] ?? join(homedir(), "Desktop", "Portfolio")).replace(
  /^~/,
  homedir(),
);

if (!existsSync(SOURCE)) {
  console.error(`✖ Source folder not found: ${SOURCE}`);
  process.exit(1);
}

const WORK_ASSETS = join(ROOT, "src", "assets", "work");
const PORTFOLIO_ASSETS = join(ROOT, "src", "assets", "portfolio");
const WORK_MEDIA = join(ROOT, "public", "media", "work");
const PORTFOLIO_MEDIA = join(ROOT, "public", "media", "portfolio");

/** Long edge for stills. Astro makes the display sizes from this. */
const STILL_MAX = 1600;
const STILL_QUALITY = 80;

/* ---- Manifest ------------------------------------------------------ */

/*
 * Stills: [source path relative to SOURCE, output name].
 * Clips: { src, name, poster (seconds), audio, width cap, preview }.
 * `preview` is [start, length] in seconds for the silent tile loop.
 * `frames` pulls stills out of a film, as [seconds, output name].
 */
const PROJECTS = {
  "jenna-clifford": {
    stills: [
      ["Jenna Clifford/IMG_1756.jpg", "photo-1"],
      ["Jenna Clifford/IMG_1752.jpg", "photo-2"],
      ["Jenna Clifford/IMG_1751.jpg", "photo-3"],
      ["Jenna Clifford/IMG_1754.jpg", "photo-4"],
      ["Jenna Clifford/IMG_1753.jpg", "photo-5"],
      ["Jenna Clifford/IMG_1755.jpg", "photo-6"],
    ],
    clips: [
      {
        src: "Jenna Clifford/Jenna Clifford- Alice in Wonderland.mp4",
        name: "film",
        poster: 32,
        audio: true,
        width: 1280,
      },
    ],
  },
  "kelly-ann-mealia": {
    clips: [
      {
        src: "Kelly-Anne/AQMcjBWWmmgsolnmxtuMUtw1ZYt8RNLZzy5Sw0PHLkD1LYxC6SemXQJUTPcaeR53tCyFSIacmSgUnYYwQIhMVuk8_Ds8RAp0hQV5c_18170915083264755.mp4",
        name: "video",
        // Between captions, so the poster is her and not a word.
        poster: 25,
        audio: true,
        width: 720,
        preview: [8, 5],
      },
    ],
    stills: [
      [
        "Kelly-Anne/328057712_870634167524683_1192115064843611389_n_17983648096893352.jpg",
        "portrait-1",
      ],
      [
        "Kelly-Anne/328233189_719721996269963_1765874196807898255_n_17941854602593250.jpg",
        "portrait-2",
      ],
      [
        "Kelly-Anne/328068623_987521955743948_3497038431576556985_n_18323121064069557.jpg",
        "portrait-3",
      ],
      ["Kelly-Anne/1.png", "post-1"],
      ["Kelly-Anne/2.png", "post-2"],
      ["Kelly-Anne/4.png", "post-3"],
    ],
  },
  alabanza: {
    stills: [
      [
        "Alabanza Fashion Boutique Content Direction and Photography/469657803_17949406538860698_1751613372898837545_n_18033164350864952.jpg",
        "01",
      ],
      [
        "Alabanza Fashion Boutique Content Direction and Photography/469677714_17949406709860698_3825365861026338057_n_18035747833951011.jpg",
        "02",
      ],
      [
        "Alabanza Fashion Boutique Content Direction and Photography/469854329_17949405920860698_8278828374072423028_n_18020194136249718.jpg",
        "03",
      ],
      [
        "Alabanza Fashion Boutique Content Direction and Photography/469837830_17949406391860698_8892554832261752833_n_17898505641007616.jpg",
        "04",
      ],
      [
        "Alabanza Fashion Boutique Content Direction and Photography/469728955_17949406445860698_311623221842328823_n_18044821693828545.jpg",
        "05",
      ],
      [
        "Alabanza Fashion Boutique Content Direction and Photography/469854946_17949406781860698_1995553061913598996_n_17885061029999017.jpg",
        "06",
      ],
      [
        "Alabanza Fashion Boutique Content Direction and Photography/469929069_17949405761860698_7343578232464612037_n_18032300219049582.jpg",
        "07",
      ],
      [
        "Alabanza Fashion Boutique Content Direction and Photography/469914136_17949406817860698_8456534085347992544_n_17966292176755339.jpg",
        "08",
      ],
    ],
  },
  filosofee: {
    stills: [
      [
        "Filosofee Content Direction/469699685_17949405542860698_4906636038077082985_n_18051377686634881.jpg",
        "01",
      ],
      [
        "Filosofee Content Direction/469679552_17949405866860698_3301253460045474230_n_17842483347239268.jpg",
        "02",
      ],
      [
        "Filosofee Content Direction/469847576_17949405566860698_1620644179032018656_n_18049089502676242.jpg",
        "03",
      ],
      [
        "Filosofee Content Direction/469902351_17949405563860698_6006646667472458446_n_18435390718027252.jpg",
        "04",
      ],
      [
        "Filosofee Content Direction/469966151_17949405593860698_1245487664954881381_n_18009300758433061.jpg",
        "05",
      ],
      [
        "Filosofee Content Direction/469664728_17949405806860698_3719572139188972100_n_18045384667758525.jpg",
        "06",
      ],
    ],
  },
  "mitch-sneakers": {
    clips: [
      {
        src: "Mitch Sneakers/Mitch Sneaker Social.mp4",
        name: "video",
        poster: 7.5,
        audio: true,
        width: 720,
        preview: [2, 6],
      },
    ],
    stills: [
      [
        "Mitch Sneakers/358516198_1378011459414751_3329149024537861869_n_18238832641200980.jpg",
        "01",
      ],
      [
        "Mitch Sneakers/358531539_5639179619518911_4321033192351145426_n_18019853581615356.jpg",
        "02",
      ],
      [
        "Mitch Sneakers/358406447_1277334539815632_4572713608100858695_n_17963125598541425.jpg",
        "03",
      ],
    ],
  },
  "iab-bookmarks": {
    clips: [
      {
        src: "Video/IAB Awards Event Social.mp4",
        name: "video",
        // The stage with the Bookmarks name lit up.
        poster: 2,
        audio: true,
        width: 720,
        // Low-light, handheld and grainy: at the default it came to 14MB.
        crf: 30,
        maxrate: "1100k",
        preview: [0, 6],
      },
    ],
  },
  "smirnoff-at-home": {
    clips: [
      {
        src: "Smirnof Mock Content Direction/Sminorf at Home social.mp4",
        name: "video",
        poster: 13,
        audio: true,
        width: 720,
        preview: [0, 6],
      },
    ],
    stills: [
      [
        "Smirnof Mock Content Direction/346040843_201370679411293_7184298832506630551_n_17968168772211434.jpg",
        "01",
      ],
      [
        "Smirnof Mock Content Direction/345270391_940185523892486_6776062867512651415_n_18030351178500939.jpg",
        "02",
      ],
      [
        "Smirnof Mock Content Direction/345265968_591636679713140_2919334386579147683_n_17956251320379262.jpg",
        "03",
      ],
      [
        "Smirnof Mock Content Direction/345880786_629539209034459_7120641790028693608_n_17974478732099556.jpg",
        "04",
      ],
      [
        "Smirnof Mock Content Direction/345244110_606979088034546_646856594485553300_n_18007247422657044.jpg",
        "05",
      ],
      [
        "Smirnof Mock Content Direction/345253161_1282615949051829_5035660213206158851_n_17980408742004581.jpg",
        "06",
      ],
      [
        "Smirnof Mock Content Direction/346285135_567722902154701_5194774453904310091_n_17908820783762899.jpg",
        "07",
      ],
      [
        "Smirnof Mock Content Direction/345257871_2158042147726984_7252668573506448798_n_17908521518683219.jpg",
        "08",
      ],
    ],
  },
  "gucci-at-home": {
    clips: [
      {
        src: "Gucci Mock Content Direction/Gucci at Home social.mp4",
        name: "video",
        poster: 2.5,
        audio: true,
        width: 720,
        preview: [0.5, 6],
      },
    ],
    stills: [
      [
        "Gucci Mock Content Direction/339352126_180801004771821_4632695691642265710_n_17867983133896485.jpg",
        "01",
      ],
      [
        "Gucci Mock Content Direction/339654966_978181146506806_470390732245685646_n_17948139944557327.jpg",
        "02",
      ],
      [
        "Gucci Mock Content Direction/339829526_166077136369979_2368870946512889485_n_17849248625952843.jpg",
        "03",
      ],
    ],
  },
  botanik: {
    stills: [
      [
        "Wine Bottle Branding COncepts/362978479_1442634609904219_7227017344195689278_n_18090096280359357.jpg",
        "01",
      ],
      [
        "Wine Bottle Branding COncepts/362962387_782752043541772_1797974962559655055_n_18168587755305090.jpg",
        "02",
      ],
      [
        "Wine Bottle Branding COncepts/362987009_308658735063363_5532489384820973732_n_17999076640956801.jpg",
        "03",
      ],
      [
        "Wine Bottle Branding COncepts/363300039_291929353495065_8533013195378313741_n_17848325331011211.jpg",
        "04",
      ],
      [
        "Wine Bottle Branding COncepts/363292059_821468296029235_8866095515856895328_n_17869330859953477.jpg",
        "05",
      ],
      [
        "Wine Bottle Branding COncepts/363495516_1355760948339868_5239988400213762666_n_18068916880402183.jpg",
        "06",
      ],
    ],
  },
  /*
   * Fifteen posts, three per mall, plus the two page covers, from the
   * sample of the month's work in the folder.
   * Chosen for range (food, fashion, health, tech, the Women's Month
   * post every mall ran) rather than as a best-of, so the page shows
   * how wide the brief was.
   */
  "eris-property-group": {
    stills: [
      ["Eris Propery Group/Chuma Mall/Chuma.png", "chuma-cover"],
      [
        "Eris Propery Group/Chuma Mall/Chuma Mall Posts (AUG 2024)/Legit 2 for 2.png",
        "chuma-legit",
      ],
      [
        "Eris Propery Group/Chuma Mall/Chuma Mall Posts (AUG 2024)/Real Fish and Chips.png",
        "chuma-fish-and-chips",
      ],
      ["Eris Propery Group/Chuma Mall/Chuma Mall Posts (AUG 2024)/Pep Cell.png", "chuma-pep-cell"],
      ["Eris Propery Group/Sechaba Mall/Sechaba.png", "sechaba-cover"],
      ["Eris Propery Group/Sechaba Mall/Sechaba Mall Content (6)-AUG/Rage.png", "sechaba-rage"],
      [
        "Eris Propery Group/Sechaba Mall/Sechaba Mall Content (6)-AUG/The Crazy Store.png",
        "sechaba-crazy-store",
      ],
      [
        "Eris Propery Group/Sechaba Mall/Sechaba Mall Content (6)-AUG/Women's Month.png",
        "sechaba-womens-month",
      ],
      ["Eris Propery Group/Letseng Mall Content (8)- AUG/Debonairs.png", "letseng-debonairs"],
      [
        "Eris Propery Group/Letseng Mall Content (8)- AUG/Fashion Threads.png",
        "letseng-fashion-threads",
      ],
      ["Eris Propery Group/Letseng Mall Content (8)- AUG/Roots Butchery.png", "letseng-butchery"],
      [
        "Eris Propery Group/Mamotse Mall Content (6)- AUG/Mogapi Optometrist.png",
        "mamotse-optometrist",
      ],
      ["Eris Propery Group/Mamotse Mall Content (6)- AUG/Nail Excellence.png", "mamotse-nails"],
      ["Eris Propery Group/Mamotse Mall Content (6)- AUG/Pep Store.png", "mamotse-pep"],
      ["Eris Propery Group/Taung Mall Contet (Aug)-6/Ackermans.png", "taung-ackermans"],
      ["Eris Propery Group/Taung Mall Contet (Aug)-6/Studio 88.png", "taung-studio-88"],
      ["Eris Propery Group/Taung Mall Contet (Aug)-6/Womans Month.png", "taung-womens-month"],
    ],
  },
};

/** Loose pieces for the by-medium galleries on the home page. */
const GALLERY = {
  clips: [
    {
      src: "Video/AirBnB Booking Video.mp4",
      name: "video_short_stay",
      poster: 52,
      audio: true,
      width: 1280,
      crf: 29,
    },
    {
      src: "Video/Just 6- Music Videoh.mp4",
      name: "video_just6",
      poster: 96,
      audio: true,
      width: 1280,
      crf: 29,
      audioRate: "128k",
    },
    {
      src: "Video/Black and WHite Editorial Social.mp4",
      name: "video_bw_editorial",
      poster: 2,
      audio: true,
      width: 720,
    },
    {
      src: "Video/Influencer social.mp4",
      name: "video_influencer",
      poster: 9,
      audio: true,
      width: 720,
    },
    {
      src: "Video/Travel Video social.mp4",
      name: "video_travel_social",
      poster: 7,
      audio: true,
      width: 720,
    },
    {
      src: "Web Portfolio/EPA Showcase.mp4",
      name: "website_video_epa",
      poster: 1,
      audio: false,
      width: 1280,
      // Stops before the footer, which credits a company that has closed.
      until: 17,
    },
    {
      src: "Web Portfolio/FoE Showcase.mp4",
      name: "website_video_foe",
      poster: 1,
      audio: false,
      width: 1280,
    },
    {
      src: "Web Portfolio/CashNSport.mp4",
      name: "website_video_cashnsport",
      poster: 1,
      audio: false,
      width: 1280,
    },
    {
      src: "Web Portfolio/ISIT Showcase.mp4",
      name: "website_video_isit",
      poster: 1,
      audio: false,
      width: 1280,
    },
    {
      src: "Web Portfolio/AN website.mp4",
      name: "website_video_alroy",
      poster: 1,
      audio: false,
      width: 1280,
    },
  ],
  stills: [
    [
      "Images/347413347_964187814715556_7346111833553408140_n_17975747177251218.jpg",
      "photography_beauty_flowers",
    ],
    [
      "Images/363518422_830530555328070_1416964470978180183_n_17967246377372542.jpg",
      "photography_beauty_flowers_2",
    ],
    ["Images/Felli.webp", "photography_portrait_felli"],
    ["Images/Kgali.webp", "photography_portrait_kgali"],
    [
      "Images/469726183_17949407495860698_121615508477070237_n_18055484179671696.jpg",
      "photography_headshot_1",
    ],
    [
      "Images/469825437_17949407804860698_449076544474275608_n_18131828878317689.jpg",
      "photography_headshot_2",
    ],
    [
      "Images/469890990_17949408659860698_3464753796922631657_n_17984986646697831.jpg",
      "photography_headshot_3",
    ],
    ["Images/MG_1191.webp", "photography_interior_lounge"],
    ["Images/MG_1358.webp", "photography_interior_suite"],
    ["Images/Alex-Website-Mockup.webp", "web_mockup_personal_brand"],
    [
      "Graphics/339535890_887921592290537_4323146468518298620_n_18003422104649066.jpg",
      "branding_logo_lettherebelight",
    ],
    [
      "Graphics/361594416_1224395681554660_5892491066536113867_n_18012807508740048.jpg",
      "branding_logo_dropinthebowl",
    ],
    [
      "Graphics/443712304_17925455522860698_7528678565803595369_n_17885834285984831.jpg",
      "content_story_heart",
    ],
    [
      "Graphics/443840294_17925455507860698_4392081255668869869_n_17976828497702179.jpg",
      "content_story_megaphone",
    ],
  ],
};

/* ---- Workers ------------------------------------------------------- */

const run = (args) => execFileSync(ffmpeg, args, { stdio: ["ignore", "ignore", "pipe"] });
const kb = (file) => `${Math.round(statSync(file).size / 1024)}KB`;
const mb = (file) => `${(statSync(file).size / 1024 / 1024).toFixed(1)}MB`;

function ensureDir(file) {
  mkdirSync(dirname(file), { recursive: true });
}

async function still(source, out) {
  if (existsSync(out)) return console.log(`· ${out.replace(ROOT, "")} already there`);
  ensureDir(out);
  await sharp(source)
    .rotate()
    .resize(STILL_MAX, STILL_MAX, { fit: "inside", withoutEnlargement: true })
    // Flatten onto white so a transparent PNG cannot turn black as a JPEG.
    .flatten({ background: "#ffffff" })
    .jpeg({ quality: STILL_QUALITY, mozjpeg: true })
    .toFile(out);
  console.log(`· ${out.replace(ROOT, "")} ${kb(source)} → ${kb(out)}`);
}

function frame(source, seconds, width, out, crop) {
  if (existsSync(out)) return;
  ensureDir(out);
  const scale = `scale='min(${width},iw)':-2`;
  run([
    "-y",
    "-ss",
    String(seconds),
    "-i",
    source,
    "-frames:v",
    "1",
    "-vf",
    crop ? `crop=${crop},${scale}` : scale,
    "-q:v",
    "3",
    out,
  ]);
  console.log(`· ${out.replace(ROOT, "")} ${kb(out)}`);
}

function clip(source, out, { width, audio, crf = 27, audioRate = "96k", maxrate, until }) {
  if (existsSync(out)) return console.log(`· ${out.replace(ROOT, "")} already there`);
  ensureDir(out);
  process.stdout.write(`· ${out.replace(ROOT, "")} … `);
  run([
    "-y",
    "-i",
    source,
    // `until` ends the clip early, in seconds.
    ...(until ? ["-t", String(until)] : []),
    // Never upscale; H.264 needs even dimensions.
    "-vf",
    `scale='min(${width},iw)':-2`,
    "-c:v",
    "libx264",
    "-crf",
    String(crf),
    "-preset",
    "slow",
    // A ceiling on the bitrate, so one busy scene cannot balloon a file.
    "-maxrate",
    maxrate ?? (width > 720 ? "2200k" : "1600k"),
    "-bufsize",
    "4400k",
    "-pix_fmt",
    "yuv420p",
    ...(audio ? ["-c:a", "aac", "-b:a", audioRate, "-ac", "2"] : ["-an"]),
    // Index up front, so playback starts before the whole file arrives.
    "-movflags",
    "+faststart",
    out,
  ]);
  console.log(`${mb(source)} → ${mb(out)}`);
}

function preview(source, out, [start, length], width) {
  if (existsSync(out)) return;
  ensureDir(out);
  run([
    "-y",
    "-ss",
    String(start),
    "-t",
    String(length),
    "-i",
    source,
    "-vf",
    `scale='min(${width},iw)':-2`,
    "-c:v",
    "libx264",
    "-crf",
    "30",
    "-preset",
    "slow",
    "-pix_fmt",
    "yuv420p",
    "-an",
    "-movflags",
    "+faststart",
    out,
  ]);
  console.log(`· ${out.replace(ROOT, "")} ${kb(out)}`);
}

/* ---- Run ----------------------------------------------------------- */

for (const [slug, project] of Object.entries(PROJECTS)) {
  const assetDir = join(WORK_ASSETS, slug);

  for (const [src, name] of project.stills ?? []) {
    await still(join(SOURCE, src), join(assetDir, `${slug}-${name}.jpg`));
  }

  for (const c of project.clips ?? []) {
    const source = join(SOURCE, c.src);
    clip(source, join(WORK_MEDIA, `${slug}-${c.name}.mp4`), c);
    frame(source, c.poster, c.width, join(assetDir, `${slug}-${c.name}-poster.jpg`));
    // Tiles are at most ~420 CSS px wide; 540 covers a 2x screen at the
    // size they are actually drawn without shipping the full clip.
    if (c.preview) preview(source, join(WORK_MEDIA, `${slug}-preview.mp4`), c.preview, 540);
    for (const [seconds, name] of c.frames ?? []) {
      frame(source, seconds, 1600, join(assetDir, `${slug}-${name}.jpg`), c.crop);
    }
  }
}

for (const [src, name] of GALLERY.stills) {
  await still(join(SOURCE, src), join(PORTFOLIO_ASSETS, `${name}.jpg`));
}

for (const c of GALLERY.clips) {
  const source = join(SOURCE, c.src);
  clip(source, join(PORTFOLIO_MEDIA, `${c.name}.mp4`), c);
  frame(source, c.poster, c.width, join(PORTFOLIO_ASSETS, `${c.name}-poster.jpg`));
}

console.log("\n✓ Done.");
