# alroyndhlovu.com

Static portfolio for Alroy Ndhlovu. Astro + Tailwind v4 + GSAP/Lenis, deployed to
Hostinger from GitHub.

Built to `prd/PRD.md` (one directory up) and its four supporting docs. That PRD is
the source of truth; this README covers only how to run the thing and what is
still outstanding.

## Commands

```bash
npm install
```

| Command              | What it does                                      |
| -------------------- | ------------------------------------------------- |
| `npm run dev`        | Dev server at `localhost:4321`                    |
| `npm run build`      | Static build into `dist/`                         |
| `npm run preview`    | Serve the built output                            |
| `npm run qa`         | **All PRD §12b gates, in order**                  |
| `npm run qa:browser` | Just the behavioural gates in a real browser      |
| `npm run video`      | Re-encode portfolio video and cut poster frames   |
| `npm run lottie`     | Recolour the section illustrations to the palette |
| `npm run deploy`     | QA, then publish `dist/` to the `deploy` branch   |

`npm run qa` runs: `astro check` → ESLint → token lint → Prettier → build → link
check → browser behaviour. It is the same sequence CI runs, so a green local `qa`
means a green pipeline. Run it before every commit.

Individual gates: `npm run check`, `npm run lint`, `npm run lint:tokens`,
`npm run format:check`, `npm run check:links`, `npm run qa:browser`.

### Browser QA

`scripts/qa-browser.mjs` serves `dist/` and drives it with Playwright, checking
the §12b behavioural list: nav tracking in both directions, click-to-jump,
drag-to-scrub, sticky pinning, console cleanliness, mobile stacking, touch target
sizes, WCAG AA contrast on every rendered text/background pair, reduced motion,
and the no-JS fallback. It runs at 1280, 1440, 1920, a
short 1440x700 viewport, and 375/768 for mobile.

This is scripted rather than done by hand for a specific reason: interactive
browser tooling runs its tab in the background, where Chrome suspends the
rendering loop. With no `requestAnimationFrame` and no scroll events, everything
scroll-driven looks broken whether or not it is. The harness asserts the browser
is genuinely painting before it trusts any other result.

## Design tokens

**The site is dark-first** (decided 1 Aug 2026, replacing the original light-first
plan). Base `#0d0d0d`, warm-white `#F9F6F2` text, and the lively pthalo green
`#90A842` as the accent — on ink it can finally be the accent rather than the
decorative-only role it had on white. The brand palette did not change; which end
of it carries the page did.

The warm-white palette survives as `--color-invert-*`, used for deliberate bright
blocks and for every logo frame. That last one is deliberate: nearly all of
Alroy's company marks were drawn for a white background — some dark ink on
transparency, some opaque with white behind, one white on transparency — so a
light frame makes the whole set legible at once instead of maintaining exception
lists in both directions.

Everything visual comes from `src/styles/tokens.css` — colors, the 8pt spacing
scale, icon stops, control heights, radii, shadows, type scale, weights, motion.
Those tokens are re-exported to Tailwind in the `@theme` block of
`src/styles/global.css`.

`npm run lint:tokens` fails the build on any hardcoded hex, raw `px`, literal
`font-weight`, or Tailwind arbitrary value (`p-[13px]`) outside the token layer —
including a component that tries to invent its own `--local: 13px`. Two
deliberate exemptions, both because CSS gives no alternative: media-query
conditions cannot read `var()`, and structural properties like
`border`/`outline`/`stroke-width` take 1px hairlines.

**Adding a new value means adding a token, not an inline value.**

### Typography

Two cuts only: **Regular 400** for body, **Mittel 500** for everything else —
headings, UI, labels and the giant section numbers. Fett, Satt and Brukt are not
loaded.

That means emphasis comes from size, color and space, never a heavier cut. Two
guards keep it that way: `font-synthesis: none` stops the browser faking a bold,
and the token linter rejects any literal `font-weight`. Use `--weight-body` and
`--weight-heading`.

### The timeline nav

