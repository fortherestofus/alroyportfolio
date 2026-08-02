import type { ImageMetadata } from "astro";

/**
 * Case studies (PRD §5, prd/03-case-studies.md).
 *
 * A page is a list of typed blocks rather than prose, so the four
 * studies share one renderer and a new block type is added once.
 *
 * Numbers are quoted from Alroy's own July 2026 LinkedIn Ads report,
 * which is unusually honest about what did and did not work. Nothing
 * here is rounded up, and where the report caveats a figure, so does
 * this. A case study that overclaims is worth less than one that does
 * not, especially to the kind of client who will check.
 */
/*
 * Product screenshots serve the product case studies too, keyed as
 * `products/<filename>` so the two folders cannot collide.
 */
const files = import.meta.glob<{ default: ImageMetadata }>(
  [
    "../assets/case-studies/**/*.{png,jpg,jpeg,webp,avif}",
    "../assets/products/*.{png,jpg,jpeg,webp,avif}",
  ],
  { eager: true },
);

const byPath = new Map<string, ImageMetadata>();
for (const [path, module] of Object.entries(files)) {
  const caseKey = path.split("/assets/case-studies/")[1];
  if (caseKey) byPath.set(caseKey, module.default);
  const productKey = path.split("/assets/")[1];
  if (productKey?.startsWith("products/")) byPath.set(productKey, module.default);
}

/** `slug/filename.jpg`, matching the folder layout in 04-assets.md. */
export function caseImage(path?: string): ImageMetadata | null {
  if (!path) return null;
  return byPath.get(path) ?? null;
}

export interface Metric {
  value: string;
  label: string;
  /** The comparison that makes the number mean something. */
  context?: string;
}

export type Block =
  | { kind: "prose"; heading: string; body: string[] }
  | { kind: "metrics"; heading: string; intro?: string; items: Metric[]; footnote?: string }
  | {
      kind: "beforeAfter";
      heading: string;
      intro?: string;
      pairs: { before: string; after: string; label: string; alt: string }[];
    }
  | {
      kind: "gallery";
      heading: string;
      intro?: string;
      /** Web captures rather than square social slides: fewer, larger. */
      wide?: boolean;
      shots: { image: string; alt: string }[];
    }
  | { kind: "checklist"; heading: string; intro?: string; items: string[] }
  /**
   * A month-by-month bar chart. Rendered as a real table with a CSS bar
   * per row rather than as a picture of a chart: a screen reader gets
   * the figures, everyone else gets the shape, and there is no JS and
   * no image to go missing.
   */
  | {
      kind: "trend";
      heading: string;
      intro?: string;
      /** What the bar length means, e.g. "Impressions". */
      measure: string;
      /** What a row is, shown as the first column header. Default "Month". */
      rowLabel?: string;
      rows: { label: string; value: number; display: string; note?: string }[];
      footnote?: string;
    }
  | { kind: "pending"; heading: string; note: string };

