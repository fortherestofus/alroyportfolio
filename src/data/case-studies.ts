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
      /**
       * Keep each capture at its own proportions instead of the screen
       * frame. For device mocks, where a crop cuts off the phone.
       */
      natural?: boolean;
      pairs: { before: string; after: string; label: string; alt: string }[];
    }
  | {
      kind: "gallery";
      heading: string;
      intro?: string;
      /** Web captures rather than square social slides: fewer, larger. */
      wide?: boolean;
      /**
       * One per row at the image's own proportions, never cropped. For
       * artwork whose edges matter, like a logo lockup: `wide` frames
       * everything to a screen ratio and trims what does not fit.
       */
      natural?: boolean;
      /**
       * Full-height 9:16 covers, two across on a phone and all in one
       * row from tablet up. The auto-fill grid would wrap four of them
       * as three and one.
       */
      stories?: boolean;
      /**
       * Two per row. For captures that are evidence rather than
       * artwork — a dashboard shown full width is bigger than its
       * source can support and reads as blurry, and nobody needs an
       * analytics panel at 1,100px to believe it.
       */
      pair?: boolean;
      /**
       * Show the captures in a device frame sized to what they are
       * pictures of, rather than stretched across a grid cell. A phone
       * screenshot at card width is a 700px-tall slab that reads as a
       * poster; at handset width it reads as an app.
       */
      device?: "phone" | "panel";
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
  /**
   * A clip inside the argument. Silent by construction — these sit in
   * the middle of prose someone is reading, so the file itself carries
   * no audio track rather than an audio track behind a mute button.
   */
  | {
      kind: "video";
      heading?: string;
      intro?: string;
      /** Path under public/, written by `npm run video`. */
      src: string;
      /** Poster still, keyed like every other case study image. */
      poster: string;
      alt: string;
      /**
       * A phone-shaped clip. Every other video here is a landscape
       * capture that runs the content column; left to do the same, a
       * 9:16 clip renders about 1,600px tall and turns one paragraph of
       * the argument into a full screen of video. Capped and centred
       * instead.
       */
      portrait?: boolean;
      footnote?: string;
    }
  | { kind: "pending"; heading: string; note: string };

export type Focus = "brand" | "product" | "marketing";

export interface CaseStudy {
  slug: string;
  name: string;
  /**
   * Which story this is, which decides both where it lives and what it
   * has to prove.
   *
   * "client" is work done for a business, and the case it makes is the
   * value that came back — these are the cards in section 06. "product"
   * is something Alroy built and owns, where the case is the building
   * itself: the problem, the trials, the solution. Those enter through
   * their card in section 05 instead of taking a second card of their
   * own, because one body of work listed in two sections reads as two
   * bodies of work counted once each.
   */
  kind: "client" | "product";
  dates: string;
  /** Outcome first. This is the line that has to earn the click. */
  summary: string;
  description: string;
  tags: string[];
  /**
   * Which of the three disciplines the work evidences, for the filter
   * on the overview. A hirer for one of them should reach their proof
   * in one click rather than reading past the other two.
   */
  focus?: Focus[];
  meta: string[];
  website?: string;
  /** Filename in src/assets/logos, badged as a circular client mark. */
  logoFile?: string;
  /**
   * The image or clip the page opens on.
   *
   * Every study used to start on a wall of text, which reads as bland
   * before a word of it has been judged — the work is visual and the
   * top of the page was the one place not showing any of it. A clip is
   * used where the thing being described actually moves; otherwise the
   * single most representative still.
   */
  hero?: {
    /** Keyed like every other case study image, e.g. `slug/file.jpg`. */
    image: string;
    alt: string;
    /** Path under public/ when the hero should play rather than sit. */
    video?: string;
    /**
     * Constrain the hero to the shape of the thing it pictures. A
     * browser-extension popup opened to full column width is four
     * times the size it is ever seen at, and reads as a blown-up
     * screenshot rather than as the product.
     */
    device?: "phone" | "panel";
  };
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
    slug: "social-sweep",
    name: "Social Sweep",
    kind: "client",
    dates: "Mar 2026 – Sep 2026",
    hero: {
      image: "innovatr/social_sweep_report.jpg",
      alt: "A finished Social Sweep report on Chinese versus German car brands in South Africa, leading with net sentiment, comments analysed and an executive summary.",
    },
    summary:
      "Replaced a US$5,000-a-year licence with a tool I built. Now sold in every Innovatr membership.",
    description:
      "An AI social listening tool I proposed, built and maintained for Innovatr while running its marketing.",
    tags: ["Build vs buy", "Product strategy", "AI product", "Research tooling"],
    focus: ["product"],
    logoFile: "innovatr.jpg",
    meta: ["Client · Innovatr", "Product lead: planned, built and maintained", "Mar – Sep 2026"],
    strip: [
      { image: "innovatr/social_sweep_landing.jpg", alt: "Social Sweep's question screen." },
      { image: "innovatr/social_sweep_report.jpg", alt: "A finished Social Sweep report." },
      { image: "innovatr/social_sweep_charts.jpg", alt: "The Social Sweep evidence view." },
    ],
    chapters: [
      { id: "decision", label: "Building instead of buying" },
      { id: "product", label: "The product" },
      { id: "worth", label: "Savings" },
      { id: "screens", label: "Inside the tool" },
      { id: "next", label: "Do differently" },
    ],
    blocks: [
      {
        id: "decision",
        kind: "prose",
        heading: "Building instead of buying",
        body: [
          "Innovatr was about to sign a US$5,000-a-year social listening contract. I proposed building a tool instead and delivered it in three months: platform APIs feeding an AI analysis layer, prototyped in Replit and built with Claude.",
        ],
      },
      {
        id: "product",
        kind: "prose",
        heading: "How it works",
        body: [
          "You ask a question in plain language. The tool picks the relevant platforms and returns a report in which every claim links to a real comment, with no dashboards or boolean search queries to learn.",
        ],
      },
      {
        id: "worth",
        kind: "metrics",
        heading: "Savings and revenue",
        items: [
          {
            value: "US$5k",
            label: "Saved in licence fees, every year",
            context: "The quote it replaced. Building it in-house cost under R10,000.",
          },
          {
            value: "R6.5–15k",
            label: "A month, for the memberships that include it",
            context:
              "Three reports in Starter, unlimited in Unlimited, alongside Innovatr's other research tools.",
          },
          {
            value: "49",
            label: "Platforms reachable",
            context:
              "Social, search, commerce, reviews and the open web. Each study queries only what the question needs.",
          },
        ],
        footnote: "Prices from Innovatr's published membership tiers.",
      },
      {
        id: "screens",
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
        id: "next",
        kind: "prose",
        heading: "What I'd do differently",
        body: [
          "I'd also sell it on its own, outside the memberships, so its revenue could be measured separately.",
        ],
      },
    ],
    seo: {
      title: "Social Sweep case study | Alroy Ndhlovu",
      description:
        "How Alroy Ndhlovu talked Innovatr out of a US$5,000-a-year social listening licence and built the tool in-house, now sold in every Innovatr membership.",
    },
  },
  {
    slug: "innovatr",
    name: "Innovatr",
    kind: "client",
    dates: "Mar 2026 – Sep 2026",
    hero: {
      image: "innovatr/web-home-after.jpg",
      alt: "The rebuilt Innovatr home page, leading with the consumer-intelligence positioning.",
    },
    summary: "61% of ad delivery on decision-makers, at a third of the B2B median cost per lead.",
    description:
      "Rebrand, website, CRM, email and LinkedIn Ads for a consumer research company, in seven months.",
    tags: ["Rebranding", "Content", "Paid media", "Lead sourcing", "Marketing automation"],
    focus: ["brand", "marketing"],
    logoFile: "innovatr.jpg",
    meta: ["Client · Innovatr", "Brand & Marketing Manager", "Mar – Sep 2026"],
    strip: [
      { image: "innovatr/web-home-after.jpg", alt: "The rebuilt Innovatr home page." },
      { image: "innovatr/carousel-way-1.png", alt: "“Old research is dead” ad carousel cover." },
      { image: "innovatr/carousel-research-4.png", alt: "Research carousel slide." },
      {
        image: "innovatr/carousel-drinking-1.png",
        alt: "Research carousel on generational drinking habits.",
      },
      { image: "innovatr/web-tools-after.jpg", alt: "The rebuilt tools section." },
      {
        image: "innovatr/carousel-research-3.png",
        alt: "“Fast. Smart. Affordable.” positioning slide.",
      },
      { image: "innovatr/carousel-drinking-5.png", alt: "Research carousel slide." },
      { image: "innovatr/web-casestudy-after.jpg", alt: "The rebuilt case study section." },
    ],
    chapters: [
      { id: "start", label: "The starting point" },
      { id: "branding", label: "Brand & website" },
      { id: "content", label: "Reports into content" },
      { id: "ads", label: "Ad creative" },
      { id: "pipeline", label: "Marketing system" },
      { id: "results", label: "Results" },
      { id: "honest", label: "What didn't work" },
      { id: "next", label: "Do differently" },
    ],
    blocks: [
      {
        id: "start",
        kind: "prose",
        heading: "The starting point",
        body: [
          "The website led with “Stop Guessing. Launch Better Innovation.”, a generic line that didn't explain what made the product different. There was no paid advertising and very little inbound interest.",
        ],
      },
      {
        id: "branding",
        kind: "beforeAfter",
        heading: "Brand and website",
        intro:
          "The new positioning led with “Old research is dead. Stop being told. Start asking why.”, followed directly by proof points.",
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
          "Innovatr's studies produced findings that only clients saw. I turned them into public content that states a finding and shows the data behind it.",
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
            alt: "“Fast. Smart. Affordable.”: 24 hour insights, from R3k per concept, a 44M consumer panel.",
          },
        ],
      },
      {
        id: "ads",
        kind: "gallery",
        heading: "Ad creative",
        intro:
          "The ad campaign “The Innovatr Way” compared Innovatr with traditional research firms and their six-week turnarounds and six-figure study costs.",
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
        kind: "metrics",
        heading: "Same message, two formats",
        intro:
          "“The Innovatr Way” ran as both a carousel and a video with the same message. The video performed far better.",
        items: [
          {
            value: "0.68%",
            label: "Click-through as video",
            context: "Against 0.24% for the same message as a carousel, nearly three times higher.",
          },
          {
            value: "+45–50%",
            label: "Video click-through over the platform norm",
            context:
              "The video ads beat LinkedIn's video benchmark; the carousel fell below its own.",
          },
        ],
        footnote:
          "Same account and message, so the difference came from the format. Video was then used for awareness.",
      },
      {
        id: "pipeline",
        kind: "metrics",
        heading: "Building the marketing system",
        intro:
          "There was no list of potential buyers. We built one in a CRM and connected it to email, LinkedIn Ads and remarketing, so the ads targeted named companies.",
        items: [
          {
            value: "0 → live",
            label: "CRM built in six months",
            context: "Contacts from every source, de-duplicated by email and segmented.",
          },
          {
            value: "Account-based",
            label: "Targeting on named organisations",
            context:
              "The market was mapped company by company to make account-based targeting possible. Volumes are confidential.",
          },
        ],
        footnote:
          "This was a sourced audience rather than inbound enquiries. LinkedIn's delivery data below shows the ads reached these companies.",
      },
      {
        id: "pipeline",
        kind: "gallery",
        heading: "Email sequences",
        intro:
          "Every lead from the ads entered an email sequence. I wrote and designed each email; this one was sent under the founder's name.",
        pair: true,
        shots: [
          {
            image: "innovatr/email-old-research-1.jpg",
            alt: "The top half of an Innovatr email headed “Old research is dead. And most brands still haven't noticed.”, a letter from the founder followed by what one traditional study costs a South African brand: R500K–R900K for focus groups, R350K–R1.2M for a quant study and six to ten weeks to deliver.",
          },
          {
            image: "innovatr/email-old-research-2.jpg",
            alt: "The bottom half of the same email: the old way against the Innovatr way side by side, a “40x faster” callout, three market stats, the company's proof numbers, a teaser for the next email and a “See the Innovatr Way” button.",
          },
        ],
      },
      {
        id: "pipeline",
        kind: "metrics",
        heading: "Email results",
        items: [
          {
            value: "36.7%",
            label: "Opens, onboarding sequence",
            context: "Against a 30% target and a typical B2B rate of 30–35%.",
          },
          {
            value: "4.1%",
            label: "Clicks, onboarding sequence",
            context: "Against a 3% target and a typical B2B rate of about 2.5%.",
          },
          {
            value: "61.5%",
            label: "Opens, outreach sequence",
            context: "Close to double the typical B2B rate.",
          },
        ],
        footnote:
          "Zoho Campaigns, sent to leads from LinkedIn, April–July 2026. Bot opens filtered out.",
      },
      {
        id: "results",
        kind: "metrics",
        heading: "Who the ads reached",
        intro:
          "LinkedIn's delivery data shows whether the ads reached people with the authority to commission a study.",
        items: [
          {
            value: "61%",
            label: "Of delivery reached decision-makers",
            context: "Senior, Director, VP, C-suite, Owner and Partner. Entry-level: under 3%.",
          },
          {
            value: "14 of 22",
            label: "Top companies by delivery were targets",
            context:
              "Major South African banks, insurers and consultancies. Names are confidential.",
          },
          {
            value: "56%",
            label: "In the three target metros",
            context: "Johannesburg, Pretoria and Durban, the geography Innovatr sells into.",
          },
        ],
        footnote: "LinkedIn delivery demographics, April–July 2026.",
      },
      {
        id: "results",
        kind: "trend",
        heading: "Lead quality by campaign flight",
        intro:
          "Each short campaign flight narrowed the audience. Lead quality is measured as the share of leads using a work email; lead counts are confidential.",
        measure: "Work-email share of leads",
        rows: [
          {
            label: "Launch flight",
            value: 27,
            display: "~27%",
            note: "Broad targeting, personal emails accepted. Forms then rebuilt to require a work email.",
          },
          {
            label: "Refined flight",
            value: 91,
            display: "91%",
            note: "Industry targeting on the mapped accounts. Most new leads matched the ideal customer profile (ICP).",
          },
        ],
        footnote: "Lead counts and budget are confidential.",
      },
      {
        id: "results",
        kind: "metrics",
        heading: "Costs against LinkedIn benchmarks",
        intro:
          "Video was used for awareness and carousels for conversions. Each is compared with LinkedIn's published B2B benchmarks.",
        items: [
          {
            value: "~3×",
            label: "Better cost per lead than the B2B median",
            context:
              "A third of LinkedIn's published B2B median cost per lead. The actual figure is confidential.",
          },
          {
            value: "52%",
            label: "Cheaper per click than the norm",
            context:
              "Compared with LinkedIn's published B2B click costs, and lower again across the whole account.",
          },
          {
            value: "61%",
            label: "Cheaper per thousand impressions",
            context:
              "Against the published CPM norm, sustained across more than a million impressions.",
          },
          {
            value: "44–48%",
            label: "Video view rate vs 29.5%",
            context: "15–19 points over the platform norm.",
          },
        ],
        footnote:
          "Form completion was 46–57% against a 10–13% benchmark. No flight ran longer than five weeks, which is short for LinkedIn's optimisation, so these are early results.",
      },
      {
        id: "honest",
        kind: "prose",
        heading: "What didn't work",
        body: [
          "Organic posts reached few people; paid ads delivered about 166 times the impressions. The emails beat every open and click benchmark but got no replies, and each pause between flights reset LinkedIn's learning phase.",
        ],
      },
      {
        id: "next",
        kind: "prose",
        heading: "What I'd do differently",
        body: [
          "I'd assign someone to call new leads from the first flight, and run fewer, longer flights. Cold leads needed a phone call more than another email.",
        ],
      },
    ],
    seo: {
      title: "Innovatr case study | Alroy Ndhlovu",
      description:
        "How Alroy Ndhlovu helped rebrand Innovatr and built its paid and CRM engine, with ad delivery landing on decision-makers at a third of the B2B cost per lead.",
    },
  },
  {
    slug: "thrifty-adventures",
    name: "Thrifty Adventures",
    kind: "client",
    dates: "Jul 2025 – Jan 2026",
    hero: {
      image: "thrifty-adventures/hero-social.jpg",
      alt: "A grid of Thrifty Adventures tour posts covering Turkey, Europe, Zanzibar and Egypt.",
    },
    summary: "Lead forms at 3× the LinkedIn norm, and 3.1 million organic views on TikTok.",
    description:
      "Paid and organic marketing for a South African tour operator across LinkedIn, TikTok and Google.",
    tags: ["Paid media", "Organic social", "Search", "Lead generation", "Channel strategy"],
    focus: ["marketing"],
    logoFile: "thrifty.jpeg",
    meta: [
      "Client · Thrifty Adventures",
      "Contract Digital Marketing Manager",
      "Jul 2025 – Jan 2026",
    ],
    chapters: [
      { id: "start", label: "Starting point" },
      { id: "testing", label: "Testing" },
      { id: "offer", label: "The brochure" },
      { id: "results", label: "LinkedIn results" },
      { id: "tiktok", label: "TikTok" },
      { id: "google", label: "Search" },
      { id: "mix", label: "Channel roles" },
      { id: "honest", label: "What didn't work" },
      { id: "next", label: "Do differently" },
    ],
    blocks: [
      {
        id: "start",
        kind: "prose",
        heading: "Starting point",
        body: [
          "The company had social media accounts but no paid campaigns or tracking. LinkedIn seemed an unlikely channel for personal holidays, but seven months of results showed it worked, for a different reason than I expected.",
        ],
      },
      {
        id: "testing",
        kind: "trend",
        heading: "Reach up 47× while costs fell each month",
        intro:
          "I started with a small budget, tested four campaign objectives side by side, then moved budget to the best performers.",
        measure: "Reach, indexed to July",
        rows: [
          {
            label: "Jul 2025",
            value: 1,
            display: "1×",
            note: "The baseline. New ad accounts pay the highest costs.",
          },
          { label: "Aug 2025", value: 8.2, display: "8×", note: "Clicks 58% cheaper than July." },
          {
            label: "Sep 2025",
            value: 22.8,
            display: "23×",
            note: "Four objectives tested. The first wave of leads.",
          },
          {
            label: "Oct 2025",
            value: 22.1,
            display: "22×",
            note: "Conversions and video in.",
          },
          {
            label: "Nov 2025",
            value: 20.1,
            display: "20×",
            note: "Cut back to the winners.",
          },
          {
            label: "Dec 2025",
            value: 47.8,
            display: "48×",
            note: "Scaled. CPM down 73% from July.",
          },
          {
            label: "Jan 2026",
            value: 47.2,
            display: "47×",
            note: "Cheapest month: clicks 70% cheaper than July, CPM down 81%.",
          },
        ],
        footnote:
          "Reach is indexed to month one; impressions and spend are confidential. Part of the cost drop comes from the account maturing.",
      },
      {
        id: "offer",
        kind: "metrics",
        heading: "The brochure offer",
        intro:
          "Two ads ran to the same audience with the same form. One asked people to enquire; the other offered the 2026 brochure.",
        items: [
          {
            value: "36.6%",
            label: "Form completion, brochure",
            context: "Against 8.6% on the identical form with nothing to collect at the end.",
          },
          {
            value: "10–15%",
            label: "The LinkedIn norm",
            context: "The brochure ran at more than double the top of that range.",
          },
          {
            value: "73%",
            label: "Of all leads came from the brochure ask",
            context: "The brochure ad produced most of the account's leads.",
          },
          {
            value: "+39%",
            label: "Cost per lead, everything else",
            context: "Other ads cost about 40% more per lead. Actual costs are confidential.",
          },
        ],
        footnote: "Only the offer changed, and it improved results more than any other test.",
      },
      {
        id: "results",
        kind: "metrics",
        heading: "LinkedIn results",
        intro: "Starting with no paid presence on LinkedIn.",
        items: [
          {
            value: "0.97%",
            label: "Click-through vs 0.52% median",
            context: "Nearly double the median across 150,000+ LinkedIn campaigns.",
          },
          {
            value: "70%",
            label: "Cheaper clicks by the end",
            context: "What a landing page click cost in month seven versus month one.",
          },
          {
            value: "81%",
            label: "CPM fall across the run",
            context: "What a thousand impressions cost in month seven versus month one.",
          },
          {
            value: "16",
            label: "Campaigns across six objectives",
            context: "Seven months on LinkedIn, with all spend tracked.",
          },
        ],
        footnote:
          "Landing page clicks, not LinkedIn's headline Clicks column. Median: AgencyAnalytics, January 2025. Spend and lead counts stay with the client.",
      },
      {
        id: "tiktok",
        kind: "metrics",
        heading: "3.1 million views, and 38% of them from search",
        intro:
          "TikTok already had an audience, so the focus was search. Destination videos were captioned with the questions people search for, which keeps older posts getting views.",
        items: [
          {
            value: "38.1%",
            label: "Of views came from search",
            context: "People searching for a destination found Thrifty's videos.",
          },
          {
            value: "3.1M",
            label: "Views, organic",
            context: "Jun 2025 to Jan 2026, with 25K profile visits and 29K likes.",
          },
          {
            value: "7,200",
            label: "Shares",
            context: "Shares are a strong engagement signal on TikTok.",
          },
        ],
        footnote: "June 2025 – January 2026.",
      },
      {
        id: "tiktok",
        kind: "metrics",
        heading: "TikTok ads for conversations",
        intro:
          "Each ad featured one destination, with the aim of starting a message conversation. The test ran for one week, measured by cost per conversation.",
        items: [
          {
            value: "Cheapest",
            label: "Qualified contact in the account",
            context: "Averaged across all nine videos. Costs are confidential.",
          },
          {
            value: "9",
            label: "Destination videos in one week's test",
            context:
              "Each measured by cost per conversation, so the best performers were clear within days.",
          },
          {
            value: "43%",
            label: "Of conversations from the best video",
            context: "Bali and Thailand, at about the account's average cost per conversation.",
          },
        ],
        footnote:
          "TikTok's figures, 30 Jan – 6 Feb 2026. Bookings from those conversations were never tracked.",
      },
      {
        id: "google",
        kind: "metrics",
        heading: "Google Ads",
        intro:
          "Google Ads reached people already searching for tours, at the lowest cost per click.",
        items: [
          {
            value: "~99%",
            label: "Below the travel median cost per click",
            context:
              "Against the $2.14 median in the 2026 benchmark set. The actual cost is confidential.",
          },
          {
            value: "8.04%",
            label: "Account click-through rate",
            context:
              "Against a 9.32% search median. The display campaign carried 18.12% on its own.",
          },
          {
            value: "6",
            label: "Campaigns, Jun 2025 to Feb 2026",
            context: "Search, display and Performance Max, each on its own job.",
          },
        ],
        footnote:
          "WordStream's 2026 US benchmarks. Most volume came from display and Performance Max, and South African clicks cost less, so part of the difference is the market.",
      },
      {
        id: "mix",
        kind: "checklist",
        heading: "The role of each channel",
        intro: "Each channel worked best at a different stage of the booking decision.",
        items: [
          "TikTok organic content builds awareness and keeps getting views for months.",
          "TikTok ads start conversations, at the lowest cost per qualified contact in the account.",
          "Google Ads reaches people already comparing trips, with the cheapest clicks.",
          "LinkedIn sells larger, planned trips, with the highest cost per contact and the most serious enquiries.",
          "Content didn't transfer between channels: the destination video that started conversations on TikTok drew 0.10% click-through as a LinkedIn ad.",
        ],
      },
      {
        id: "honest",
        kind: "prose",
        heading: "What didn't work",
        body: [
          "Brand awareness campaigns produced the most expensive clicks, ten times the cheapest month, and single-destination videos underperformed. Tracking problems on both platforms meant bookings couldn't be linked to specific ads.",
        ],
      },
      {
        id: "next",
        kind: "prose",
        heading: "What I'd do differently",
        body: [
          "I'd fix conversion tracking before spending the first rand. I could prove cost and reach on every channel, but not which one filled a tour.",
        ],
      },
    ],
    seo: {
      title: "Thrifty Adventures case study | Alroy Ndhlovu",
      description:
        "How Alroy Ndhlovu built four channels for a South African travel brand, and why the offer mattered more than the audience.",
    },
  },
  {
    slug: "hakkan",
    name: "Hakkan",
    kind: "product",
    dates: "Jul 2026 – present",
    hero: {
      image: "products/hakkan-report.jpg",
      alt: "A Hakkan report: 965 items cited and 903 real voices across seven platforms, with the sentiment split beneath.",
    },
    summary:
      "A research and writing assistant that turns what people are saying about a topic into a cited report, then helps you write from it in your own voice.",
    description:
      "Hakkan (発刊, “to publish”) collects online discussion about a topic into a cited report, then helps you write from it in your own voice.",
    tags: ["Product build", "AI engineering", "UX", "Content discovery"],
    meta: [
      "Own product",
      "Solo: product, design and copy, built with coding agents",
      "Jul 2026 – present",
    ],
    strip: [
      { image: "products/hakkan-research.jpg", alt: "Hakkan's search screen." },
      { image: "products/hakkan-report.jpg", alt: "A Hakkan report with receipts." },
      { image: "products/hakkan-visual-report.jpg", alt: "The visual report view." },
      { image: "products/hakkan-personas.jpg", alt: "Persona view." },
    ],
    chapters: [
      { id: "why", label: "Why it exists" },
      { id: "how", label: "How it works" },
      { id: "hard", label: "Evidence filter" },
      { id: "honest", label: "Quality rules" },
      { id: "screens", label: "The screens" },
    ],
    blocks: [
      {
        id: "why",
        kind: "prose",
        heading: "Why it exists",
        body: [
          "Since late 2024, more new articles have been written by AI than by people (Graphite, 2025), and much of it has no real sources. Hakkan starts from real discussions, and the AI model is never used as a source.",
        ],
      },
      {
        id: "how",
        kind: "prose",
        heading: "How it works",
        body: [
          "Enter a topic and it builds a visual report of themes and sentiment, with every quote cited. You then write from the report in a voice learned from your own writing.",
        ],
      },
      {
        id: "how",
        kind: "metrics",
        heading: "Where it listens",
        intro:
          "Searching every source for every question is slow and expensive and returns mostly noise, so Hakkan picks sources for each question.",
        items: [
          {
            value: "Per question",
            label: "Source selection",
            context: "Each question is split into sub-queries, and only relevant sources are kept.",
          },
          {
            value: "Then deeper",
            label: "Specialist sources",
            context:
              "It adds sources the main search misses, such as review sites for travel and Hacker News for developers.",
          },
          {
            value: "Yours",
            label: "Adjustable depth",
            context: "The user sets how wide and how far back each search goes.",
          },
        ],
      },
      {
        id: "hard",
        kind: "prose",
        heading: "Improving the evidence filter",
        body: [
          "The first evidence filter removed too many real comments: long articles scored high, while a short reply like “Why need a nanny if I won’t have a job” was marked off-topic. The fix was to judge each comment against the post it replies to.",
        ],
      },
      {
        id: "hard",
        kind: "trend",
        heading: "Human sources in citations",
        intro:
          "The target was for 40% of citations to come from real people rather than publications. It took four attempts.",
        measure: "Voice ratio",
        rowLabel: "Stage",
        rows: [
          {
            label: "First measure",
            value: 12,
            display: "12%",
            note: "Invalidated: a test flag was replaying cached data instead of searching live.",
          },
          {
            label: "Live streaming",
            value: 29,
            display: "29%",
            note: "Live runs. Better, but the filter still removed real comments.",
          },
          {
            label: "Facts added",
            value: 19,
            display: "19%",
            note: "More article sources lowered the share of human comments. The filter was the bottleneck.",
          },
          {
            label: "Filter rewritten",
            value: 57,
            display: "57%",
            note: "Comments judged in context. Well above the target.",
          },
        ],
        footnote: "Measured on live runs against a 40% target set before the work started.",
      },
      {
        id: "honest",
        kind: "metrics",
        heading: "Quality rules",
        intro: "Quality rules are enforced in code. Three are built into the product:",
        items: [
          {
            value: "3-way",
            label: "Labelled numbers",
            context:
              "Every number is marked as sourced, from your writing, or model-derived. Model-derived numbers are flagged.",
          },
          {
            value: "0",
            label: "No virality predictions",
            context:
              "Without outcome data it won't predict virality. It shows what has already performed well instead.",
          },
          {
            value: "Scoped",
            label: "Sample sizes stated",
            context: "Claims say “60% of the voices in this report”, never “60% of people”.",
          },
        ],
        footnote:
          "A fixed cost limit per run is also enforced in code to keep the service affordable to run.",
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
    ],
    seo: {
      title: "Hakkan — how I built it | Alroy Ndhlovu",
      description:
        "Building a content discovery and creation assistant to fight AI slop: cited reports as the source of truth, content in your own voice, and no invented numbers.",
    },
  },
  {
    slug: "inspiritintruth",
    name: "InSpiritInTruth",
    kind: "product",
    dates: "Jul 2026 – present",
    hero: {
      image: "inspiritintruth/hero-screens.jpg",
      alt: "Three InSpiritInTruth screens: the devotionals library, the home screen, and the in-app Bible.",
    },
    summary:
      "A devotional app that writes a devotional for what you're going through and checks every scripture reference. 131 active users and a 5.0 App Store rating.",
    description:
      "Made for people at every stage of faith. It keeps the shared daily readings and adds personal devotionals.",
    tags: ["Product build", "Personalisation", "UX", "AI engineering"],
    meta: [
      "Own product",
      "Solo: product, design and copy, built with coding agents",
      "Jul 2026 – present",
    ],
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
      { id: "how", label: "Fact-checking" },
      { id: "signal", label: "Early signal" },
      { id: "screens", label: "The screens" },
    ],
    blocks: [
      {
        id: "why",
        kind: "prose",
        heading: "Why it exists",
        body: [
          "Barna found that 56% of Christians say their spiritual life is entirely private, yet devotionals are written the same for everyone. ISIT includes the shared readings and the Bible, and writes a devotional for each person's situation.",
        ],
      },
      {
        id: "how",
        kind: "prose",
        heading: "Checking every devotional",
        body: [
          "Every devotional is fact-checked against live web search before anyone reads it. I tested a cheaper model twice and rejected it both times.",
        ],
      },
      {
        id: "how",
        kind: "trend",
        heading: "Where the AI effort goes",
        intro:
          "Most of ISIT's AI processing goes into checking the generated text rather than writing it.",
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
        footnote: "Verification is the one cost I won't reduce to improve margins.",
      },
      {
        id: "signal",
        kind: "metrics",
        heading: "Early signal",
        intro:
          "It's early, and the main question is whether people want a devotional written for them.",
        items: [
          {
            value: "131",
            label: "Active users in the last 28 days",
            context: "Across iOS and Android, from launch in late August.",
          },
          {
            value: "5.0",
            label: "App Store rating, six reviews",
            context: "Four of the six reviews mention its simplicity and two the personalisation.",
          },
          {
            value: "2",
            label: "Paying subscribers in two months",
            context: "Since launch in late August, with a useful free tier.",
          },
        ],
        footnote: "RevenueCat and App Store Connect, read 3 November 2026.",
      },
      {
        id: "screens",
        kind: "gallery",
        heading: "The screens",
        device: "phone",
        shots: [
          {
            image: "products/isit-home.png",
            alt: "Home: a devotional chosen for you, and the verse of the day.",
          },
          {
            image: "products/isit-personalise.png",
            alt: "The personalisation step: what are you walking through today?",
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
    ],
    seo: {
      title: "InSpiritInTruth — how I built it | Alroy Ndhlovu",
      description:
        "Complementing tradition with the personal side of faith: how InSpiritInTruth writes for what you are carrying today, and the engineering that keeps it honest.",
    },
  },
  {
    slug: "tapa",
    name: "tapa.",
    kind: "product",
    dates: "Jul 2026 – present",
    hero: {
      image: "tapa/hero-screens.jpg",
      alt: "Three tapa. screens: entering what is in the fridge, the home screen, and a finished recipe.",
    },
    summary:
      "A recipe app that suggests one meal from the ingredients you have, within your dietary rules.",
    description:
      "It answers one question: “What can I cook with this?” Type, say or photograph your ingredients and get one recipe back.",
    tags: ["Product build", "UX", "Simplicity", "Pricing"],
    meta: [
      "Own product",
      "Solo: product, design and copy, built with coding agents",
      "Jul 2026 – present",
    ],
    strip: [
      { image: "products/tapa-home.jpg", alt: "tapa. home." },
      { image: "products/tapa-generate.jpg", alt: "Entering ingredients." },
      { image: "products/tapa-recipe.jpg", alt: "A generated recipe." },
      { image: "products/tapa-cooking.jpg", alt: "Cooking mode." },
    ],
    chapters: [
      { id: "why", label: "Why it exists" },
      { id: "simple", label: "Design choices" },
      { id: "fair", label: "Free tier" },
      { id: "screens", label: "The screens" },
    ],
    blocks: [
      {
        id: "why",
        kind: "prose",
        heading: "Why it exists",
        body: [
          "68% of Americans say deciding what to eat is their biggest mealtime challenge (Wakefield Research). tapa. makes the decision: show it your fridge and get one meal that fits your diet.",
        ],
      },
      {
        id: "simple",
        kind: "metrics",
        heading: "Kept simple",
        intro: "The app is deliberately limited:",
        items: [
          {
            value: "3 → 1",
            label: "Three inputs, one recipe",
            context: "Type, speak or take a photo, and get one recipe back.",
          },
          {
            value: "1×",
            label: "Settings saved once",
            context:
              "Allergies, diet, household size and skill level are set once and applied to every recipe.",
          },
          {
            value: "3",
            label: "Short recipe history",
            context: "Enough to find last night's meal without managing a library.",
          },
        ],
        footnote:
          "Recipes are stored per account rather than per device, so people sharing a phone don't see each other's history.",
      },
      {
        id: "fair",
        kind: "trend",
        heading: "Setting the free tier",
        intro:
          "The free tier had to be useful without removing the reason to upgrade. It took three changes in two days.",
        measure: "Free recipes per week",
        rowLabel: "Iteration",
        rows: [
          {
            label: "Launch",
            value: 3,
            display: "3",
            note: "The typical cook makes 3–4 dinners a week, so the free tier covered everything.",
          },
          {
            label: "Revision",
            value: 1,
            display: "1",
            note: "Too restrictive. It was live for about an hour before I changed it.",
          },
          {
            label: "Settled",
            value: 2,
            display: "2",
            note: "Useful every week for free; frequent cooks reach the upgrade when they need more.",
          },
        ],
        footnote:
          "Upgrade messages are generated from the same settings that enforce the limits, so they always match what the app does.",
      },
      {
        id: "screens",
        kind: "gallery",
        heading: "The screens",
        device: "phone",
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
    ],
    seo: {
      title: "tapa. — how I built it | Alroy Ndhlovu",
      description:
        "Building something for every day and keeping it simple: how tapa. answers “what can I cook with this?” with one good recipe, and prices the exchange fairly.",
    },
  },
  {
    slug: "caughtslipping",
    name: "CaughtSlipping",
    kind: "product",
    dates: "May 2026 – Jul 2026",
    hero: {
      image: "products/caught-today.jpg",
      alt: "CaughtSlipping's daily verdict: a shame meter, today's total, and a per-site breakdown sorted worst first.",
      device: "panel",
    },
    summary:
      "A Chrome extension that tracks browsing time and flags both procrastination and overwork. 183 installs and one uninstall, with no account or server.",
    description:
      "Phones report screen time, but laptops, where most work and distraction happen, usually don't. CaughtSlipping tracks where your browsing hours go and comments on them with a sarcastic tone.",
    tags: ["Product build", "Chrome extension", "Behaviour design", "Privacy"],
    meta: [
      "Own product",
      "Solo: product, design and copy, built with coding agents",
      "Live on the Chrome Web Store",
    ],
    website: "https://chromewebstore.google.com/detail/ncepfdipljmhbhehjegfemndcgaclnlg",
    strip: [
      { image: "products/caught-today.jpg", alt: "The daily verdict." },
      { image: "products/caught-focus.jpg", alt: "The focus score." },
      { image: "products/caught-work.jpg", alt: "Work Mode." },
      { image: "products/caught-sites.jpg", alt: "Per-site breakdown." },
    ],
    chapters: [
      { id: "why", label: "Why it exists" },
      { id: "hard", label: "Time tracking" },
      { id: "grinding", label: "Work Mode" },
      { id: "free", label: "Paywall" },
      { id: "screens", label: "The screens" },
    ],
    blocks: [
      {
        id: "why",
        kind: "prose",
        heading: "Why it exists",
        body: [
          "Most screen-time tools only target distraction, and most run on phones. CaughtSlipping runs in the browser. It gives a daily verdict, blocks sites once you pass your limit and adds a pause before you go back to them.",
        ],
      },
      {
        id: "hard",
        kind: "prose",
        heading: "Accurate time tracking",
        body: [
          "Chrome marks an hour of video watching as “idle” and logs only three minutes. After four rewrites, the tracker counts time spent watching, ignores forgotten tabs and stops logging when you step away.",
        ],
      },
      {
        id: "grinding",
        kind: "metrics",
        heading: "Caught Grinding: Work Mode",
        intro: "Work Mode adds a Workaholic Check based on health research.",
        items: [
          {
            value: "55h",
            label: "Health threshold",
            context:
              "The WHO and ILO threshold linked to a 35% higher stroke risk. Past it, the verdict changes to workaholic and shows the source.",
          },
          {
            value: "Your hours",
            label: "Your own schedule",
            context:
              "After-hours is based on your working hours, so YouTube at 10am on a Tuesday counts differently from 9pm on a Saturday.",
          },
          {
            value: "0 bytes",
            label: "Private by design",
            context: "No account and no server. Your data never leaves your device.",
          },
        ],
        footnote: "Four verdict tiers, from chill to workaholic.",
      },
      {
        id: "free",
        kind: "prose",
        heading: "Removing the paywall",
        body: [
          "Blocking and limits first launched as paid features, so free users could see the problem but not fix it. I removed licensing and made every feature free.",
        ],
      },
      {
        id: "screens",
        kind: "gallery",
        heading: "The screens",
        device: "panel",
        shots: [
          {
            image: "products/caught-today.jpg",
            alt: "Today's verdict: a shame meter, the daily total and a per-site breakdown, worst first.",
          },
          {
            image: "products/caught-focus.jpg",
            alt: "The focus score: focused-time percentage, a seven-day trend and the longest streak today.",
          },
          {
            image: "products/caught-work.jpg",
            alt: "Work Mode, showing hours focused against the balance check.",
          },
          {
            image: "products/caught-sites.jpg",
            alt: "The full list of sites visited during work mode, each reclassifiable as work or leisure.",
          },
        ],
      },
    ],
    seo: {
      title: "CaughtSlipping — how I built it | Alroy Ndhlovu",
      description:
        "Building a browser extension that holds the procrastinator and the workaholic accountable: honest time tracking, a WHO-anchored overwork check, and no paywall.",
    },
  },
  {
    slug: "filosofee",
    name: "Filosofee",
    kind: "client",
    dates: "2024 – present",
    hero: {
      image: "filosofee/hero-shoot.jpg",
      alt: "Three frames from the Filosofee product shoot: the wordmark hoodie and tees on a plain studio backdrop.",
    },
    summary:
      "A streetwear brand built end to end: sales in month one, then a first wholesale order.",
    description:
      "Range, store, payments, shoot and marketing for a South African streetwear label.",
    tags: ["E-commerce", "Brand", "Product design", "Photography", "AI production"],
    focus: ["brand", "product", "marketing"],
    meta: ["Own brand", "Product, store and growth", "2024 – present"],
    website: "https://www.filosofee.shop",
    strip: [
      { image: "filosofee/hero-shoot.jpg", alt: "" },
      { image: "filosofee/designs.jpg", alt: "" },
      { image: "filosofee/real-vs-ai.jpg", alt: "" },
    ],
    chapters: [
      { id: "build", label: "Building it" },
      { id: "proof", label: "Proof" },
      { id: "media", label: "Imagery" },
      { id: "stickers", label: "Stickers" },
      { id: "next", label: "Do differently" },
    ],
    blocks: [
      {
        id: "build",
        kind: "prose",
        heading: "Everything from range to store",
        body: [
          "I handled every part of the business: the range, the online store, Paystack and PayPal payments, the photography and the marketing.",
        ],
      },
      {
        id: "build",
        kind: "video",
        heading: "The store",
        intro: "Homepage through category to product, as it ships.",
        src: "/media/case-studies/filosofee-site.mp4",
        poster: "filosofee/designs.jpg",
        alt: "The Filosofee storefront scrolling from the homepage hero through the t-shirt and hoodie categories to a product page with size guide and payment options.",
      },
      {
        id: "proof",
        kind: "metrics",
        heading: "Early sales",
        intro: "Two early results showed there was demand.",
        items: [
          {
            value: "Month one",
            label: "First sales",
            context: "Local and international orders through the online store.",
          },
          {
            value: "20 units",
            label: "First bulk order",
            context: "Thrifty Adventures, designed and produced as their branded apparel.",
          },
          {
            value: "2",
            label: "Revenue lines",
            context: "Direct-to-consumer, and business-to-business off the same production setup.",
          },
        ],
        footnote:
          "The numbers are small, but they show people will buy. The bulk order mattered most because it came from a business.",
      },
      {
        id: "proof",
        kind: "prose",
        heading: "First wholesale order",
        body: [
          "A tour operator ordered twenty branded units, Filosofee's first wholesale order. It showed the same production setup could serve business customers, who buy more per order and reorder regularly.",
        ],
      },
      {
        id: "media",
        kind: "prose",
        heading: "Reusing the product shoot",
        body: [
          "The product shoot was the brand's biggest first-year cost and produced its best images. I now use it as the reference for AI-generated imagery, which supplies the volume social media needs in the same look.",
        ],
      },
      {
        id: "media",
        kind: "gallery",
        pair: true,
        heading: "Studio shoot and generated images",
        intro: "Left: the studio shoot. Right: an image generated from it.",
        shots: [
          {
            image: "filosofee/real-vs-ai.jpg",
            alt: "Side by side: a photographed hoodie shot from the studio shoot, and a generated model shot in the same lighting and staging.",
          },
          {
            image: "filosofee/designs.jpg",
            alt: "Three Filosofee graphic tees on hangers: the African Queen print, “may all your delulu come trululu”, and the coffee slogan piece.",
          },
        ],
      },
      {
        id: "stickers",
        kind: "prose",
        heading: "Dropping stickers",
        body: [
          "Stickers took as much packing and courier admin as a hoodie for a fraction of the value, so I dropped them and focused on garments and wholesale.",
        ],
      },
      {
        id: "next",
        kind: "prose",
        heading: "What I'd do differently",
        body: ["I'd pursue wholesale from the start. Businesses buy more per order and reorder."],
      },
    ],
    seo: {
      title: "Filosofee case study | Alroy Ndhlovu",
      description:
        "Building a clothing brand end to end: product, store, payments and photography, proven by first-month sales and a first wholesale order, plus the line I cut.",
    },
  },
  {
    slug: "lumiskin",
    name: "LumiSkin",
    kind: "client",
    dates: "Mar 2026",
    hero: {
      image: "lumiskin/hero-aurora.jpg",
      alt: "The LumiSkin hero: a chameleon shifts to lavender to match the soap beside it as the Aurora Petal card slides in.",
      video: "/media/portfolio/website_video_lumiskin.mp4",
    },
    summary:
      "A premium product site built in a day for under $300, against $6,500+ for a conventional build.",
    description:
      "A concept site for a skincare brand, built in one day with AI tools for under $300.",
    tags: ["Art direction", "AI production", "Front-end", "Motion"],
    focus: ["brand"],
    meta: ["Self-directed", "Build challenge", "Mar 2026"],
    website: "https://deft-pasca-8eec5e.netlify.app",
    strip: [
      { image: "lumiskin/hero-aurora.jpg", alt: "" },
      { image: "lumiskin/collection-aurora.jpg", alt: "" },
      { image: "lumiskin/hero-jade.jpg", alt: "" },
      { image: "lumiskin/hero-peach.jpg", alt: "" },
    ],
    chapters: [
      { id: "dare", label: "The challenge" },
      { id: "idea", label: "The idea" },
      { id: "make", label: "Making it" },
      { id: "cost", label: "What it cost" },
      { id: "build", label: "The build" },
      { id: "next", label: "Do differently" },
    ],
    blocks: [
      {
        id: "dare",
        kind: "prose",
        heading: "The challenge",
        body: [
          "A meme joked that a concept site, with a chameleon changing colour to match the bottle beside it, was too expensive to build because it needed a studio and 3D rendering. I tested whether that was still true and built it in one day for under $300.",
        ],
      },
      {
        id: "dare",
        kind: "video",
        heading: "The meme that started it",
        intro: "The original concept and the meme about it.",
        src: "/media/case-studies/lumiskin-inspiration.mp4",
        poster: "lumiskin/inspiration-poster.webp",
        portrait: true,
        alt: "A split screen: above, a concept site for Chroma Juice where a chameleon shifts through berry, orange and green to match each bottle; below, the canyon-swing meme with two people in blue jackets labelled Programmer and Developer standing over a seated man labelled Designer.",
        footnote:
          "Not my work. Shown for context and credited to @uiux_sumeet, whose watermark is on the clip.",
      },
      {
        id: "idea",
        kind: "prose",
        heading: "The concept",
        body: [
          "I applied the idea to skincare: the chameleon changes to match a soap bar's colour and the matching product card appears. I kept every costly element: a live animal, three colourways, macro shots and a 30-second film.",
        ],
      },
      {
        id: "idea",
        kind: "video",
        heading: "The three colourways",
        intro: "The concept depends on the transition, so it's shown as video.",
        src: "/media/portfolio/website_video_lumiskin.mp4",
        poster: "lumiskin/hero-aurora.jpg",
        alt: "The LumiSkin hero cycling through all three colourways: the chameleon shifts to lavender, pink and amber to match Aurora Petal, Jade Mist and Peach Quartz, each with its product card.",
      },
      {
        id: "make",
        kind: "prose",
        heading: "Generated images and video",
        body: [
          "Nothing was photographed or filmed. I generated the stills first, animated them, then built the site with an agentic IDE. Approving the cheaper stills first avoided regenerating the 30-second film for small errors.",
        ],
      },
      {
        id: "cost",
        kind: "metrics",
        heading: "What it cost",
        intro: "Subscription and per-second pricing only.",
        items: [
          {
            value: "< $300",
            label: "Total cost",
            context:
              "Subscriptions plus generation, including the agentic IDE used to build the site.",
          },
          {
            value: "1 day",
            label: "Start to working site",
            context: "One person, with no crew, studio, animal handler or CGI studio.",
          },
          {
            value: "16 + 24s",
            label: "Generated images and video",
            context:
              "A $20 consumer subscription for the stills; ≈$10 of Veo at its published $0.40/second rate for the film.",
          },
        ],
        footnote:
          "Veo pricing is Google's published API rate; subscriptions are list prices for the tiers actually used. Time is not costed.",
      },
      {
        id: "cost",
        kind: "metrics",
        heading: "Conventional cost estimate",
        intro:
          "Published 2026 market rates for the same three jobs. These are benchmarks, not quotes for this project.",
        items: [
          {
            value: "$6,500+",
            label: "Conservative total",
            context:
              "Using the lowest figure in each range below, and excluding the animal handler this concept would need.",
          },
          {
            value: "$3,000 – $15,000",
            label: "The film, as 3D/CGI",
            context: "A 30-second product commercial at the higher end.",
          },
          {
            value: "$2,000 – $5,900",
            label: "The stills and a studio day",
            context: "16 images at $50–$150 each, plus a commercial product photographer's day.",
          },
          {
            value: "$1,500 – $6,000",
            label: "The site, built out",
            context: "A custom animated landing page, boutique through mid-size agency.",
          },
          {
            value: "~20×",
            label: "Difference",
            context: "Between the cheapest conventional option and the actual cost.",
          },
        ],
        footnote:
          "Sources: 2026 pricing surveys. Those prices also include a crew, usage rights and accountability, so this compares output only.",
      },
      {
        id: "build",
        kind: "prose",
        heading: "How the site was built",
        body: [
          "Built with React 19, Vite and GSAP. AI tools produced the first version quickly and I made the final design decisions. The animation runs on its own timers, so the product cards still appear if the browser blocks autoplay.",
        ],
      },
      {
        id: "next",
        kind: "prose",
        heading: "What I'd do differently",
        body: [
          "I'd track the hours as well as the costs. It took one day, but a client planning a similar project would need exact time figures.",
        ],
      },
    ],
    seo: {
      title: "LumiSkin case study | Alroy Ndhlovu",
      description:
        "A meme said the brief was too expensive to build. A cosmetics hero with a colour-matching chameleon, made in a day for under $300 against $6,500+ without AI.",
    },
  },
  {
    slug: "agentic-content",
    name: "Making content agentically",
    kind: "client",
    dates: "Sep – Oct 2026",
    hero: {
      image: "agentic-content/hero-store-sheet.jpg",
      alt: "Six App Store screenshots for a devotional app in light and dark, each a phone under its own headline.",
    },
    summary: "A logo, an App Store page, two films and covers, made by directing AI tools.",
    description:
      "I directed Claude Code as it worked design and video software over MCP, and reviewed every round.",
    tags: ["Agentic workflow", "MCP", "Branding", "Motion", "Content"],
    focus: ["brand", "marketing"],
    meta: ["Aux Affair, InSpiritInTruth, Culcha", "Solo: direction and QA", "Sep – Oct 2026"],
    strip: [
      { image: "agentic-content/strip-aux.webp", alt: "Aux Affair logo." },
      { image: "agentic-content/strip-afro-culcha.webp", alt: "Afro Culcha cover." },
      { image: "agentic-content/hero-store-sheet.jpg", alt: "App Store screenshots." },
      { image: "agentic-content/strip-lean-back.webp", alt: "Lean Back cover." },
      { image: "agentic-content/isit-promo-poster.webp", alt: "Promo film." },
      {
        image: "agentic-content/strip-spotted-at-culcha.webp",
        alt: "Spotted at Culcha cover.",
      },
      { image: "agentic-content/appstore-header-poster.webp", alt: "App Store header video." },
      { image: "isit-iphone-duo/duo-unfold-poster.webp", alt: "iPhone Duo animation." },
      { image: "agentic-content/strip-culcha-summer.webp", alt: "Culcha Summer cover." },
    ],
    chapters: [
      { id: "approach", label: "The approach" },
      { id: "logo", label: "A logo" },
      { id: "store", label: "App Store page" },
      { id: "promo", label: "Promo film" },
      { id: "duo", label: "iPhone Duo" },
      { id: "posters", label: "Story highlights" },
    ],
    blocks: [
      {
        id: "approach",
        kind: "prose",
        heading: "My role",
        body: [
          "I set the brief and the constraints. Claude Code operated the tools, checked its own renders and fixed problems before showing me. Each piece followed the same process: research, a plan I approved, then rounds of my notes.",
        ],
      },
      {
        id: "approach",
        kind: "checklist",
        heading: "The toolkit",
        items: [
          "Claude Code, as the orchestrator.",
          "VectorCraft and PhotoCraft over MCP, for vector and image work.",
          "xAI's image API and ChatGPT, for generated imagery.",
          "Goldie, for App Store screenshots from a real build.",
          "Remotion, for the header video and the promo film.",
          "Playwright and ffmpeg, for the iPhone Duo animation.",
          "Pinterest, for references.",
        ],
      },
      {
        id: "logo",
        kind: "prose",
        heading: "A logo for Aux Affair",
        body: [
          "Aux Affair is a gathering built around music, food and conversation. The brief was a rounded lowercase a whose tail becomes an aux cable ending in a plug. The first version looked like a q, so the stroke was turned upward.",
        ],
      },
      {
        id: "logo",
        kind: "gallery",
        heading: "The final mark",
        natural: true,
        shots: [
          {
            image: "agentic-content/aux-lockup.webp",
            alt: "The final Aux Affair lockup: a rounded lowercase wordmark with a dashed cable underline in brass, ivory and ember, ending in a plug.",
          },
        ],
      },
      {
        id: "logo",
        kind: "gallery",
        heading: "The icon, and the first direction",
        pair: true,
        shots: [
          {
            image: "agentic-content/aux-icon.webp",
            alt: "The Aux Affair icon: the lowercase a with its tail flicking into the cable and plug.",
          },
          {
            image: "agentic-content/aux-didone-sheet.webp",
            alt: "The first direction, set aside: a Didone capital A with an audio plug as its crossbar.",
          },
        ],
      },
      {
        id: "store",
        kind: "prose",
        heading: "An App Store page",
        body: [
          "For InSpiritInTruth: App Store screenshots from a release build, checked against Apple's specifications, with headlines on features competitors don't have, plus a 12-second header video built in Remotion.",
        ],
      },
      {
        id: "store",
        kind: "video",
        src: "/media/case-studies/agentic-content-appstore-header.mp4",
        poster: "agentic-content/appstore-header-poster.webp",
        alt: "The 21:9 App Store header video: a verse and the app's screens in motion, on a loop.",
      },
      {
        id: "promo",
        kind: "prose",
        heading: "A 25-second promo film",
        body: [
          "Built in Remotion with a motion kit that scored every draft against eight criteria; the final version scored 8 or higher on each. My notes shaped version two: real app screens at the start, bigger captions and the whole phone in frame.",
        ],
      },
      {
        id: "promo",
        kind: "video",
        src: "/media/case-studies/agentic-content-isit-promo.mp4",
        poster: "agentic-content/isit-promo-poster.webp",
        alt: "The 25-second vertical promo: real app screens fan out, a feeling is typed, a devotional is generated and the streak ticks up.",
        portrait: true,
      },
      {
        id: "duo",
        kind: "prose",
        heading: "An iPhone Duo animation",
        body: [
          "Made without a video editor. Claude built the folding animation as a 3D web page around my captures from the Duo simulator, rendered it frame by frame in a browser and encoded it to video. I set the captions and the order, and asked for real screens instead of mock-ups.",
        ],
      },
      {
        id: "duo",
        kind: "video",
        src: "/media/case-studies/isit-iphone-duo-duo-unfold.mp4",
        poster: "isit-iphone-duo/duo-unfold-poster.webp",
        alt: "InSpiritInTruth on an iPhone Duo: the phone unfolds to two panes, opens a devotional, switches the Bible to dark mode, turns upright and closes on the wordmark.",
      },
      {
        id: "posters",
        kind: "prose",
        heading: "Story highlights for Culcha",
        body: [
          "Made in ChatGPT from a Pinterest reference board. Each cover uses one palette, one type treatment and one idea. I directed the look and approved each cover.",
        ],
      },
      {
        id: "posters",
        kind: "gallery",
        heading: "The four covers",
        stories: true,
        shots: [
          {
            image: "agentic-content/highlight-afro-culcha.webp",
            alt: "Afro Culcha: cream lettering with an orange shadow on cobalt blue, ringed by printed orange symbols.",
          },
          {
            image: "agentic-content/highlight-lean-back.webp",
            alt: "Lean Back: sticker-cut cream lettering on grainy crimson.",
          },
          {
            image: "agentic-content/highlight-spotted-at-culcha.webp",
            alt: "Spotted at Culcha: a ring of faces in sunglasses seen from below against palm trees and sky.",
          },
          {
            image: "agentic-content/highlight-culcha-summer.webp",
            alt: "Culcha Summer: a yellow sticker headline and brush script over palms, a hot sun and a turquoise sea.",
          },
        ],
      },
    ],
    seo: {
      title: "Making content agentically | Alroy Ndhlovu",
      description:
        "How Alroy Ndhlovu made a logo, an App Store page, a promo film and story highlights by directing Claude through real design software over MCP.",
    },
  },
  {
    slug: "isit-iphone-duo",
    name: "ISIT on iPhone Duo",
    kind: "client",
    dates: "Oct 2026",
    hero: {
      image: "isit-iphone-duo/duo-unfold-poster.webp",
      alt: "An iPhone Duo unfolding from InSpiritInTruth's outer screen to the two-pane home and a devotional, switching the Bible to dark mode, turning upright onto a devotional, folding shut and ending on the wordmark. Every screen is a real capture of version 1.8.",
      video: "/media/case-studies/isit-iphone-duo-duo-unfold.mp4",
    },
    summary:
      "I tested my devotional app against the five poses of Apple's foldable iPhone and redesigned the layouts that broke.",
    description:
      "I researched Apple's foldable iPhone Duo, mocked up every pose at true size and redesigned my devotional app for it. The update ships in version 1.8.",
    tags: ["UX research", "Adaptive layout", "Foldables", "iOS"],
    focus: ["product"],
    meta: ["Own product · InSpiritInTruth", "Research, design and build", "Oct 2026"],
    strip: [
      { image: "isit-iphone-duo/duo-unfold-poster.webp", alt: "The Duo animation." },
      { image: "isit-iphone-duo/open-home-after.jpg", alt: "Two-pane home." },
      { image: "products/isit-home.png", alt: "ISIT on a normal phone." },
      { image: "isit-iphone-duo/open-reader-after.jpg", alt: "Two-pane devotional." },
      { image: "isit-iphone-duo/closed-reader-after.jpg", alt: "Reader, folded." },
    ],
    chapters: [
      { id: "brief", label: "The brief" },
      { id: "research", label: "Research" },
      { id: "findings", label: "Findings" },
      { id: "today", label: "ISIT today" },
      { id: "compare", label: "Before and after" },
    ],
    blocks: [
      {
        id: "brief",
        kind: "prose",
        heading: "The new phone and the problem",
        body: [
          "The iPhone Duo went on sale on 23 October 2026. ISIT was designed for one tall screen and locked to portrait. I needed to find what would break when the phone opened.",
        ],
      },
      {
        id: "research",
        kind: "metrics",
        heading: "What the research said",
        items: [
          {
            value: "2",
            label: "Screens",
            context: "5.4″ outside at 466×678pt. 7.6″ inside at 890×626pt, hinge down the middle.",
          },
          {
            value: "5",
            label: "Poses to design for",
            context: "Closed, sideways, open, book and tabletop. Apple says lay out by size class.",
          },
          {
            value: "27.1",
            label: "SDK to fill the screen",
            context: "Apps built earlier run letterboxed, and many don't work properly yet.",
          },
        ],
        footnote:
          "From launch coverage, reviews and developer write-ups. Apple's own spec page could not be opened at the time, so the figures are as reported.",
      },
      {
        id: "findings",
        kind: "checklist",
        heading: "What I found",
        items: [
          "The inner screen ignores the portrait lock, so ISIT opens sideways.",
          "A devotional's photo is 560pt tall on a 626pt screen. The title barely shows.",
          "Home is a 600pt strip with the hinge through every card.",
          "Folded, text and buttons sit under the status bar strip down the side.",
        ],
      },
      {
        id: "today",
        kind: "gallery",
        heading: "ISIT on a normal phone",
        intro: "The single-column layout works well on the outer screen.",
        device: "phone",
        shots: [
          { image: "products/isit-home.png", alt: "Home: a devotional chosen for you." },
          {
            image: "products/isit-devotionals.png",
            alt: "Devotionals, including one written for you.",
          },
          { image: "products/isit-bible.png", alt: "The in-app Bible." },
        ],
      },
      {
        id: "compare",
        kind: "beforeAfter",
        heading: "Before and after",
        intro:
          "Version 1.7 against real 1.8 captures from the Duo simulator. Photos capped at half the screen height, two panes split at the fold. Tabletop comes later.",
        natural: true,
        pairs: [
          {
            label: "Closed",
            before: "isit-iphone-duo/closed-reader-before.jpg",
            after: "isit-iphone-duo/closed-reader-after.jpg",
            alt: "The photo no longer pushes the devotional off the first screen.",
          },
          {
            label: "Open",
            before: "isit-iphone-duo/open-home-before.jpg",
            after: "isit-iphone-duo/open-home-after.jpg",
            alt: "A centred strip cut by the hinge becomes two panes, with the tabs standing in the side strip.",
          },
          {
            label: "Open, devotional",
            before: "isit-iphone-duo/open-reader-before.jpg",
            after: "isit-iphone-duo/open-reader-after.jpg",
            alt: "The article on one side, the key verse and supporting verses on the other.",
          },
        ],
      },
    ],
    seo: {
      title: "ISIT on iPhone Duo case study | Alroy Ndhlovu",
      description:
        "Adapting the InSpiritInTruth devotional app for Apple's foldable iPhone Duo: the research, what would break, and the layouts shipping in 1.8.",
    },
  },
];

/**
 * Studies that are planned but not written. Named on the overview so
 * the section reads as a body of work in progress rather than as one
 * case study, but deliberately not rendered as cards: a card that looks
 * clickable and is not is worse than an honest line of text.
 */
export const UPCOMING_STUDIES: { name: string; note: string }[] = [];

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return CASE_STUDIES.find((study) => study.slug === slug);
}

/**
 * Client work, which is what section 06 is now for: four engagements
 * judged on what they returned to the business.
 */
export const CLIENT_STUDIES = CASE_STUDIES.filter((study) => study.kind === "client");

/**
 * The build stories behind Alroy's own products. Same depth, same
 * renderer, reached from the product card in section 05 instead of a
 * card of their own in 06.
 */
export const PRODUCT_STUDIES = CASE_STUDIES.filter((study) => study.kind === "product");

/**
 * Where a study lives. Derived from `kind` in exactly one place, so a
 * page, a card, the sitemap entry and the llms.txt line can never
 * disagree about a URL — and moving one only ever means changing its
 * `kind`.
 */
export function studyPath(study: Pick<CaseStudy, "kind" | "slug">): string {
  return study.kind === "product" ? `/products/${study.slug}/` : `/case-studies/${study.slug}/`;
}

/** The section a study belongs to, and how to name the way back to it. */
export function studyHome(kind: CaseStudy["kind"]) {
  return kind === "product"
    ? { href: "/#products", section: "Products", back: "Back to products", all: "All products" }
    : {
        href: "/#case-studies",
        section: "Case studies",
        back: "Back to case studies",
        all: "All case studies",
      };
}