The rule is an SVG path, not a div, so it can bend: the handle pulls the wire
down with it and the sag eases back to level at either end, the same technique
the Allgood reference uses. Geometry comes from tokens (`--wire-sag`,
`--wire-base-y`, `--wire-sag-ease`), and the handle eases toward its target
rather than snapping, so the wire visibly trails and settles.

The scrub handle is a pendant hanging below the line with a "Drag to scrub"
label shown up front, because a drag affordance nobody notices may as well not
exist. Once the reader has scrubbed or simply reached section 02 they have
learnt it, so the label steps back and only returns on hover.

### Touch targets

The design system specifies 40px pills; accessibility requires 44px touch
targets. Both are satisfied by making `--control-md` itself responsive: 40px on
pointer devices, 44px on coarse pointers and at 768px or below. Components just
use the token. Use the `touch-target` utility only for interactive elements not
sized by `--control-md` (icon-only buttons, carousel arrows).

### Section illustrations

Five sections (02–06) carry a Lottie illustration in the left column. The
sources in `src/assets/lottie/` are bright eight-colour illustrations;
`npm run lottie` remaps them onto the brand palette and writes
`public/lottie/`. Skin tones are pinned by hand to caramel, because a colour
map keyed on hex cannot tell a face from a chart bar — the first pass made
everyone green and the second made everyone grey.

Run it after adding or replacing a source file. An unmapped colour fails the
script, and any off-palette fill in the built output fails `lint:tokens`.

The player (`lottie-web` light) is the only JavaScript here that exists purely
for decoration, so it is fetched on approach, never on mobile, and never at all
under reduced motion. All five animations total ~117KB gzipped.

## Deployment

Hostinger pulls from git, and the build happens locally.

```bash
npm run deploy
```

That runs the full QA suite, then publishes `dist/` to the **`deploy` branch**.
Point Hostinger's Git integration at that branch and it serves the built site.

**Why a separate branch rather than `main`:** Hostinger clones a branch straight
into the web root. Pointing it at `main` would put `src/`, `package.json` and the
whole toolchain under your document root. The `deploy` branch contains the built
site and nothing else, so the web root holds exactly what should be public.

The script refuses to publish from a dirty working tree, so whatever is live is
always traceable to a commit on `main`. It rebuilds the branch from scratch each
time, so files deleted from the build disappear from the deployed site too.

`.github/workflows/ci.yml` runs the same QA gates on every push. It does not
deploy — it is there to catch anything that slipped through locally.

`public/.htaccess` handles the HTTPS redirect, compression, cache headers and the
404 document, and ships with the build. Legacy 301s from the old WordPress URLs
land in Phase 7.

### One-time Hostinger setup

In hPanel → Website → Git: add the repository, set branch to `deploy`, and set
the install path to your web root (usually `public_html`). If the repo is still
private, add Hostinger's deploy key to the repo first, or make the repo public.

## Image weight

Standing bar: **light, but still quality.** Three gates enforce it rather than
relying on care, and they measure real network traffic, not what happens to be
sitting in `dist/`:

- a full scroll of the page stays under 900KB of images
- no single image exceeds 260KB, galleries included — the check opens every
  category, because the slides are lazy and would otherwise never be measured
- nothing is served as raw PNG or JPEG, which is the signature of a file that
  slipped past `astro:assets`

Sizing follows what is actually displayed. Gallery slides are capped at 1200px
wide, and a portrait shot is capped by _height_ instead, since that is what
binds inside a letterboxed panel — sizing a tall magazine cover by width shipped
roughly three times the pixels anyone ever saw.

`npm run build` finishes with `scripts/prune-assets.mjs`. The `import.meta.glob`
lookups are what let you drop a file in a folder and name it in a data file with
no code change, but Vite emits every globbed file whether or not it is used,
separately from the optimised copies. The prune deletes anything no HTML, CSS or
JS references. On the first run that was **3.8MB**, taking shipped images from
5.0MB to 1.2MB.

## Portfolio video

Source clips go in `src/assets/portfolio/`. Run:

```bash
npm run video
```

That re-encodes each one to 720p H.264 at CRF 28, strips the audio track,
moves it into an mp4 container, and cuts a poster frame. Output goes to
`public/portfolio/video/` and posters land beside the source as
`<name>-poster.webp`. It skips anything already up to date, so it is cheap to
re-run.

