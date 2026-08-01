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
  | { kind: "gallery"; heading: string; intro?: string; shots: { image: string; alt: string }[] }
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
      "Took a research business with no paid presence to 52 qualified leads in four months, at roughly a third of the market's cost per lead.",
    description:
      "Innovatr is a consumer research and growth consultancy. I joined as Brand & Marketing Manager and rebuilt the front of the business: the positioning, the website, the content engine that turns research into demand, and the paid programme underneath it.",
    tags: ["Rebranding", "Content", "Paid media", "Marketing automation"],
    meta: ["Client · Innovatr", "Brand & Marketing Manager", "Mar – Sep 2026"],
    chapters: [
      { id: "start", label: "The starting point" },
      { id: "branding", label: "Brand & website" },
      { id: "content", label: "Reports into content" },
      { id: "ads", label: "Ad creative" },
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
        id: "results",
        kind: "metrics",
        heading: "Results",
        intro:
          "Four months, from no paid presence at all. Every figure below is from the July 2026 account report and is measured against published B2B benchmarks rather than against itself.",
        items: [
          {
            value: "52",
            label: "Qualified leads",
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
        kind: "pending",
        heading: "The product",
        note: "Social Sweep, the social listening tool built during the engagement. Screenshots to come from Alroy.",
      },
    ],
    seo: {
      title: "Innovatr case study | Alroy Ndhlovu",
      description:
        "How Alroy Ndhlovu took Innovatr from no paid presence to 52 qualified leads in four months, at roughly a third of the market's cost per lead.",
    },
  },
];

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return CASE_STUDIES.find((study) => study.slug === slug);
}
