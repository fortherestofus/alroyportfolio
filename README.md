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

| Command           | What it does                               |
| ----------------- | ------------------------------------------ |
| `npm run dev`     | Dev server at `localhost:4321`             |
| `npm run build`   | Static build into `dist/`                  |
| `npm run preview` | Serve the built output                     |
| `npm run qa`      | **All PRD §12b automated gates, in order** |

`npm run qa` runs: `astro check` → ESLint → token lint → Prettier → build → link
check. It is the same sequence CI runs, so a green local `qa` means a green
pipeline. Run it before every commit.

Individual gates: `npm run check`, `npm run lint`, `npm run lint:tokens`,
`npm run format:check`, `npm run check:links`.

## Design tokens

Everything visual comes from `src/styles/tokens.css` — colors, the 8pt spacing
scale, icon stops, control heights, radii, shadows, type scale, motion. Those
tokens are re-exported to Tailwind in the `@theme` block of
`src/styles/global.css`.

`npm run lint:tokens` fails the build on any hardcoded hex, raw `px`, or Tailwind
arbitrary value (`p-[13px]`) outside the token layer — including a component that
tries to invent its own `--local: 13px`. Two deliberate exemptions, both because
CSS gives no alternative: media-query conditions cannot read `var()`, and
structural properties like `border`/`outline`/`stroke-width` take 1px hairlines.

**Adding a new value means adding a token, not an inline value.**

### Touch targets

The design system specifies 40px pills; accessibility requires 44px touch
targets. Both are satisfied by making `--control-md` itself responsive: 40px on
pointer devices, 44px on coarse pointers and at 768px or below. Components just
use the token. Use the `touch-target` utility only for interactive elements not
sized by `--control-md` (icon-only buttons, carousel arrows).

## Deployment

`.github/workflows/deploy.yml` runs the QA gates on every push to `main`, uploads
`dist/` as an artifact, then FTPs it to Hostinger.

**The FTP step is inert until these repo secrets exist** (Settings → Secrets and
variables → Actions). Without them the job logs a warning and skips the upload
rather than failing:

- `FTP_SERVER`
- `FTP_USERNAME`
- `FTP_PASSWORD`
- `FTP_REMOTE_DIR` (usually `/public_html/`)

`public/.htaccess` handles the HTTPS redirect, compression, cache headers and the
404 document. Legacy 301s from the old WordPress URLs land in Phase 7.

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
(`src/components/Placeholder.astro`), never a broken image.

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
- [ ] One extra work-experience entry you mentioned. A `TODO(alroy)` marker goes
      in the experience data file in Phase 3.

### Files to drop in

- [ ] **Portfolio shots** — 6-12 per category into the `public/portfolio/*`
      folders above, ~1600px wide, WebP. Optional `captions.json` per folder
      (`{"01": "Caption / alt text"}`); otherwise alt text falls back to the
      filename.
- [ ] **Case study images** — hero, before/after and supporting shots per study.
      Each case study data file lists the exact filenames it expects.
- [ ] **Missing logos** into `assets-from-alroy/logos/`: Kelly-Anne Mealia,
      CalArts, Lights Film School, UXCEL, Codecademy, Total Sports, and a proper
      Meta mark (the one downloaded is the old Facebook primary logo). Until they
      arrive these fall back to a Lucide `building-2`/`graduation-cap` glyph in
      the standard 40px logo frame.

### Flagged for a decision

- **Favicon.** Regenerated from your existing `AN-Favicon.png`, which is an
  orange/green gradient. It does not match the pthalo-green palette the rest of
  the site uses. Worth a redesign in brand green — say the word and I will
  regenerate all sizes.
- **OG image.** `public/og-default.png` is generated from brand tokens but set in
  Helvetica, because the render step has no access to the Apfel webfonts. Fine to
  ship; can be upgraded to a proper per-page design in Phase 7.

---

## Build phases

Per PRD §13. Each ends with the full §12b gates, then a commit.

- [x] **1. Scaffold** — Astro, Tailwind, fonts, tokens, base layout, placeholder
      system, QA gates, deploy pipeline
- [ ] 2. Journey shell — timeline nav, drag-to-scrub, six two-column sections,
      Lenis/ScrollTrigger
- [ ] 3. Sections 01-03 — Who is Alroy, Experience, Education
- [ ] 4. Section 04 — Portfolio cards + modal carousel
- [ ] 5. Section 05 — Stacked case study cards + 4 full pages
- [ ] 6. Section 06 — Contact + lazy Cal.com embed + footer
- [ ] 7. SEO/GEO/AIO — schema, meta, llms.txt, sitemap, 301 redirects, OG
- [ ] 8. Polish & QA — Lighthouse, a11y, reduced-motion, cross-browser