The first pass took **45.6MB of source down to 5.0MB** — the clips were 6-7 Mbps,
which is broadcast bitrate for what is mostly slow-panning screen capture. One
clip dropped 97% with no visible difference at playback size.

Two things matter beyond the file size. The `.mov` had to become `.mp4` because
Firefox will not reliably play a QuickTime container. And nothing is preloaded:
tiles show the poster image and only fetch video when the visitor asks for it,
so video weight never touches page load or Lighthouse.

The encoder is `ffmpeg-static`, a devDependency — it does not ship, and nothing
was installed on your machine.

## Assets

All company/institution logos and both profile photos were downloaded from the
live WordPress site into `src/assets/` before it gets replaced. They are in the
repo; the old site is no longer a dependency.

Drop-in folders that the site picks up without code changes:

```
public/portfolio/{uxui,web,branding,content,photography}/   01.webp 02.webp …
public/case-studies/{innovatr,thrifty-adventures,hakkan,inspiritintruth}/
```

Anything missing renders as a labelled placeholder showing the expected path
(`src/components/Placeholder.astro`), never a broken image. Company and
institution marks fall back to a Lucide glyph in the same 40px frame, so a row
never breaks.

**Light logos:** a few marks are white on a transparent background and would
vanish against the warm-white frame (Thrifty Adventures is one). Those are
listed in `LIGHT_ON_TRANSPARENT` in `src/data/logos.ts` and get an ink backing
instead. If you drop in a new logo and it disappears, add its filename there.
This is not the same as a logo with a white _background_ — most of them — which
reads fine as-is.

---

## Open items for Alroy

Tracked from PRD §14. None of these block the build.

### Needs your input

- [x] **Blog decision — leave it out for now** (Alroy, 2 Aug 2026). The 20
      posts are _not_ migrated, but nothing is lost: every post is archived in
      `legacy-content/` (HTML + metadata, 23,683 words), captured while the
      WordPress site was still live. The redirects reflect the decision
      honestly — posts get **302** (temporary), because migration is deferred
      rather than cancelled and a 301 would tell search engines they are
      permanently gone. Portfolio items and testimonials get **301**, since the
      new site genuinely carries them. To revive the blog: build the post
      template, restore from the archive at the same URLs, and the 302s can be
      deleted rather than unwound.
- [ ] **Innovatr metrics.** The outcome-led headline needs real numbers (growth
      %, leads, output cadence). Same for **Thrifty Adventures** (ROAS, CTR,
      bookings).
- [ ] One extra work-experience entry you mentioned. The `TODO(alroy)` marker is
      now in `src/data/experience.ts`; adding a row to that array is all it takes.
- [ ] **"Google me" link dropped.** The old site had one. It felt like clutter
      next to LinkedIn, Dribbble, GitHub, Ask AI and Résumé. Say the word and it
      goes back in.

### Files to drop in

- [ ] **More portfolio shots.** 19 are in and categorised in
      `src/data/portfolio.ts`. UX/UI has 3 and Web has 2, against the PRD's
      6-12 per category, so those two read thin. Drop files into
      `src/assets/portfolio/`, add an entry with alt text, and run
      `npm run video` if it is a clip.
- [ ] `video_travel` sits in Content but could be Photography. One line in
      `src/data/portfolio.ts`. _(Magazine covers moved to Branding 1 Aug.)_
- [ ] **Case study images** — hero, before/after and supporting shots per study.
      Each case study data file lists the exact filenames it expects.
- [x] **Social Sweep screenshots** — received 1 Aug 2026 as
      `social_sweep_landing.jpg`, `social_sweep_report.jpg` and
      `social_sweep_charts.jpg`.
- [ ] **Missing logos** into `src/assets/logos/`: Kelly-Anne Mealia, Eris
      Property Group, Lights Film
      School, UXCEL, Codecademy, Total Sports, and a proper Meta mark (the one
      downloaded is the old Facebook primary logo). Until they arrive these fall
      back to a Lucide `building-2`/`graduation-cap` glyph in the same frame.
      _(Innovatr and CalArts received 1 Aug 2026.)_
