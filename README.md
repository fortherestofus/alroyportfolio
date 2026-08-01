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

| Command              | What it does                                    |
| -------------------- | ----------------------------------------------- |
| `npm run dev`        | Dev server at `localhost:4321`                  |
| `npm run build`      | Static build into `dist/`                       |
| `npm run preview`    | Serve the built output                          |
| `npm run qa`         | **All PRD §12b gates, in order**                |
| `npm run qa:browser` | Just the behavioural gates in a real browser    |
| `npm run deploy`     | QA, then publish `dist/` to the `deploy` branch |

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

- [ ] **Blog decision.** The WordPress site has ranked blog posts. Out of scope
      here, but the content needs a call: migrate later, or redirect permanently?
      301s go in either way in Phase 7.
- [ ] **Innovatr metrics.** The outcome-led headline needs real numbers (growth
      %, leads, output cadence). Same for **Thrifty Adventures** (ROAS, CTR,
      bookings).
- [ ] One extra work-experience entry you mentioned. The `TODO(alroy)` marker is
      now in `src/data/experience.ts`; adding a row to that array is all it takes.
- [ ] **"Google me" link dropped.** The old site had one. It felt like clutter
      next to LinkedIn, Dribbble, GitHub, Ask AI and Résumé. Say the word and it
      goes back in.

### Files to drop in

- [ ] **Portfolio shots** — 6-12 per category into the `public/portfolio/*`
      folders above, ~1600px wide, WebP. Optional `captions.json` per folder
      (`{"01": "Caption / alt text"}`); otherwise alt text falls back to the
      filename.
- [ ] **Case study images** — hero, before/after and supporting shots per study.
      Each case study data file lists the exact filenames it expects.
- [ ] **Missing logos** into `src/assets/logos/`: Kelly-Anne Mealia, Lights Film
      School, UXCEL, Codecademy, Total Sports, and a proper Meta mark (the one
      downloaded is the old Facebook primary logo). Until they arrive these fall
      back to a Lucide `building-2`/`graduation-cap` glyph in the same frame.
      _(Innovatr and CalArts received 1 Aug 2026.)_
- [ ] **A dark-background Thrifty Adventures mark**, if you have one. The current
      file is white on transparency, so its frame is flipped to ink to keep it
      visible while every other frame stays light.

### Flagged for a decision

- **Logo.** The nav currently uses a typographic lockup: an `AN` monogram in
  deep green plus the wordmark (which drops off below 1280px to keep the
  timeline readable). The only logo on the live WordPress site is
  `Name-Logo-horizonta-whitel.png`, which is white on transparent and therefore
  invisible on the warm-white base, and there is no dark or SVG variant.
  **Send a dark or vector version and I will swap it straight in.**
- **Favicon.** Regenerated from your existing `AN-Favicon.png`, which is an
  orange/green gradient. It does not match the pthalo-green palette the rest of
  the site uses. Worth a redesign in brand green — say the word and I will
  regenerate all sizes.
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
- [ ] 4. Section 04 — Portfolio cards + modal carousel
- [ ] 5. Section 05 — Stacked case study cards + 4 full pages
- [ ] 6. Section 06 — Contact + lazy Cal.com embed + footer
- [ ] 7. SEO/GEO/AIO — schema, meta, llms.txt, sitemap, 301 redirects, OG
- [ ] 8. Polish & QA — Lighthouse, a11y, reduced-motion, cross-browser