export interface CaseStudy {
  slug: string;
  name: string;
  dates: string;
  /** Outcome first. This is the line that has to earn the click. */
  summary: string;
  description: string;
  tags: string[];
  meta: string[];
  website?: string;
  /** Filename in src/assets/logos, badged as a circular client mark. */
  logoFile?: string;
  /**
   * The moving image strip on the section 06 overview card (PRD §6.05).
   * A spread of the work rather than the best six shots: a reader
   * scanning the card should see the range before they see the detail.
   */
  strip?: { image: string; alt: string }[];
  /** Anchored sub-navigation, in page order. */
  chapters: { id: string; label: string }[];
  blocks: (Block & { id?: string })[];
  seo: { title: string; description: string };
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "thrifty-adventures",
    name: "Thrifty Adventures",
    dates: "Jul 2025 – Jan 2026",
    summary:
      "Took a leisure travel brand onto LinkedIn from nothing and came away with 742 leads at R30 — after finding that the offer, not the audience, was what the channel actually rewarded.",
    description:
      "Thrifty Adventures runs group and tailored tours out of South Africa. LinkedIn is a professional network and they sell holidays, so it is not the channel anyone would pick for them. I ran it properly for seven months, across every objective the platform sells, to find out what it would actually do.",
    tags: ["Paid media", "Channel testing", "Lead generation", "Creative strategy"],
    logoFile: "thrifty.jpeg",
    meta: ["Client · Thrifty Adventures", "Paid media & content", "Jul 2025 – Jan 2026"],
    chapters: [
      { id: "start", label: "The wrong channel" },
      { id: "testing", label: "Opening it up" },
      { id: "offer", label: "The brochure" },
      { id: "results", label: "Results" },
      { id: "honest", label: "What didn't work" },
    ],
    blocks: [
      {
        id: "start",
        kind: "prose",
        heading: "The channel nobody picks for travel",
        body: [
          "LinkedIn is where you go to reach a job title. Thrifty Adventures sells group tours to Egypt, Namibia, Dubai and Zanzibar, to people spending their own money on their own holidays. On paper it is the wrong platform, and that is roughly what the industry assumes.",
          "There was no paid activity at all when I started. No campaigns, no saved audiences, no tracking, and no view of what a click was worth. So the question was not how to scale LinkedIn. It was whether LinkedIn works for consumer travel at all, and what it costs to find out honestly.",
          "Seven months and R117,322 later, it does — but not for the reason I expected going in.",
        ],
      },
      {
        id: "testing",
        kind: "prose",
        heading: "One objective at a time, then all of them",
        body: [
          "July was deliberately small: R1,834 behind a single website-visits campaign, split only by whether the audience sat in South Africa or in the diaspora abroad. 29,032 impressions, and R5.80 a click, which is what an account with no history pays.",
          "September was the real test. Four campaigns ran four different objectives at the same time — brand awareness, website visits, lead generation and engagement — because running them side by side in one month is the only honest way to learn what a platform charges you for each of the things it sells. That month produced the first 202 leads, and the comparison that decided everything after it.",
          "Everything after that was consolidation: drop what the September comparison had killed, put the money behind what survived, and let the account's own history bring the price down.",
        ],
      },
      {
        id: "testing",
        kind: "trend",
        heading: "Zero to 1.4 million impressions a month",
        measure: "Impressions",
        rows: [
          {
            label: "Jul 2025",
            value: 29032,
            display: "29,032",
            note: "One campaign, one objective, R1,834. R5.80 a click.",
          },
          {
            label: "Aug 2025",
            value: 238006,
            display: "238,006",
            note: "Same campaign, real weight behind it. R2.43 a click.",
          },
          {
            label: "Sep 2025",
            value: 662277,
            display: "662,277",
            note: "Four objectives at once, side by side. The first 202 leads.",
          },
          {
            label: "Oct 2025",
            value: 641912,
            display: "641,912",
            note: "Seven campaigns. Conversions and video added to the mix.",
          },
          {
            label: "Nov 2025",
            value: 583214,
            display: "583,214",
            note: "Spend pulled back to only what September had proved.",
          },
          {
            label: "Dec 2025",
            value: 1388364,
            display: "1,388,364",
            note: "Scaled on the winners. CPM down to R16.78.",
          },
          {
            label: "Jan 2026",
            value: 1369336,
            display: "1,369,336",
            note: "R1.72 a landing page click, R12.18 CPM. The cheapest month of the run.",
          },
        ],
        footnote:
          "Cost per thousand impressions fell 81% from the first month to the last, R63.16 to R12.18, and cost per landing page click fell 70%, R5.80 to R1.72, while monthly reach grew roughly 47 times. A good part of that is simply an account earning its own history, which is worth saying rather than claiming as strategy.",
      },
      {
        id: "offer",
        kind: "metrics",
        heading: "The brochure was the whole finding",
        intro:
          "The thing that decided performance was not the targeting. Two sets of lead forms ran to the same sort of audience, on the same platform, in overlapping months. One asked people to enquire about a trip. The other offered them the 2026 travel brochure. Only one of them asked for something the reader already wanted.",
        items: [
          {
            value: "36.6%",
            label: "Form completion, brochure",
            context: "More than a third of everyone who opened the form finished it.",
          },
          {
            value: "8.6%",
            label: "Form completion, everything else",
            context: "The identical form mechanic, with nothing to collect at the end.",
          },
          {
            value: "10–15%",
            label: "Typical LinkedIn form completion",
            context:
              "So the brochure beat the band by more than the rest of the account missed it.",
          },
          {
            value: "R26.74",
            label: "Cost per lead, brochure",
            context: "540 of the 742 leads, from R14,437.",
          },
          {
            value: "R37.13",
            label: "Cost per lead, everything else",
            context: "202 leads from R7,500, at 39% more each.",
          },
          {
            value: "8.93%",
            label: "Engagement rate, boosted brochure post",
            context: "The highest of the run, at R0.36 per engagement.",
          },
        ],
        footnote:
          "Same platform, same market, same months, same form. The variable was what the ad asked the reader for, which is the part of paid media that no amount of audience tuning fixes. The 8.93% is an engagement rate, not a click-through rate: LinkedIn counts reactions, comments, shares and follows as chargeable clicks on engagement campaigns, and that post drove no landing page clicks at all.",
      },
      {
        id: "results",
        kind: "metrics",
        heading: "What seven months bought",
        intro: "From no paid presence on the channel at all.",
        items: [
          {
            value: "R117,322",
            label: "Total spend",
            context: "Across 16 campaigns and six different objectives.",
          },
          {
            value: "4.91M",
            label: "Impressions",
            context: "29,032 in the first month, 1.37M in the last.",
          },
          {
            value: "0.97%",
            label: "Landing page CTR",
            context:
              "Across the traffic campaigns, against a 0.52% median over 150,000 LinkedIn campaigns.",
          },
          {
            value: "33,079",
            label: "Landing page clicks",
            context: "At R2.12 each, from R70,111 of traffic spend.",
          },
          {
            value: "742",
            label: "Leads",
            context: "At R29.57 each, from R21,937 of lead generation spend.",
          },
          {
            value: "208,493",
            label: "Video completions",
            context: "R0.09 each, and a 25.9% completion rate against impressions.",
          },
          {
            value: "929",
            label: "New page followers",
            context: "Picked up alongside the engagement campaigns, not bought directly.",
          },
        ],
        footnote:
          "Click figures here are landing page clicks, not LinkedIn's headline Clicks column, which on engagement campaigns also counts reactions, comments, shares and follows. The 0.52% median is AgencyAnalytics' January 2025 benchmark across 150,000+ campaigns. Costs are in rand and are account facts rather than benchmarked ones: no credible South African or travel-sector LinkedIn cost benchmark exists to compare them against.",
      },
      {
        id: "honest",
        kind: "prose",
        heading: "What didn't work",
        body: [
          "Brand awareness was the most expensive thing on the platform and I would not buy it again at that price: R8,400 at a 0.109% click-through rate and R19.76 a click. Judged as a click channel it failed outright. Judged on what it is actually sold for it did deliver 211,026 video views and 84,324 completions, so the money was not burnt — but there were cheaper ways to buy the same attention, and the run proved it.",
          "Single-destination video posts did not travel. Egypt, Namibia and Dubai each drew between 0.10% and 0.16% CTR at R25 to R37 a click. The one composite post — a year of trips in a single edit — pulled 1,791 clicks at R0.87 and 106,232 video completions. People responded to the range, not to one place.",
          "And the conversion column is not reportable. It records 97,475 conversions against 57,345 clicks — 1.7 per click. That is not necessarily an error: LinkedIn's Conversions metric counts actions taken after an impression as well as after a click, on a 30-day click and 7-day view-through window, and a broadly scoped rule will fire on ordinary page loads. But until it is split into Click Conversions and View Conversions it cannot be honestly described as people who saw an ad and then acted. So no conversion figure appears anywhere on this page, including the several that would have flattered the work considerably.",
        ],
      },
      {
        id: "honest",
        kind: "prose",
        heading: "What I'd do differently",
        body: [
          "Run the brochure from month one. The offer that ended up defining the account — 36.6% form completion against 8.6% for everything else — only entered the mix in September, which means two months of lead spend ran on the weaker ask. The lesson generalises: test the offer before tuning the audience, because the offer moved numbers the targeting never could.",
          "And I would configure conversion tracking properly on day zero. The broad tag made the entire conversions column unusable for seven months of reporting, and no amount of after-the-fact analysis can un-mix view-throughs from clicks. Ten minutes of setup would have bought a whole extra column of evidence.",
        ],
      },
    ],
    seo: {
      title: "Thrifty Adventures case study | Alroy Ndhlovu",
      description:
        "How Alroy Ndhlovu tested LinkedIn as a paid channel for a South African leisure travel brand: 4.9M impressions and 742 leads at R30, and why the offer mattered more than the audience.",
    },
  },
  {
    slug: "innovatr",
    name: "Innovatr",
    dates: "Mar 2026 – Sep 2026",
    summary:
      "Rebuilt the whole front of a research business — positioning, website, content engine and paid programme — sourced its addressable market from nothing, and replaced a US$8,000-a-year software licence with a product the company could sell.",
    description:
      "Innovatr is a consumer research and growth consultancy. I joined as Brand & Marketing Manager and rebuilt the front of the business: the positioning, the website, the content engine that turns research into demand, and the paid programme underneath it. I also built the social listening product the business now sells.",
    tags: [
      "Rebranding",
      "Content",
      "Paid media",
      "Lead sourcing",
      "Marketing automation",
      "Product build",
    ],
    logoFile: "innovatr.jpg",
    meta: ["Client · Innovatr", "Brand & Marketing Manager", "Mar – Sep 2026"],
    strip: [
      { image: "innovatr/web-home-after.jpg", alt: "The rebuilt Innovatr home page." },
      { image: "innovatr/carousel-way-1.png", alt: "“Old research is dead” ad carousel cover." },
      { image: "innovatr/social_sweep_report.jpg", alt: "A finished Social Sweep report." },
      {
        image: "innovatr/carousel-drinking-1.png",
        alt: "Research carousel on generational drinking habits.",
      },
      { image: "innovatr/web-tools-after.jpg", alt: "The rebuilt tools section." },
      {
        image: "innovatr/carousel-research-3.png",
        alt: "“Fast. Smart. Affordable.” positioning slide.",
      },
      {
        image: "innovatr/social_sweep_landing.jpg",
        alt: "Social Sweep's question screen.",
      },
      { image: "innovatr/web-casestudy-after.jpg", alt: "The rebuilt case study section." },
    ],
    chapters: [
      { id: "start", label: "The starting point" },
      { id: "branding", label: "Brand & website" },
      { id: "content", label: "Reports into content" },
      { id: "ads", label: "Ad creative" },
      { id: "pipeline", label: "The pipeline" },
      { id: "results", label: "Results" },
      { id: "product", label: "The product" },
    ],
    blocks: [
      {
        id: "start",
        kind: "prose",
        heading: "The starting point",
        body: [
          "Innovatr sold fast, affordable consumer research into a market that had been buying the same thing from Kantar, IPSOS and Nielsen for decades. The product was genuinely different. The way it was presented was not.",
          "The site led with “Stop Guessing. Launch Better Innovation.”, a line that could have belonged to any research agency. There was no paid programme, effectively no inbound traffic, and no repeatable way of turning the research the company was already producing into demand for the research it wanted to sell.",
        ],
      },
      {
        id: "branding",
        kind: "beforeAfter",
        heading: "Brand and website",
        intro:
          "The repositioning turned a generic promise into an argument. “Old research is dead. Stop being told. Start asking why.” gives the reader something to disagree with, and the proof sits directly underneath it: 200+ studies, 25+ markets, a 44M panel.",
        pairs: [
          {
            label: "Home",
            before: "innovatr/web-home-before.jpg",
            after: "innovatr/web-home-after.jpg",
            alt: "The Innovatr home page before and after: a generic purple “Stop Guessing” hero replaced by an editorial layout headlined “Old research is dead. Stop being told. Start asking why.” with proof stats beneath it.",
          },
          {
            label: "Tools",
            before: "innovatr/web-tools-before.jpg",
            after: "innovatr/web-tools-after.jpg",
            alt: "The tools section before and after: a dense pink grid of cards rebuilt as a lighter, clearly ranked set with descriptions and states.",
          },
          {
            label: "Case studies",
            before: "innovatr/web-casestudy-before.jpg",
            after: "innovatr/web-casestudy-after.jpg",
            alt: "The case study section before and after the rebuild.",
          },
          {
            label: "Contact",
            before: "innovatr/web-contact-before.jpg",
            after: "innovatr/web-contact-after.jpg",
            alt: "The contact page before and after the rebuild.",
          },
        ],
      },
      {
        id: "content",
        kind: "gallery",
        heading: "Turning research into content",
        intro:
          "Innovatr was sitting on the raw material for its own marketing: every study it ran produced findings nobody outside the client ever saw. Two different jobs came out of that. The Gen Z drinking carousel is a report — the actual research, argued in public, with the 4,339 comments behind it shown rather than described. The old-versus-new research carousel is the social content built around the method, making the case for why any of it should be believed. Both do the same thing the product does: state a claim, then put the evidence directly underneath it.",
        shots: [
          {
            image: "innovatr/carousel-drinking-1.png",
            alt: "Opening slide of a research carousel: “Gen Z hasn't quit drinking. They can't afford it”, drawn from 4,339 unprompted comments.",
          },
          {
            image: "innovatr/carousel-drinking-2.png",
            alt: "The same carousel showing the emotional split behind the finding: sadness 35 percent, joy and interest 15, concern 11.",
          },
          {
            image: "innovatr/carousel-drinking-3.png",
            alt: "A further slide in the generational drinking carousel.",
          },
          {
            image: "innovatr/carousel-research-1.png",
            alt: "Cover of the “Your research is holding you back” carousel, introducing Innovatr.",
          },
          {
            image: "innovatr/carousel-research-2.png",
            alt: "“The old way: slow, expensive, unclear”, listing 6-8 week turnarounds and R200K study costs.",
          },
          {
            image: "innovatr/carousel-research-3.png",
            alt: "“Fast. Smart. Affordable.” — 24 hour insights, from R3k per concept, a 44M consumer panel.",
          },
        ],
      },
      {
        id: "ads",
        kind: "gallery",
        heading: "Ad creative",
        intro:
          "The paid programme ran the same argument in a format built to be scrolled past. “The Innovatr Way” set the competitive frame directly: Kantar, IPSOS and Nielsen have not changed their model in decades, six week turnarounds, R500K studies, and 30% of findings ever influencing a decision.",
        shots: [
          {
            image: "innovatr/carousel-way-1.png",
            alt: "Ad carousel cover: “Old research is dead. Most brands haven't been told yet.”",
          },
          {
            image: "innovatr/carousel-way-2.png",
            alt: "“Kantar. IPSOS. Nielsen. They haven't changed their model in decades. Why are you still paying for it?” with 6 week, R500K and 30% figures.",
          },
          {
            image: "innovatr/carousel-way-4.png",
            alt: "A further slide from The Innovatr Way ad carousel.",
          },
          {
            image: "innovatr/carousel-way-6.png",
            alt: "Closing slide from The Innovatr Way ad carousel.",
          },
        ],
      },
      {
        id: "pipeline",
        kind: "metrics",
        heading: "Building the pipeline",
        intro:
          "A business selling research to decision-makers has to know exactly who those decision-makers are, and Innovatr had no list at all. So I built one — Apollo ICP prospecting, the shared Workshop17 tenant database, direct client outreach, the LinkedIn page audience and inbound signups — de-duplicated it by email into one CRM, and then matched it back into LinkedIn as the audiences the paid programme ran against. That last step is the point of the whole exercise: the ads were aimed at named companies and real job titles instead of the platform's guesses about interests, and the delivery numbers below are what that bought.",
        items: [
          {
            value: "3,094",
            label: "Unique contacts in the CRM",
            context:
              "De-duplicated by email across every source, so nobody is counted twice. Built from zero in six months.",
          },
          {
            value: "1,272",
            label: "Organisations mapped",
            context:
              "The addressable market as a list of companies — which is what account-based targeting needs to exist.",
          },
        ],
        footnote:
          "Sourced audience, not inbound enquiries — a distinction plenty of reporting skips. The proof this worked is under Results: LinkedIn's own delivery demographics show the ads landing on the seniorities and companies these lists were built from.",
      },
      {
        id: "results",
        kind: "metrics",
        heading: "The ads landed in the right rooms",
        intro:
          "Spending on ads is easy; the business question is whether they reached people who can actually buy. Innovatr sells research to senior decision-makers at banks, insurers and consumer brands, so the first test of the paid programme is not clicks — it is LinkedIn's own delivery demographics.",
        items: [
          {
            value: "61%",
            label: "Of delivery reached decision-makers",
            context:
              "Senior 35%, Director 14%, VP 4%, C-suite 3%, Owner 4%, Partner 1%. Entry-level profiles: under 3%.",
          },
          {
            value: "14 of 22",
            label: "Top companies by delivery were targets",
            context:
              "Absa, FNB, Standard Bank, Nedbank, Capitec, Discovery, Investec, Old Mutual and Santam among them — the exact institutions the research sells to. PwC, EY and Deloitte fill most of the rest.",
          },
          {
            value: "16.9%",
            label: "Of delivery into banking & finance",
            context:
              "The best-covered target vertical: top five in every single ad set, and it completed videos at 2–4× the average rate.",
          },
          {
            value: "56%",
            label: "In the three target metros",
            context:
              "Johannesburg 38%, Pretoria 10%, Durban 8% — the geography Innovatr sells into.",
          },
        ],
        footnote:
          "All from LinkedIn's delivery demographics for the account, April–July 2026. This is the part of paid media spend cannot fake, and it is what made a small budget worth anything: nearly two-thirds of every rand landed on someone senior enough to sign off a study.",
      },
      {
        id: "results",
        kind: "trend",
        heading: "Leads grew, and got better every month",
        intro:
          "Inbound lead-form leads by month — count and quality together, because the count alone says nothing. The programme ran in short creative flights, and each flight tightened who the forms were put in front of.",
        measure: "Inbound leads",
        rows: [
          {
            label: "Apr 2026",
            value: 10,
            display: "10",
            note: "Broad launch flight. Forms captured personal emails — only ~27% corporate.",
          },
          {
            label: "May 2026",
            value: 12,
            display: "12",
            note: "Creative eras tested head to head; forms rebuilt to require work email and phone.",
          },
          {
            label: "Jun 2026",
            value: 2,
            display: "2",
            note: "Between flights — that month's ads pointed at traffic and video, not lead forms.",
          },
          {
            label: "Jul 2026",
            value: 28,
            display: "28",
            note: "Refined vertical flight: 91% work emails, and 9 of the newest 11 squarely in the ICP.",
          },
        ],
        footnote:
          "Work-email share climbed from ~27% at launch to ~75% mid-programme to 91% in the newest cohort — the audience refinement showing up in the pipeline itself. Leads are deliberately not set against the total media budget: that budget was buying four different jobs at once, which the next section separates.",
      },
      {
        id: "results",
        kind: "metrics",
        heading: "One budget, four jobs — each judged on its own",
        intro:
          "Judging the whole media budget on leads would be wrong, because most of it was never pointed at leads. The spend split across four formats with four different jobs: video bought attention, carousels bought site conversions, static bought cheap clicks, and only the lead-gen documents bought leads. So each format is scored on the job it was given, against LinkedIn's own B2B benchmarks.",
        items: [
          {
            value: "R252",
            label: "Per lead — lead-gen spend only",
            context:
              "16 leads from R4,037 of dedicated lead-gen budget in the measured flight, against a ~R744 gated median. Form completion ran 46–57% against a 10–13% benchmark.",
          },
          {
            value: "34",
            label: "Site conversions — the carousels' job",
            context: "23 of them from the value-proposition carousels alone.",
          },
          {
            value: "44–48%",
            label: "Video view rate — the videos' job",
            context: "Against a 29.5% benchmark, 15–19 points over.",
          },
          {
            value: "R14.79",
            label: "Blended cost per click, account-wide",
            context: "Against a ~R92 B2B market average, across 1.03M impressions.",
          },
        ],
        footnote:
          "Reported honestly: no flight ran longer than five weeks against LinkedIn's six to eight week optimisation runway, so these are pre-optimisation numbers. A June conversion tag counting view-throughs is excluded throughout.",
      },
      {
        id: "results",
        kind: "metrics",
        heading: "Every benchmark, side by side",
        intro:
          "The account against LinkedIn's own published B2B norms, plus the email programme against standard B2B email benchmarks. One number missed, and it is shown with the rest — a scorecard that only ever shows wins is a brochure.",
        items: [
          {
            value: "R218",
            label: "CPM vs ~R559 norm",
            context: "61% cheaper per thousand impressions.",
          },
          {
            value: "R44",
            label: "Flight CPC vs ~R92 norm",
            context: "52% cheaper per click on the measured flight.",
          },
          {
            value: "R252",
            label: "CPL vs ~R744 gated median",
            context: "A third of market — and ~R1,984 is the EMEA norm.",
          },
          {
            value: "4.6–5.3%",
            label: "Lead-gen engagement rate",
            context: "Against a ~0.5% non-video benchmark — roughly nine times it.",
          },
          {
            value: "44–48%",
            label: "Video view rate vs 29.5%",
            context: "15–19 points over the platform norm.",
          },
          {
            value: "36.7% / 4.1%",
            label: "Email opens / clicks vs ~30–35% / ~2.5%",
            context:
              "The onboarding sequence, bot-filtered; the outreach sequence opened at 61.5%.",
          },
        ],
        footnote:
          "The miss, reported with the wins: carousel CTR ran 0.32% against a 0.40–0.55% band — the one format below benchmark, which is why the recommendation was to keep carousels on the conversion job they were winning rather than the click job they were losing. And the email programme's zero replies across both sequences is in the next chapter's reflection, because it is the finding that matters most.",
      },
      {
        id: "results",
        kind: "metrics",
        heading: "And the leads were the right people",
        intro:
          "The count matters less than who filled the forms in. From the lead-form exports, assessed on work-email capture, seniority and ICP fit:",
        items: [
          {
            value: "~25 of 52",
            label: "Call-first tier",
            context:
              "Work-email leads at ICP accounts with decision-layer titles — the leads a salesperson actually phones.",
          },
          {
            value: "91%",
            label: "Work emails, newest cohort",
            context:
              "Up from ~27% in the launch era. The refinement is visible in the pipeline itself.",
          },
          {
            value: "9 of 11",
            label: "Newest cohort inside the ICP",
            context:
              "Senior research, strategy and CX roles at exactly the institutions being targeted.",
          },
        ],
        footnote:
          "Among them, by role: CX management at Capitec, market research at FNB, business analysis at Old Mutual, a risk and compliance executive at Vodacom Financial Services, business development at Cardinal Insurance Management Systems, the head of marketing at Warwick Wine Estate, the chief executive of Bed King and the product lead at SnapScan. Roles from the lead-form exports; no names published.",
      },
      {
        id: "results",
        kind: "checklist",
        heading: "What the four months proved",
        items: [
          "Costs beat the market in every era, on both broad and strict decision-maker targeting.",
          "Lead generation produced contactable pipeline in every single flight it appeared in.",
          "Insight-led messaging won everywhere it ran, in ads and in organic alike.",
          "Spend and results moved together: the highest-spend month was also the highest-lead month.",
          "Format, not message, decided performance. The same line was the best video and the weakest carousel.",
        ],
      },
      {
        id: "product",
        kind: "prose",
        heading: "The product: Social Sweep",
        body: [
          "Innovatr was about to licence a social listening platform at US$8,000 a year. I built the capability in-house instead: platform APIs feeding an AI reasoning layer, prototyped in Replit and built out with Claude.",
          "Social Sweep takes a plain-language question — “How do South Africans talk about Chinese car brands versus German ones?” — works out which platforms are worth reading for that particular question, and returns an organised report in which every claim resolves back to a real comment. Net sentiment, emotion mix, where the conversation actually lives, what is spiking, and the quotes underneath all of it. It runs on the Social Crawl API, so the reachable surface is 46 platforms across social, search, commerce and the open web.",
          "That turned a line of annual cost into a line of product. The same engine Innovatr would have rented became something it could sell, positioned at R20,000 a study.",
        ],
      },
      {
        id: "product",
        kind: "metrics",
        heading: "What building it instead of buying it was worth",
        items: [
          {
            value: "US$8,000/yr",
            label: "Licence cost replaced",
            context: "The quoted annual price of the third-party tool it stood in for.",
          },
          {
            value: "R20,000",
            label: "Priced per study",
            context: "Positioned as a billable Innovatr product, not internal tooling.",
          },
          {
            value: "46",
            label: "Platforms reachable",
            context:
              "Through the Social Crawl API it runs on: social, search, commerce and the open web.",
          },
        ],
        footnote:
          "R20,000 is the price the product was positioned at, not revenue booked. The licence figure is the quote Innovatr was working from at the time. Platform count is Social Crawl's current published coverage, 46 platforms across 368 endpoints; Social Sweep selects the right subset per question rather than querying all of them.",
      },
      {
        id: "product",
        kind: "gallery",
        wide: true,
        shots: [
          {
            image: "innovatr/social_sweep_landing.jpg",
            alt: "Social Sweep's question screen: one plain-language box, a time range, an option to enrich with web search, and the eight platforms it listens across, with a trends radar below.",
          },
          {
            image: "innovatr/social_sweep_report.jpg",
            alt: "A finished Social Sweep report on Chinese versus German car brands in South Africa, leading with net sentiment, comments analysed, loudest emotion and an executive summary with key takeaways.",
          },
          {
            image: "innovatr/social_sweep_charts.jpg",
            alt: "The evidence view: overall sentiment split, which platform carries the conversation, sentiment over time with spikes flagged, and a ranked emotion mix.",
          },
        ],
        heading: "Inside the tool",
      },
      {
        id: "product",
        kind: "prose",
        heading: "What I'd do differently",
        body: [
          "Start the call motion sooner. The nurture data said it plainly: the email sequences earned 36–62% open rates against a ~30% benchmark and produced zero replies — opens prove interest, and the absence of replies proves email alone cannot convert it. Warm leads sat unworked while the machine that found them kept improving. If I ran it again, a human follow-up call within 48 hours would exist from the first lead, not as a recommendation in the final report.",
        ],
      },
    ],
    seo: {
      title: "Innovatr case study | Alroy Ndhlovu",
      description:
        "How Alroy Ndhlovu rebuilt Innovatr's positioning, website, content engine and paid programme, sourced a 3,094-contact market, and built the social listening product the business now sells.",
    },
  },
  {
    slug: "hakkan",
    name: "Hakkan",
    dates: "Jul 2026 – present",
    summary:
      "Built a content research tool to fight AI slop — one where every claim traces to a real person saying a real thing, and the tool is engineered so it cannot quietly make things up.",
    description:
      "Hakkan (発刊, “to publish”) is a research-first content tool. Give it a topic and it reads the actual conversation — Reddit, TikTok, X, YouTube, the open web — then hands you a visual report with receipts, and helps you build content from that research in your own voice. This is the story of why it exists and what it took to make “no slop” true rather than a tagline.",
    tags: ["Product build", "AI engineering", "UX", "Research"],
    meta: ["Own product", "Solo: product, design, code, copy", "Jul 2026 – present"],
    strip: [
      { image: "products/hakkan-research.jpg", alt: "Hakkan's search screen." },
      { image: "products/hakkan-report.jpg", alt: "A Hakkan report with receipts." },
      { image: "products/hakkan-visual-report.jpg", alt: "The visual report view." },
      { image: "products/hakkan-personas.jpg", alt: "Persona view." },
    ],
    chapters: [
      { id: "why", label: "Why it exists" },
      { id: "how", label: "How it works" },
      { id: "hard", label: "The hard part" },
      { id: "honest", label: "Honest by construction" },
      { id: "screens", label: "The screens" },
    ],
    blocks: [
      {
        id: "why",
        kind: "prose",
        heading: "The problem: content stopped knowing anything",
        body: [
          "After more than a decade in marketing and content, I watched the medium slide from insightful to what everyone now calls AI slop — fluent text that reads fine and knows nothing, generated from a blank page and a guess. The tools caused it: every AI writer starts from nothing and asks the model to fill the void.",
          "Hakkan inverts that. It starts from research — thousands of real posts, articles and comments matched to your question — and treats that research as the source of truth the content must be built from. The model is never allowed to be the source. People are.",
          "The name carries the philosophy: Hakkan (発刊) is Japanese for “to publish”, and said aloud it echoes “harken” — to listen closely. Listen first, then publish. The design borrows from paper and the markers we abused during study, because the product’s whole argument is that the oldest publishing values still apply.",
        ],
      },
      {
        id: "how",
        kind: "prose",
        heading: "How it works: research → report → your voice",
        body: [
          "You give Hakkan a topic or a question. It fans out across social platforms and the open web, gathers the conversation, filters it for relevance, and builds a visual report: themes categorised, sentiment weighed, angles ranked, and every quote cited to the person who said it. From there you can export the research, or generate content from it — in a persona trained on your own writing, at a format and length you choose.",
          "The balance is deliberate. Automation does the reaching and consolidating; the taste, the opinions and the final voice stay human. Some work is left manual on purpose, because the mistakes and the opinions are the part of content that connects.",
        ],
      },
      {
        id: "how",
        kind: "trend",
        heading: "What one report is actually made of",
        intro:
          "A real shipped report, on 2026 World Cup commercialisation: 965 items cited, 903 of them real voices — comments, posts and transcripts from people, not publications.",
        measure: "Items cited",
        rowLabel: "Source",
        rows: [
          {
            label: "Open web",
            value: 900,
            display: "900",
            note: "Articles and pages, reached through search APIs.",
          },
          {
            label: "Google News",
            value: 30,
            display: "30",
            note: "The press layer, kept separate from opinion.",
          },
          {
            label: "Reddit",
            value: 21,
            display: "21",
            note: "Where the arguments actually happen.",
          },
          {
            label: "YouTube",
            value: 5,
            display: "5",
            note: "Transcripts, so video voices are quotable.",
          },
          {
            label: "Perplexity",
            value: 4,
            display: "4",
            note: "Synthesis, weighted low on purpose.",
          },
          { label: "Instagram", value: 4, display: "4", note: "" },
          { label: "Pinterest", value: 1, display: "1", note: "" },
        ],
        footnote:
          "The mix is chosen per question, not fixed: a travel question reaches TripAdvisor, a developer question reaches Hacker News, without a code change. Depth is a user choice, not a limit the tool invents.",
      },
      {
        id: "hard",
        kind: "prose",
        heading: "The hard part: teaching the filter to value people",
        body: [
          "The promise is “what people actually said”, and the first version of the evidence filter quietly betrayed it. A verbose article restates the topic in its own headline, so it scored high; a real reply — “Why need a nanny if I won’t have a job” — is short, oblique and contextual, so it read as off-topic and died. The filter was killing exactly the material the product sells.",
          "The fix was a rubric that judges a comment as a comment: replies answer the thing they reply to, not your search query, so relevance is scored in context, and only spam, bots and meta-chatter score zero. Rewritten on principle, then measured once — not tuned to the target.",
        ],
      },
      {
        id: "hard",
        kind: "trend",
        heading: "Human voice in the evidence, measured at every stage",
        intro:
          "The bar was set at 40% of cited items being real human utterances. Getting there took four attempts — including catching our own test harness lying to us.",
        measure: "Voice ratio",
        rowLabel: "Stage",
        rows: [
          {
            label: "First measure",
            value: 12,
            display: "12%",
            note: "Later invalidated: a test flag was replaying cached data instead of searching live. Caught, documented, runs deleted.",
          },
          {
            label: "Live streaming",
            value: 29,
            display: "29%",
            note: "Real runs, streamed comments arriving. Better — and still losing voices in the filter.",
          },
          {
            label: "Facts added",
            value: 19,
            display: "19%",
            note: "More article evidence diluted the voices. The filter was the bottleneck, now provable.",
          },
          {
            label: "Filter rewritten",
            value: 57,
            display: "57%",
            note: "Comments judged as comments: 81 real voices cited in the acceptance run, against the 40% bar.",
          },
        ],
        footnote:
          "The 12% row stays in this chart deliberately. The measurement was taken on replayed fixture data a flag had switched on, and the moment that was discovered it was written down and the affected runs were deleted. A tool that sells honesty has to be built by a process that practises it.",
      },
      {
        id: "honest",
        kind: "metrics",
        heading: "Honest by construction",
        intro:
          "“No slop” is enforced in code, not tone of voice. The product refuses whole categories of fabrication that competing tools happily ship:",
        items: [
          {
            value: "3-way",
            label: "Every number is classified",
            context:
              "Grounded in the research, drawn from your own writing, or derived by the model — and only the third is flagged for you to judge. Flagged, never blocked: only the author knows which figures they stand behind.",
          },
          {
            value: "0",
            label: "Virality predictions",
            context:
              "Refused outright. With no outcome data to train on, a prediction is a made-up number beside real citations. Hakkan shows what did break out, measured against each platform's median.",
          },
          {
            value: "“of the N voices here”",
            label: "Every claim is scoped",
            context:
              "60% of the voices in a report being frustrated is measured and true; “60% of people” is neither. The copy states the scope, never an apology.",
          },
        ],
        footnote:
          "Same rule inside the business: the tool was built against a hard cost-per-run ceiling enforced in code, so the research depth users get is sustainable for them and for us — priced to be worth it on both sides, without a single invented limit.",
      },
      {
        id: "screens",
        kind: "gallery",
        heading: "The screens",
        wide: true,
        shots: [
          {
            image: "products/hakkan-research.jpg",
            alt: "Hakkan's search screen: one question box, depth and time-range controls, and the platforms it listens across.",
          },
          {
            image: "products/hakkan-report.jpg",
            alt: "A finished report: 965 items cited, 903 real voices, themes and sentiment with the receipts one tap away.",
          },
          {
            image: "products/hakkan-visual-report.jpg",
            alt: "The visual report, charting where the evidence and the sentiment diverge.",
          },
          {
            image: "products/hakkan-personas.jpg",
            alt: "Personas: Hakkan trained on your own writing, so the output sounds like you rather than like a model.",
          },
        ],
      },
      {
        id: "screens",
        kind: "prose",
        heading: "What I'd do differently",
        body: [
          "Read the reference images before building the report page. The first version was built from a written summary of the design references and came out as a 7,600-pixel essay — thirteen sections, ten screens of scroll — when every actual reference was a card grid with a headline-metric band. A day was spent learning that a doc's summary of an image loses exactly the thing that mattered.",
          "And I would batch the evidence filter from day one. Scoring every item in a single model call worked until streaming delivered what we were paying for, at which point the call outgrew its own timeout and killed runs that had already spent money. The fix — small batches, bounded parallelism — was always the right architecture; it just wasn't the first one.",
          "Worth naming what solo meant here: product, design, code and copy are mine, with AI-assisted engineering doing the accelerating and a set of third-party research APIs doing the reaching. The judgement calls — and the mistakes above — are all mine.",
        ],
      },
    ],
    seo: {
      title: "Hakkan case study | Alroy Ndhlovu",
      description:
        "Building a content research tool to fight AI slop: how Hakkan grounds every claim in real human voices, measures its own honesty, and refuses to invent numbers.",
    },
  },
  {
    slug: "inspiritintruth",
    name: "InSpiritInTruth",
    dates: "Jul 2026 – present",
    summary:
      "Brought personalisation to the devotional — a format that has not changed in decades — and engineered it so that an app quoting scripture can never quietly misquote it.",
    description:
      "InSpiritInTruth is a devotional app for imperfect journeys — the overwhelmed, the curious, the unchurched, the devoted. The daily devotional format has looked the same for generations: one text, written for everyone, read alone. ISIT keeps that shared rhythm and adds something the format has never had — a devotional written for exactly what you are carrying today.",
    tags: ["Product build", "Personalisation", "UX", "AI engineering"],
    meta: ["Own product", "Solo: product, design, code, copy", "Jul 2026 – present"],
    strip: [
      { image: "products/isit-home.png", alt: "ISIT home screen." },
      { image: "products/isit-personalise.png", alt: "The personalisation step." },
      { image: "products/isit-devotionals.png", alt: "Devotionals tab." },
      { image: "products/isit-discover.png", alt: "Discover by theme." },
      { image: "products/isit-bible.png", alt: "The in-app Bible." },
      { image: "products/isit-profile.png", alt: "Reading streak." },
    ],
    chapters: [
      { id: "why", label: "Why it exists" },
      { id: "how", label: "The personalisation" },
      { id: "care", label: "Care for the text" },
      { id: "screens", label: "The screens" },
    ],
    blocks: [
      {
        id: "why",
        kind: "prose",
        heading: "A format that never changed",
        body: [
          "The devotional is one of the oldest content formats there is: a passage, a reflection, a prayer, the same page for every reader. That sameness is part of its comfort — and its limit. The person navigating faith outside church walls, the one struggling to stay consistent, the one carrying something specific today: the format has never been able to meet any of them where they actually are.",
          "ISIT keeps everything worth keeping — a weekly devotional written by a person and meant to be read slowly, the whole Bible in the app, no algorithm, no ads — and adds the thing the format never had. You share what you are going through, and it writes a devotional for exactly that, in the moment you need it.",
        ],
      },
      {
        id: "how",
        kind: "prose",
        heading: "Personalisation with a safety net",
        body: [
          "Generated spiritual guidance is a higher-stakes writing task than most AI products ever face. The register has to carry spiritual authority without hallucinated certainty, which shaped every model decision: the generators run on the model that reviewers consistently rank first for restraint, coherence and emotional depth — because in this register, restraint is the feature and “creative risk” is the failure mode. A cheaper, edgier model was evaluated on the real prompt and turned down, twice.",
          "And nothing generated reaches a reader unverified. Every tailored devotional passes through a fact-check that searches the live web to verify its claims before publication — a pass that deliberately costs several times more than the writing itself.",
        ],
      },
      {
        id: "how",
        kind: "trend",
        heading: "Where the AI effort goes",
        intro:
          "The share of machine effort behind one tailored devotional. Most AI products spend everything on generation; ISIT spends most of it making sure the generation told the truth.",
        measure: "Share of effort",
        rowLabel: "Stage",
        rows: [
          {
            label: "Writing",
            value: 22,
            display: "~22%",
            note: "The devotional itself, drafted from what you shared.",
          },
          {
            label: "Verifying",
            value: 77,
            display: "~77%",
            note: "Live web-search fact-checking of every claim, before a reader ever sees it.",
          },
          {
            label: "Reflecting",
            value: 1,
            display: "~1%",
            note: "The closing reflection pass.",
          },
        ],
        footnote:
          "That ratio is a choice, and it was priced deliberately: subscriptions are set where the checking pass stays affordable at real usage, so the product is sustainable for the business without ever cutting the verification to protect a margin.",
      },
      {
        id: "care",
        kind: "metrics",
        heading: "Care for the text",
        intro:
          "An app that quotes scripture carries a special obligation: the words on screen must be exactly what they claim to be. Three of the rules that came out of the build:",
        items: [
          {
            value: "Label + text",
            label: "Move together, always",
            context:
              "A verse's translation label is only ever updated when its text was actually re-fetched in that translation. The bug this rule killed: a failed fetch publishing NKJV wording tagged “NET” — a lie a reader can never detect.",
          },
          {
            value: "Device date",
            label: "Not the server's, not UTC",
            context:
              "The daily verse broke three times by rolling over on UTC midnight instead of the reader's own — showing tomorrow's verse at 1am. Now a hard rule with the reproduction documented.",
          },
          {
            value: "No italics",
            label: "In scripture passages",
            context:
              "Retired across the app: emphasis the original text does not carry is editorialising. The passage is presented as written.",
          },
        ],
        footnote:
          "Design follows the same discipline — the devotional hero is bottom-anchored and ratio-sized, the type system is two families rather than three, and generated devotionals draw from a closed, server-enforced set of themes rather than whatever a model invents.",
      },
      {
        id: "screens",
        kind: "gallery",
        heading: "The screens",
        shots: [
          {
            image: "products/isit-home.png",
            alt: "Home: the week's devotional and the verse of the day.",
          },
          {
            image: "products/isit-personalise.png",
            alt: "The personalisation step — what are you walking through today?",
          },
          {
            image: "products/isit-devotionals.png",
            alt: "Devotionals, including one written for you.",
          },
          {
            image: "products/isit-discover.png",
            alt: "Discover: browsing by theme, Faith to Gratitude.",
          },
          {
            image: "products/isit-bible.png",
            alt: "The in-app Bible with highlight, note and save.",
          },
          {
            image: "products/isit-profile.png",
            alt: "Profile, with a reading streak that encourages without gamifying.",
          },
        ],
      },
      {
        id: "screens",
        kind: "prose",
        heading: "What I'd do differently",
        body: [
          "Define “today” on day one. The daily verse rolled over on UTC midnight instead of the reader's own clock, and that one wrong assumption shipped three separate times before it became a written rule with the reproduction documented. Any app with daily content should decide whose midnight it honours before writing the first query.",
          "And I would measure the cost of honesty before pricing it, not after. The fact-check pass turned out to dominate the machine cost of a tailored devotional — several times the writing itself — which was the right design but was discovered after the subscription price was set, forcing the sums to be redone in the open. Instrument first, price second.",
        ],
      },
    ],
    seo: {
      title: "InSpiritInTruth case study | Alroy Ndhlovu",
      description:
        "Bringing personalisation to the devotional: how InSpiritInTruth writes for what you are carrying today, and the engineering that keeps generated scripture honest.",
    },
  },
  {
    slug: "tapa",
    name: "tapa.",
    dates: "Jul 2026 – present",
    summary:
      "Built an app you could use every day and kept it radically simple — one question in, one good answer out — because life needs more simple, and simplicity is the discipline, not the shortcut.",
    description:
      "tapa. answers one question: “what can I cook with this?” Tell it or show it what you have, say how long you want to cook and for how many people, and it gives you one well-considered recipe. Not fifty search results. One good answer. The case study is about what keeping something that simple actually costs.",
    tags: ["Product build", "UX", "Simplicity", "Pricing"],
    meta: ["Own product", "Solo: product, design, code, copy", "Jul 2026 – present"],
    strip: [
      { image: "products/tapa-home.jpg", alt: "tapa. home." },
      { image: "products/tapa-generate.jpg", alt: "Entering ingredients." },
      { image: "products/tapa-recipe.jpg", alt: "A generated recipe." },
      { image: "products/tapa-cooking.jpg", alt: "Cooking mode." },
    ],
    chapters: [
      { id: "why", label: "Why it exists" },
      { id: "simple", label: "Simple on purpose" },
      { id: "fair", label: "Fair on purpose" },
      { id: "screens", label: "The screens" },
    ],
    blocks: [
      {
        id: "why",
        kind: "prose",
        heading: "The mental load nobody prices in",
        body: [
          "Eating is a basic need, and deciding what to eat is somehow the most mentally taxing part of the day. First you work out what you have, then what could be made from it, and because that is monotonous you end up cooking the same three things forever. Recipe sites answer the question with fifty results and a life story above each one — which is more deciding, not less.",
          "tapa. deletes the decision. Type, say, or photograph what is in the fridge, set a time and a serving count, and get one recipe tailored to your tastes. Allergies and dietary needs are set once and enforced as hard rules on every generation — a safety constraint, not a preference.",
        ],
      },
      {
        id: "simple",
        kind: "metrics",
        heading: "Simple on purpose",
        intro:
          "Every number in the product is small, and each one is a decision to leave something out:",
        items: [
          {
            value: "3 → 1",
            label: "Ways in, answers out",
            context:
              "Type it, say it, or photograph it — and one recipe comes back. Choice is the load the app exists to remove, so it never returns a list.",
          },
          {
            value: "1×",
            label: "Set your constraints once",
            context:
              "Allergies, dietary rules, household size, skill — captured in onboarding, applied to every recipe after, editable any time.",
          },
          {
            value: "3",
            label: "Recipes of history",
            context:
              "Enough to go back to last night, not enough to become a database you manage. Favourites are saved deliberately or not at all.",
          },
        ],
        footnote:
          "The same discipline runs through the engineering: when a second account on a shared phone could see the first account's recipes, the fix was ownership at the data layer — every row belongs to an account, not a device — rather than a patch on the sign-out path.",
      },
      {
        id: "fair",
        kind: "trend",
        heading: "Finding the free tier honestly",
        intro:
          "A simple app still has to sustain itself. The free allowance was tuned in public view of the numbers — how often people actually cook, what competing apps give away — and the journey is worth showing because each move had a reason.",
        measure: "Free recipes per week",
        rowLabel: "Iteration",
        rows: [
          {
            label: "Launch",
            value: 3,
            display: "3",
            note: "Generous — but the median cook makes 3–4 dinners a week, so free covered everything and the question of upgrading never arrived.",
          },
          {
            label: "Revision",
            value: 1,
            display: "1",
            note: "Too far the other way. Live for roughly an hour before the reasoning was rechecked.",
          },
          {
            label: "Settled",
            value: 2,
            display: "2",
            note: "Real weekly value free, and anyone cooking regularly meets the upgrade question at a genuine moment of need.",
          },
        ],
        footnote:
          "The aim was an exchange that is fair in both directions — worth it for the user, sustainable for the business — set from how people actually cook rather than from hope. And a matching honesty rule ships in the code: upsell copy is derived from the configuration that enforces it, so the app can only ever promise what it actually delivers.",
      },
      {
        id: "screens",
        kind: "gallery",
        heading: "The screens",
        shots: [
          {
            image: "products/tapa-home.jpg",
            alt: "Home: today's suggestion, saved recipes, totals.",
          },
          {
            image: "products/tapa-generate.jpg",
            alt: "What's in your fridge? Type it, scan it, or say it.",
          },
          {
            image: "products/tapa-recipe.jpg",
            alt: "One recipe: time, difficulty, nutrition, allergens flagged.",
          },
          { image: "products/tapa-cooking.jpg", alt: "Cooking mode, one step at a time." },
        ],
      },
      {
        id: "screens",
        kind: "prose",
        heading: "What I'd do differently",
        body: [
          "Own the data properly from the first schema. Local recipes belonged to the phone, not the account, until a TestFlight tester signed into a fresh account and saw someone else's saved recipes. The fix — every row owned by a user, enforced at the data layer — was always the right design; it should not have taken a stranger's recipe list to prove it.",
          "And I would research the free tier before launch rather than in public. It moved from three recipes a week to one to two inside two days — each step reasoned and documented, but the cooking-frequency data that settled it existed all along. The habit this project actually taught me: check how people already behave before deciding what to charge them for.",
        ],
      },
    ],
    seo: {
      title: "tapa. case study | Alroy Ndhlovu",
      description:
        "Building something for every day and keeping it simple: how tapa. answers “what can I cook with this?” with one good recipe, and prices the exchange fairly.",
    },
  },
];

/**
 * Studies that are planned but not written. Named on the overview so
 * the section reads as a body of work in progress rather than as one
 * case study, but deliberately not rendered as cards: a card that looks
 * clickable and is not is worse than an honest line of text.
 */
export const UPCOMING_STUDIES: { name: string; note: string }[] = [
  { name: "Lumiskin", note: "Design exploration — a cosmetics hero, from blank page to polish" },
];

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return CASE_STUDIES.find((study) => study.slug === slug);
}