- [ ] **A dark-background Thrifty Adventures mark**, if you have one. The current
      file is white on transparency, so its frame is flipped to ink to keep it
      visible while every other frame stays light.

### Flagged for a decision

- **The self-employed entry is dated differently to LinkedIn.** LinkedIn closes
  the Dejamedia entry at Nov 2018 – Mar 2026; the site says "Independent
  Contractor · Various · 2018 – Present". The site is deliberately the open
  one — the consulting is ongoing (Thrifty Adventures still runs) — so this is
  noted rather than treated as an error. Say the word and it becomes a closed
  range.

- **Lumiskin case study** — named on the section 06 overview under "Being
  written". Alroy will supply the details (a design exploration: a cosmetics
  hero screen); it becomes a card and a page the moment its entry lands in
  `src/data/case-studies.ts`.
- **More web video** — Alroy has additional website video for the portfolio.
  Drop the files into `src/assets/portfolio/`, run `npm run video`, and add
  each clip + poster to the `web` category in `src/data/portfolio.ts`.
- **"Ask Gemini" opens Google AI Mode** (`udm=50`), not gemini.google.com —
  tested: the Gemini app drops a prefilled query for signed-out visitors and
  lands them on an empty chat, while AI Mode runs the same query for everyone
  and is Gemini-powered. One-line swap in `WhoIsAlroy.astro` if that changes.

- **The booking embed points at one event, not the profile.** `SOCIAL.cal` is
  `cal.com/mralroyndhlovu/quick`, so the section shows the 15-minute chat's
  calendar directly. The paid consultation is linked underneath rather than
  dropped (`SOCIAL.calConsultation`), because the rate is a signal worth
  keeping when the audience is employers and clients at once. Swapping either
  is a one-line change in `src/data/site.ts`; the component derives Cal's
  `calLink` from the URL.

- **Logo.** The nav currently uses a typographic lockup: an `AN` monogram in
  deep green plus the wordmark (which drops off below 1280px to keep the
  timeline readable). The only logo on the live WordPress site is
  `Name-Logo-horizonta-whitel.png`, which is white on transparent and therefore
  invisible on the warm-white base, and there is no dark or SVG variant.
  **Send a dark or vector version and I will swap it straight in.**
- **Hostinger Git setup** is a one-time manual step in hPanel (see Deployment
  above). Nothing is live until that is pointed at the `deploy` branch.
- **OG image.** `public/og-default.png` is generated from brand tokens (now dark)
  but set in Helvetica, because the render step has no access to the Apfel
  webfonts. Fine to ship; upgradable to a proper per-page design in Phase 7.

---

## Build phases

Per PRD §13. Each ends with the full §12b gates, then a commit.

- [x] **1. Scaffold** — Astro, Tailwind, fonts, tokens, base layout, placeholder
      system, QA gates, deploy pipeline
- [x] **2. Journey shell** — timeline nav, drag-to-scrub, six two-column
      sections, Lenis/ScrollTrigger, mobile pill bar, browser QA harness
- [x] **3. Sections 01-03** — Who is Alroy, Experience, Education
- [x] **4. Section 04** — Portfolio cards, modal carousel, video pipeline
- [x] **5. Section 05** — Products: Hakkan, InSpiritInTruth, tapa., CaughtSlipping
- [~] **6. Section 06** — Stacked peel cards and the Innovatr page are live.
  Thrifty Adventures, Hakkan and InSpiritInTruth are named on the overview
  as being written; each becomes a card automatically when its entry lands
  in `src/data/case-studies.ts`, and the product cards in section 05 link
  through the moment a matching page exists.
- [x] **7. Section 07** — Contact: email with copy-to-clipboard, phone, the
      lazy Cal.com embed, social links and the footer
- [x] **8. SEO/GEO/AIO** — ProfilePage + Person + WebSite + ItemList JSON-LD,
      generated `llms.txt`, sitemap, robots with AI crawlers allowed, and 33
      legacy redirects gated in browser QA
- [ ] 9. Polish & QA — Lighthouse, a11y, reduced-motion, cross-browser
