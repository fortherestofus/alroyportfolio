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
const files = import.meta.glob<{ default: ImageMetadata }>(
  "../assets/case-studies/**/*.{png,jpg,jpeg,webp,avif}",
  { eager: true },
);

const byPath = new Map<string, ImageMetadata>();
for (const [path, module] of Object.entries(files)) {
  const key = path.split("/assets/case-studies/")[1];
  if (key) byPath.set(key, module.default);
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
          "Paid was one channel into a much bigger audience-building effort. A business selling research to decision-makers has to know who those decision-makers are, and Innovatr did not have a list. So I built one: ICP prospecting through Apollo, the shared Workshop17 tenant database, direct client sourcing, and inbound signups. Those lists then fed back into the ads as matched audiences, so targeting ran on real firmographics rather than on LinkedIn's guesses about interests.",
        items: [
          {
            value: "3,094",
            label: "Unique contacts sourced",
            context: "Across every source, de-duplicated by email. 1,272 distinct organisations.",
          },
          {
            value: "2,405",
            label: "Sourced and enriched",
            context:
              "Apollo ICP prospecting plus the Workshop17 tenant database, matched to LinkedIn for targeting.",
          },
          {
            value: "787",
            label: "Client sourcing",
            context: "Direct outreach and engagement lists, built and maintained in the CRM.",
          },
          {
            value: "687",
            label: "LinkedIn",
            context: "The company page audience, exported and cleaned as its own list.",
          },
          {
            value: "43",
            label: "Inbound members",
            context: "Signups to the membership tiers, free and paid.",
          },
        ],
        footnote:
          "Counted by unique email address across all sources, so nobody is counted twice, and the sub-totals overlap by design rather than summing to the headline. This is sourced and matched audience, not inbound enquiries — a distinction worth making, because plenty of reporting does not.",
      },
      {
        id: "results",
        kind: "metrics",
        heading: "Results",
        intro:
          "Four months and R63,336 of total media, from no paid presence at all. Small money and a short runway, which is the context every number below should be read in: these are the paid results specifically, taken from the July 2026 account report and measured against published B2B benchmarks rather than against themselves.",
        items: [
          {
            value: "52",
            label: "Inbound leads from paid",
            context:
              "From zero, on R63,336 of total media across four months. 28 of them in July alone.",
          },
          {
            value: "R216–265",
            label: "Cost per lead",
            context: "Against a ~R744 gated-content median. Roughly a third of market.",
          },
          {
            value: "R14.79",
            label: "Blended cost per click",
            context: "Against a ~R92 market average across four months.",
          },
          {
            value: "46–57%",
            label: "Lead form completion",
            context: "Against a 10–13% platform benchmark, so four to five times it.",
          },
          {
            value: "+45–50%",
            label: "Video CTR over benchmark",
            context: "Best pairing was The Innovatr Way as video, at 0.677% CTR.",
          },
          {
            value: "23 of 39",
            label: "Site conversions from one format",
            context: "Value proposition carousels carried the majority of conversions.",
          },
        ],
        footnote:
          "Reported honestly: no flight ran longer than five weeks against LinkedIn's six to eight week optimisation runway, so these are pre-optimisation numbers. A June conversion tag counting view-throughs is excluded throughout.",
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
    ],
    seo: {
      title: "Innovatr case study | Alroy Ndhlovu",
      description:
        "How Alroy Ndhlovu rebuilt Innovatr's positioning, website, content engine and paid programme, sourced a 3,094-contact market, and built the social listening product the business now sells.",
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
  { name: "Hakkan", note: "Research-first AI writing, built end to end" },
  { name: "InSpiritInTruth", note: "A devotional app, design through release" },
];

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return CASE_STUDIES.find((study) => study.slug === slug);
}
