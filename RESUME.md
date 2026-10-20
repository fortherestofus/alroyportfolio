# The two résumés

Both PDFs are rendered from this site, by Chromium, from the same data files the
pages use. Nothing is typed twice: fix a date in `src/data/experience.ts` and it
is fixed on the website and in both PDFs at once.

| File                                     | Route             | For                                                         |
| ---------------------------------------- | ----------------- | ----------------------------------------------------------- |
| `public/alroy-ndhlovu-resume.pdf`        | `/resume/ats/`    | Application forms and recruiters. Text only, single column. |
| `public/alroy-ndhlovu-resume-visual.pdf` | `/resume/visual/` | A person who will open it. The website, folded onto A4.     |

## One command

```bash
npm run resume
```

Builds the site, renders both PDFs into `public/`, then re-opens them and checks
them. That is the whole workflow — there is no separate export step and nothing
to do by hand afterwards. Commit the two PDFs along with whatever you changed.

To look at a route in a browser before rendering, `npm run dev` and open
`localhost:4321/resume/ats/`. On screen it floats at its true printed width, so
what you see is the measure the PDF will have.

## What to edit, for what

Almost everything lives in files the website already owns:

| To change                          | Edit                       |
| ---------------------------------- | -------------------------- |
| A job title, company, date, logo   | `src/data/experience.ts`   |
| A qualification                    | `src/data/education.ts`    |
| A product, its stack or store link | `src/data/products.ts`     |
| A case study or its numbers        | `src/data/case-studies.ts` |
| Portfolio shots and captions       | `src/data/portfolio.ts`    |
| Email, phone, site URL             | `src/data/site.ts`         |
| A testimonial or client logo       | `src/data/testimonials.ts` |

Only what a portfolio site has no reason to carry lives in `src/data/resume.ts`:

- **`RESUME`** — the headline, the city, and the professional summary.
- **`ROLE_DETAILS`** — the achievement bullets, keyed by `company` so they match
  `experience.ts` by name rather than by position. Set `compact: true` on a role
  to print it as a single line with no bullets; `context` adds one line of
  explanation under the title for a company a reader will not recognise.
- **`COMPETENCIES`** and **`TOOLS`** — the keyword blocks.
- **`PRODUCT_NOTES`** — one engineering line per product, keyed by name.
- **`KEYWORD_TARGETS`** — what the keyword coverage is aimed at. See below.

### Adding a job

Add it to `src/data/experience.ts` in date order, then add a matching entry to
`ROLE_DETAILS` in `src/data/resume.ts` with the same `company` string. Run
`npm run resume`. If the names do not match, the role still prints — it just
prints without bullets, which is the failure you want rather than a crash.

Both PDFs read the same bullets. The visual one shows the first three; the ATS
one shows all of them, so put the strongest first.

## Keywords

An ATS matches literally. "Conversion rate optimisation" does not match a bullet
that says "improved conversions", and a term that is not in the document cannot
be found however obviously the work implies it.

```bash
npm run resume:preview -- ats --keywords
```

prints the PDF exactly as a parser reads it, then counts the terms in
`KEYWORD_TARGETS` — grouped by the four kinds of role being targeted: marketing
and brand, design, business technology, and agentic/AI development. Anything
with no match is listed as missing.

Treat a missing term as a question, not a defect. Either the document is leaving
out something true, in which case add it where it belongs, or the term does not
describe this person, in which case take it out of `KEYWORD_TARGETS`. Writing a
phrase into the résumé purely to turn a count green is how you end up in an
interview defending a word you have never used.

Some entries in `TOOLS` carry `assumed: true`. Those are tools the work plainly
required but that nothing on this site actually names — Figma, HubSpot, Shopify
and so on. They print exactly like the rest. Confirm or delete them once.

**When applying for a specific job**, read its posting and check its exact
phrasing against the preview. That is worth more than any general keyword list,
because the filter was written from that posting.

## What the checks guarantee

`npm run resume` ends with `scripts/verify-resume-pdf.mjs`, which re-opens the
PDFs and **fails** unless:

- the name, email, phone, city, site and LinkedIn all extract from page 1
- every section heading is present, spelled the way a parser matches
- every company and every date range in `experience.ts` extracts as text
- page 1 yields at least 1,500 characters
- the ATS PDF is 4 pages or fewer and under 1 MB; the visual one under 12 MB

That last-but-one check is the important one. The résumé this replaced was a
single 595 × 6520pt page built from four JPEGs: it looked finished and yielded
213 characters, no name, no job title, no date. An ATS does not report that as
an error — it just records a candidate with no name. The floor is there so the
same thing cannot happen quietly again.

It also runs inside `npm run qa`, so a change to any data file that breaks a PDF
fails before deploy rather than after.

## Will an ATS read the visual one?

Yes, better than expected — but do not submit it.

Measured: it yields 14,976 extractable characters, and the name, headline,
contact line and every role with its dates and bullets come out in the right
order. The only garbling is in the portfolio caption grid, where two columns
weld onto one line, and captions carry no field data.

So it will not embarrass you if it ends up in a parser. It is still the wrong
file to send one: 15 pages, 6 MB, and a black background that prints as fifteen
solid dark sheets. Send `alroy-ndhlovu-resume.pdf` to anything with a form, and
the visual one to a person.

## Notes on the two designs

The ATS document obeys a short list of rules, none of them stylistic: one
column, no images, no tables, no text boxes, contact details in the body rather
than a running header — several parsers skip header and footer regions — and
conventional section names, because "Professional Experience" is in every
parser's synonym list and a cleverer heading is in none of them. Inside those
rules it still uses the brand's deep pthalo, hairline rules and Apfel Grotezk.
Colour is painted, not structural; it costs a parser nothing.

Roles there are allowed to split across a page break, with the title, meta and
context lines pinned to whatever follows. Holding all thirteen together wasted
most of a sheet on the gaps left behind.

The visual document has none of those constraints and reproduces the site:
black, the hero with portrait and stats, logo-marked roles, the galleries,
product cards framed to match what they are pictures of, and case-study cards
that link back. Images there keep their own aspect ratio rather than being
cropped to a common strip — the one thing a portfolio has to do is let someone
see the work.
