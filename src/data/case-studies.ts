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
  /**
   * The moving image strip on the section 06 overview card (PRD §6.05).
   * A spread of the work rather than the best six shots: a reader
   * scanning the card should see the range before they see the detail.
   */
  strip: { image: string; alt: string }[];
  /** Anchored sub-navigation, in page order. */
  chapters: { id: string; label: string }[];
  blocks: (Block & { id?: string })[];
  seo: { title: string; description: string };
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "innovatr",
    name: "Innovatr",
    dates: "Mar 2026 – Sep 2026",
    summary:
      "Took a research business with no paid presence to a 3,172-contact pipeline and 52 inbound leads, at roughly a third of the market's cost per lead.",
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
        heading: "Turning reports into content",
        intro:
          "Innovatr was sitting on the raw material for its own marketing. Every study it ran produced findings nobody outside the client ever saw. The content engine broke those reports into carousels that argue a point and show the evidence, which is the same job the product does.",
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
          "Paid was one channel into a much bigger audience-building effort. Alongside the ads I sourced, enriched and de-duplicated the addressable market itself: partner databases, ICP prospecting, the network, and inbound signups. Those lists then fed back into the ads as matched audiences, so targeting was built from real firmographics rather than LinkedIn's interest guesses.",
        items: [
          {
            value: "3,172",
            label: "Unique contacts sourced",
            context: "Across every channel, de-duplicated by email. 1,940 distinct organisations.",
          },
          {
            value: "1,739",
            label: "From partner databases",
            context: "Workshop17 member organisations, matched to LinkedIn for audience targeting.",
          },
          {
            value: "666",
            label: "ICP prospects via Apollo",
            context: "Enriched and segmented by vertical, including hospitality and real estate.",
          },
          {
            value: "687",
            label: "LinkedIn and CRM contacts",
            context: "Company page followers and engaged contacts, exported and cleaned.",
          },
          {
            value: "79",
            label: "IAN network",
            context: "Innovatr's own channel, brought into the CRM.",
          },
          {
            value: "43",
            label: "Inbound members",
            context: "Signups to the membership tiers, free and paid.",
          },
        ],
        footnote:
          "Counted by unique email address across all sources, so nobody is counted twice. Partner and prospecting lists are sourced audience, not inbound enquiries; the 52 below is the separate, stricter count of people who raised their hand through a paid lead form.",
      },
      {
        id: "results",
        kind: "metrics",
        heading: "Results",
        intro:
          "Four months, from no paid presence at all. These are the paid numbers specifically, taken from the July 2026 account report and measured against published B2B benchmarks rather than against themselves.",
        items: [
          {
            value: "52",
            label: "Inbound leads from paid",
            context: "From zero. 28 of them in July, the strongest month on record.",
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
          "Social Sweep takes a plain-language question — “How do South Africans talk about Chinese car brands versus German ones?” — listens across Facebook, X, TikTok, Reddit, YouTube, Instagram, LinkedIn and Threads, and returns an organised report in which every claim resolves to a real comment. Net sentiment, emotion mix, where the conversation lives, what is spiking, and the quotes underneath all of it.",
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
            value: "8",
            label: "Platforms listened to",
            context: "Facebook, X, TikTok, Reddit, YouTube, Instagram, LinkedIn and Threads.",
          },
        ],
        footnote:
          "R20,000 is the price the product was positioned at, not revenue booked. The licence figure is the quote Innovatr was working from at the time.",
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
        "How Alroy Ndhlovu took Innovatr from no paid presence to a 3,172-contact pipeline and 52 inbound leads, at roughly a third of the market's cost per lead.",
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
  { name: "Thrifty Adventures", note: "Social design, ad design, ad results" },
  { name: "Hakkan", note: "Research-first AI writing, built end to end" },
  { name: "InSpiritInTruth", note: "A devotional app, design through release" },
];

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return CASE_STUDIES.find((study) => study.slug === slug);
}
