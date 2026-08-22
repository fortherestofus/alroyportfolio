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
      /**
       * Two per row. For captures that are evidence rather than
       * artwork — a dashboard shown full width is bigger than its
       * source can support and reads as blurry, and nobody needs an
       * analytics panel at 1,100px to believe it.
       */
      pair?: boolean;
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
    slug: "thrifty-adventures",
    name: "Thrifty Adventures",
    kind: "client",
    dates: "Jul 2025 – Jan 2026",
    hero: {
      image: "thrifty-adventures/hero-social.jpg",
      alt: "A grid of Thrifty Adventures tour posts covering Turkey, Europe, Zanzibar and Egypt.",
    },
    summary:
      "Built a travel brand's entire paid and organic presence from zero across four channels: 3.1 million organic TikTok views, search clicks at a fraction of the travel median, and LinkedIn lead forms converting at three times the platform norm.",
    description:
      "Thrifty Adventures runs group and tailored tours out of South Africa. I was contracted as digital marketing manager to grow the return on ad spend, open new audiences on channels like LinkedIn, and turn attention into leads and sales, with social content and branding alongside. Nothing was running when I started. I built four channels, each doing one job.",
    tags: ["Paid media", "Organic social", "Search", "Lead generation", "Channel strategy"],
    logoFile: "thrifty.jpeg",
    meta: ["Client · Thrifty Adventures", "Contract Digital Marketing Manager", "Jul 2025 – Jan 2026"],
    chapters: [
      { id: "start", label: "The wrong channel" },
      { id: "testing", label: "Opening it up" },
      { id: "offer", label: "The brochure" },
      { id: "results", label: "LinkedIn results" },
      { id: "tiktok", label: "TikTok" },
      { id: "google", label: "Search" },
      { id: "mix", label: "The mix" },
      { id: "honest", label: "What didn't work" },
    ],
    blocks: [
      {
        id: "start",
        kind: "prose",
        heading: "The channel nobody picks for travel",
        body: [
          "LinkedIn is where you go to reach a job title. Thrifty Adventures sells group tours to people spending their own money on their own holidays. On paper it is the wrong platform, and nothing was running: no campaigns, no tracking, no idea what a click was worth.",
          "So the question was not how to scale LinkedIn. It was whether it works for consumer travel at all. Seven months of sustained spend later: it does, but not for the reason I expected.",
        ],
      },
      {
        id: "testing",
        kind: "prose",
        heading: "One objective at a time, then all of them",
        body: [
          "July was deliberately small: one campaign, at the cost per click an account with no history pays, which is the most it will ever pay.",
          "September was the real test. Four objectives side by side in one month, which is the only way to learn what a platform charges for each thing it sells. It produced the first wave of leads and the comparison that decided everything after: drop what it killed, fund what survived.",
        ],
      },
      {
        id: "testing",
        kind: "trend",
        heading: "Reach up 47×, and the price down every month",
        intro:
          "The bars are reach, indexed to the first month. The note that matters to a business is what each month cost to buy it.",
        measure: "Reach, indexed to July",
        rows: [
          { label: "Jul 2025", value: 1, display: "1×", note: "The baseline. A new account pays the most it will ever pay." },
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
          { label: "Dec 2025", value: 47.8, display: "48×", note: "Scaled. CPM down 73% from July." },
          {
            label: "Jan 2026",
            value: 47.2,
            display: "47×",
            note: "Cheapest month: clicks 70% cheaper than July, CPM down 81%.",
          },
        ],
        footnote:
          "Reach is indexed to the first month rather than reported raw; impression counts and spend stay with the client. CPM fell 81% across the run and cost per landing page click fell 70%. Some of that is an account earning its own history.",
      },
      {
        id: "offer",
        kind: "metrics",
        heading: "The brochure was the whole finding",
        intro:
          "Targeting did not decide this. Same audience, same platform, same form. One version asked people to enquire about a trip; the other offered the 2026 brochure. Only one asked for something the reader already wanted.",
        items: [
          {
            value: "36.6%",
            label: "Form completion, brochure",
            context: "Against 8.6% on the identical form with nothing to collect at the end.",
          },
          {
            value: "10–15%",
            label: "The LinkedIn norm",
            context: "The brochure beat the band by more than the rest of the account missed it.",
          },
          {
            value: "73%",
            label: "Of all leads came from the brochure ask",
            context: "The stronger offer carried the account.",
          },
          {
            value: "+39%",
            label: "Cost per lead, everything else",
            context:
              "The weaker ask cost two-fifths more per lead. Absolute costs stay with the client.",
          },
        ],
        footnote:
          "Same platform, market, months and form. The only variable was what the ad asked for, which is the cheapest thing on this page to copy, and the one that moved the most.",
      },
      {
        id: "results",
        kind: "metrics",
        heading: "What seven months bought",
        intro: "From no paid presence on the channel at all.",
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
            context:
              "Seven months, one channel, every rand tracked. Budget, lead counts and unit costs stay with the client.",
          },
        ],
        footnote:
          "Clicks are landing page clicks, not LinkedIn's headline Clicks column, which also counts reactions and follows. The 0.52% median is AgencyAnalytics, January 2025. Spend totals, lead counts and unit costs are the client's and are held back.",
      },
      {
        id: "tiktok",
        kind: "prose",
        heading: "The channel that did the finding",
        body: [
          "LinkedIn was the experiment. TikTok was the engine, and it did not start from nothing: the account already had an audience, which changes what a view count means.",
          "Destinations shot plainly, captioned as questions people actually type. That is the whole trick: the videos stay findable months later instead of for the two days the algorithm favours them.",
        ],
      },
      {
        id: "tiktok",
        kind: "metrics",
        heading: "3.1 million views, and 38% of them from search",
        intro:
          "The search share is the one that matters commercially: it means the back catalogue keeps working long after a post stops trending.",
        items: [
          {
            value: "38.1%",
            label: "Of views came from search",
            context:
              "People looking for a destination and finding Thrifty, rather than being served it.",
          },
          {
            value: "3.1M",
            label: "Views, organic",
            context: "Jun 2025 to Jan 2026, reaching 3.3M people who had never seen the brand.",
          },
          {
            value: "7,200",
            label: "Shares",
            context:
              "The signal that matters most on the platform: someone sending it to a person.",
          },
        ],
        footnote:
          "Period figures for Jun 2025 to Jan 2026. The account had a following before this work and the starting number was not recorded, so no growth is claimed. On search: For You typically carries around 70% of views, here 57.6%. No published benchmark exists for search share by account.",
      },
      {
        id: "tiktok",
        kind: "metrics",
        heading: "And then paid, to start conversations",
        intro:
          "One destination, one video, one objective: get a person into a message thread. A week of delivery, priced per conversation started.",
        items: [
          {
            value: "Cheapest",
            label: "Qualified contact in the account",
            context:
              "Weighted across all nine videos, not the best one quoted as if it were typical. Costs and volumes stay with the client.",
          },
          {
            value: "9",
            label: "Destination videos in one week's test",
            context: "Each priced per conversation started, so the winners were provable in days.",
          },
          {
            value: "43%",
            label: "Of conversations from the best video",
            context: "Bali and Thailand, at essentially the account average per conversation.",
          },
        ],
        footnote:
          "TikTok's own figures for 30 Jan – 6 Feb 2026, reported as the week they cover. \u201cConversations\u201d is TikTok's metric for a messaging thread opened off an ad. How many became bookings is unknown; that attribution was never wired up.",
      },
      {
        id: "google",
        kind: "metrics",
        heading: "Search, for the people already looking",
        intro:
          "The cheapest job on the list, and the one with the least argument attached: someone typing the name of a tour is not a person to be persuaded.",
        items: [
          {
            value: "~99%",
            label: "Below the travel median cost per click",
            context: "Against the $2.14 median in the 2026 benchmark set. The absolute cost stays with the client.",
          },
          {
            value: "8.04%",
            label: "Account click-through rate",
            context: "Against a 9.32% search median. The display campaign carried 18.12% on its own.",
          },
          {
            value: "6",
            label: "Campaigns, Jun 2025 to Feb 2026",
            context: "Search, display and Performance Max, each on its own job. Click and impression volumes stay with the client.",
          },
        ],
        footnote:
          "Benchmark: WordStream's 2026 study of 13,474 US search campaigns, with travel medians of 9.32% CTR, $2.14 CPC and $44.70 per lead. Two caveats. It covers search, and most of this volume is display and Performance Max, where clicks are cheaper by design. And it is US pricing; South African inventory is far less contested, so much of the gap is the market rather than the management.",
      },
      {
        id: "mix",
        kind: "checklist",
        heading: "What each channel was actually for",
        intro:
          "The point of running four is not four times the volume. It is that a holiday is not bought in one motion, and the channels are good at different parts of it.",
        items: [
          "TikTok organic gets the brand found, and keeps working months later.",
          "TikTok ads turn that into a conversation: the cheapest qualified contact in the account.",
          "Google catches people already pricing a trip. Cheapest clicks, least persuasion.",
          "LinkedIn sells the considered trip: the account's costliest contact, and its most considered.",
          "None was asked to do another's job. The brochure that made LinkedIn work would have died on TikTok, and the destination video that pulls conversations on TikTok drew 0.10% click-through as a LinkedIn ad.",
        ],
      },
      {
        id: "honest",
        kind: "prose",
        heading: "What didn't work",
        body: [
          "Brand awareness was the most expensive click on the platform, over ten times the price of the cheapest month's traffic clicks. As a click channel it failed. There were cheaper ways to buy that attention.",
          "Single-destination videos did not travel: 0.10–0.16% click-through, at twenty to forty times the click cost of the winner. The one composite, a year of trips in a single edit, out-pulled them at a fraction of the cost. People responded to the range, not one place.",
          "And the conversion columns on both platforms are unusable: more recorded conversions than clicks on LinkedIn, and a 232% conversion rate on one Google campaign. Broad tags firing on ordinary page loads. Clicks, impressions and cost are real; no conversion figure appears anywhere on this page.",
        ],
      },
      {
        id: "honest",
        kind: "prose",
        heading: "What I'd do differently",
        body: [
          "Run the brochure from month one. It only entered in September, so two months of lead spend went on the weaker ask: 36.6% form completion against 8.6%. Test the offer before tuning the audience.",
          "Configure conversion tracking on day zero. The broad tag made seven months of conversion data unusable, and nothing after the fact can un-mix view-throughs from clicks.",
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
    slug: "innovatr",
    name: "Innovatr",
    kind: "client",
    dates: "Mar 2026 – Sep 2026",
    hero: {
      image: "innovatr/web-home-after.jpg",
      alt: "The rebuilt Innovatr home page, leading with the consumer-intelligence positioning.",
    },
    summary:
      "Rebuilt the whole front of a research business: brand, website, content engine and paid programme. Built its marketing system from zero, beat the industry benchmarks, and replaced an annual software licence with a product the company could sell.",
    description:
      "Innovatr is a consumer research and growth consultancy. I worked full time as Brand & Marketing Manager: improved the branding, started the paid engine, built the marketing system, and shipped a product. This is what changed in seven months.",
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
          "The product was genuinely different. The way it was presented was not. The site led with “Stop Guessing. Launch Better Innovation.”, a line that could have belonged to any research agency.",
          "No paid programme, effectively no inbound traffic, and no way to turn the research already being produced into demand for more of it.",
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
          "Every study Innovatr ran produced findings nobody outside the client ever saw. These put them in public: the Gen Z drinking carousel shows its 4,339 comments rather than describing them, and the old-versus-new set makes the case for the method. Both do what the product does: state a claim, then put the evidence under it.",
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
          "The paid programme ran the same argument in a format built to be scrolled past. “The Innovatr Way” took on the legacy research model directly: unchanged in decades, six-week turnarounds, six-figure studies.",
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
        heading: "Building the marketing system",
        intro:
          "A business selling research to decision-makers has to know who they are, and Innovatr had no list. I built one from prospecting tools, partner databases, client outreach and inbound signups, de-duplicated it into one CRM, and wired the rest of the system around it: email marketing and automation, LinkedIn ads with remarketing, and the CRM feeding the ad audiences. That last step is the point: ads aimed at named companies and real job titles, not the platform's guesses.",
        items: [
          {
            value: "0 → live",
            label: "CRM built in six months",
            context:
              "Every source de-duplicated by email, so nobody is counted twice. A working, segmented system where none existed.",
          },
          {
            value: "Account-based",
            label: "Targeting on named organisations",
            context:
              "The addressable market mapped company by company, which is what account-based targeting needs to exist. Volumes stay with the client.",
          },
        ],
        footnote:
          "Sourced audience, not inbound enquiries. The proof is under Results: LinkedIn's delivery demographics show the ads landing on the seniorities and companies these lists were built from.",
      },
      {
        id: "results",
        kind: "metrics",
        heading: "The ads landed in the right rooms",
        intro:
          "Spending on ads is easy. The question is whether they reached people who can sign off a study. The first test is not clicks. It is LinkedIn's own delivery demographics.",
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
              "The country's major banks, insurers and consultancies. The names stay with the client.",
          },
          {
            value: "56%",
            label: "In the three target metros",
            context: "Johannesburg, Pretoria and Durban, the geography Innovatr sells into.",
          },
        ],
        footnote:
          "LinkedIn's delivery demographics for the account, April–July 2026. Nearly two-thirds of every rand landed on someone senior enough to sign off a study.",
      },
      {
        id: "results",
        kind: "trend",
        heading: "Leads got better every flight",
        intro:
          "The programme ran in short creative flights, each one tightening who saw the forms. The measure that matters is not the count, which stays with the client, but who was filling the forms in: the share arriving on a work email.",
        measure: "Work-email share of leads",
        rows: [
          {
            label: "Launch flight",
            value: 27,
            display: "~27%",
            note: "Broad targeting, forms accepting personal emails. Volume without quality. Forms then rebuilt to require a work email and phone.",
          },
          {
            label: "Refined flight",
            value: 91,
            display: "91%",
            note: "Vertical targeting on the mapped accounts. Most of the newest cohort squarely in the ICP.",
          },
        ],
        footnote:
          "91% work-email share is the lead quality the whole programme was built toward, up from ~27% at launch. Lead counts and the media budget stay with the client; the budget also bought traffic and awareness, separated in the next section.",
      },
      {
        id: "results",
        kind: "metrics",
        heading: "Every cost beat the market",
        intro:
          "Most of the budget was never pointed at leads. Video bought attention, carousels bought site conversions, and only the lead-gen documents bought leads. Each is scored on its own job, against LinkedIn's published B2B norms.",
        items: [
          {
            value: "~3×",
            label: "Better cost per lead than the B2B median",
            context:
              "A third of LinkedIn's published gated-lead median for B2B services; further still below the EMEA norm. The absolute figure stays with the client.",
          },
          {
            value: "52%",
            label: "Cheaper per click than the norm",
            context: "Against LinkedIn's published B2B click costs; cheaper still blended account-wide.",
          },
          {
            value: "61%",
            label: "Cheaper per thousand impressions",
            context: "Against the published CPM norm, sustained across more than a million impressions.",
          },
          {
            value: "44–48%",
            label: "Video view rate vs 29.5%",
            context: "15–19 points over the platform norm.",
          },
        ],
        footnote:
          "Form completion ran 46–57% against a 10–13% benchmark. One miss: carousel click-through at 0.32% against a 0.40–0.55% band, so carousels stayed on the conversion job they were winning rather than the click job they were losing. No flight ran longer than five weeks against LinkedIn's six-to-eight-week optimisation runway, so these are pre-optimisation. A June conversion tag counting view-throughs is excluded throughout.",
      },
      {
        id: "results",
        kind: "metrics",
        heading: "And the leads were the right people",
        intro:
          "The count matters less than who filled the forms in. From the lead-form exports, assessed on work-email capture, seniority and ICP fit:",
        items: [
          {
            value: "~Half",
            label: "Call-first tier",
            context:
              "Work-email leads at ICP accounts with decision-layer titles. The leads a salesperson actually phones.",
          },
          {
            value: "91%",
            label: "Work emails, newest cohort",
            context:
              "Up from ~27% in the launch era. The refinement is visible in the pipeline itself.",
          },
          {
            value: "80%+",
            label: "Newest cohort inside the ICP",
            context:
              "Senior research, strategy and CX roles at exactly the institutions being targeted.",
          },
        ],
        footnote:
          "Roles span customer experience, market research, business analysis, risk, marketing leadership, business development and product, up to chief executive, at the institutions the lists were built from. Names and counts stay with the client.",
      },
      {
        id: "results",
        kind: "checklist",
        heading: "What the four months proved",
        items: [
          "Costs beat the market in every flight, on both broad and strict decision-maker targeting.",
          "Lead generation produced contactable pipeline every time it ran.",
          "Spend and results moved together: the highest-spend month was the highest-lead month.",
          "Format, not message, decided performance. The same line was the best video and the weakest carousel.",
        ],
      },
      {
        id: "product",
        kind: "prose",
        heading: "The product: Social Sweep",
        body: [
          "Innovatr was about to licence a social listening platform on an annual enterprise contract. I built the capability in-house instead: platform APIs feeding an AI reasoning layer, prototyped in Replit and built out with Claude.",
          "Ask it a plain-language question, “How do South Africans talk about Chinese car brands versus German ones?”, and it picks the platforms worth reading, then returns a report where every claim resolves to a real comment. A line of annual cost became a line of product, positioned as a billable study.",
          "The saving is the small part. The tool Innovatr nearly licensed was itself acquired by a market research group a few months later, after four years and outside investment. Not parity: theirs is a company with a roadmap and a support desk. But the capability that used to justify an acquisition is now something one person can build in a quarter.",
        ],
      },
      {
        id: "product",
        kind: "metrics",
        heading: "What building it instead of buying it was worth",
        items: [
          {
            value: "In-house",
            label: "Built instead of licensed",
            context:
              "Replaced the annual enterprise licence the team had been quoted for a third-party tool.",
          },
          {
            value: "Billable",
            label: "Positioned as a product",
            context: "Packaged as a sellable Innovatr study, not internal tooling.",
          },
          {
            value: "46",
            label: "Platforms reachable",
            context:
              "Through the Social Crawl API it runs on: social, search, commerce and the open web.",
          },
        ],
        footnote:
          "Positioned as a billable product; revenue is not claimed. Commercial figures, the licence quote and the study price, stay with the client. Platform count is Social Crawl's published coverage of 46 platforms and 368 endpoints, of which Social Sweep queries the relevant subset.",
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
        kind: "video",
        heading: "Social Sweep, running",
        intro:
          "A full study end to end: the question going in, the platforms it decides are worth reading, and the report coming back with the quotes underneath every claim.",
        src: "/media/case-studies/social-sweep.mp4",
        poster: "innovatr/social_sweep_report.jpg",
        alt: "A two-minute walkthrough of Social Sweep: entering a plain-language question, watching it select platforms, and reading the finished report with its sentiment split, emotion mix and source quotes.",
        footnote:
          "Recorded from the working tool, not a prototype. This copy is silent by design; the narrated version is in the portfolio.",
      },
      {
        id: "product",
        kind: "prose",
        heading: "What I'd do differently",
        body: [
          "Start the call motion sooner. The email sequences earned 36–62% open rates against a ~30% benchmark and zero replies. Opens prove interest; no replies prove email alone cannot convert it. Warm leads sat unworked while the machine finding them kept improving. Next time, a human call within 48 hours from the first lead.",
        ],
      },
    ],
    seo: {
      title: "Innovatr case study | Alroy Ndhlovu",
      description:
        "How Alroy Ndhlovu rebuilt Innovatr's brand, website, content engine and paid programme, and built the social listening product the business now sells.",
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
      "A content research and creation assistant built to fight AI slop. It researches your topic into a cited report, then helps you create from it in your own voice.",
    description:
      "Hakkan (発刊, “to publish”) helps you lead a topic. It researches the real conversation into a report with receipts, treats that report as your source of truth, and helps you create content from it in a voice it learns from you.",
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
          "Since late 2024, more new articles online are written by AI than by people (Graphite, 2025). That is the slop problem: fluent text that reads fine and knows nothing. The tools caused it, because every AI writer starts from a blank page and asks the model to fill it.",
          "Hakkan starts from a topic you want to lead. It researches the real conversation into a cited report, and you create from that. The model is never the source. Hakkan (発刊) is Japanese for “to publish”, and aloud it echoes “harken”: listen closely.",
        ],
      },
      {
        id: "how",
        kind: "prose",
        heading: "How it works: topic, report, your voice",
        body: [
          "Give it a topic. It gathers the real conversation, filters for relevance, and builds a visual report: themes categorised, sentiment weighed, angles ranked, every quote cited. That report is your source of truth.",
          "Then you create from it. Personas learn your voice from your own writing, and a trends module keeps you current between reports. Automation does the gathering; the taste stays human.",
        ],
      },
      {
        id: "how",
        kind: "metrics",
        heading: "Where it listens",
        intro:
          "Every run sweeps the same fourteen platforms, and the planner routes extra sources in per topic: a travel question reaches review sites, a developer question reaches technical forums, with no code change.",
        items: [
          {
            value: "14",
            label: "Platforms on every run",
            context:
              "Reddit, X, YouTube, TikTok, Instagram, LinkedIn, Threads, Hacker News, Pinterest, Rumble, GitHub, Polymarket and two search layers. Not a menu to configure.",
          },
          {
            value: "19+",
            label: "Sources reachable in total",
            context:
              "Plus routed legs: news, traveller reviews, business reviews, retail and app-store reviews.",
          },
          {
            value: "Yours",
            label: "Depth is a user choice",
            context:
              "How wide and how far back a run reaches is set by the person asking, not by a limit the tool invented to protect its own costs.",
          },
        ],
        footnote:
          "Both counts derive from the platform registry in code, so they cannot drift between the product and this page. They describe what Hakkan reaches, not the published ceiling of the APIs underneath it.",
      },
      {
        id: "hard",
        kind: "prose",
        heading: "The hard part: teaching the filter to value people",
        body: [
          "The promise is “what people actually said”, and the first evidence filter betrayed it. A verbose article restates the topic in its headline, so it scored high. A real reply like “Why need a nanny if I won’t have a job” is short and oblique, so it died as off-topic. The filter was killing the material the product sells.",
          "The fix was to judge a comment as a comment: replies answer what they reply to, not your search query, so relevance is scored in context.",
        ],
      },
      {
        id: "hard",
        kind: "trend",
        heading: "Human voice in the evidence, measured at every stage",
        intro:
          "The bar: 40% of everything cited had to be a real human utterance rather than a publication. Getting there took four attempts.",
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
            note: "Real runs. Better, and still losing voices in the filter.",
          },
          {
            label: "Facts added",
            value: 19,
            display: "19%",
            note: "More article evidence diluted the voices. The filter was the bottleneck.",
          },
          {
            label: "Filter rewritten",
            value: 57,
            display: "57%",
            note: "Comments judged as comments. Well past the bar.",
          },
        ],
        footnote:
          "Measured on live runs against a 40% bar set before the work started, not tuned to hit it.",
      },
      {
        id: "honest",
        kind: "metrics",
        heading: "Honest by construction",
        intro:
          "“No slop” is enforced in code, not tone of voice. Three refusals built into the product:",
        items: [
          {
            value: "3-way",
            label: "Every number is classified",
            context:
              "Grounded in the research, drawn from your own writing, or derived by the model. Only the third is flagged, never blocked. The author decides what they stand behind.",
          },
          {
            value: "0",
            label: "Virality predictions",
            context:
              "Refused outright. With no outcome data to train on, a prediction is a made-up number sitting beside real citations. It shows what did break out instead.",
          },
          {
            value: "Scoped",
            label: "Every claim names its sample",
            context:
              "“60% of the voices in this report” is measured and true. “60% of people” is neither.",
          },
        ],
        footnote:
          "Same rule inside the business: a hard cost-per-run ceiling enforced in code, so the depth users get stays sustainable on both sides.",
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
          "Read the reference images, not a summary of them. Built from a written description, the first report page came out a 7,600-pixel essay when every reference was a card grid with a metric band.",
          "Batch the evidence filter from day one. Scoring every item in one model call worked until streaming delivered what we were paying for and the call outgrew its timeout, killing runs that had already spent money.",
        ],
      },
    ],
    seo: {
      title: "Hakkan — how I built it | Alroy Ndhlovu",
      description:
        "Building a content research and creation assistant to fight AI slop: cited reports as the source of truth, content in your own voice, and no invented numbers.",
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
      "Faith has always been communal. ISIT complements that with the personal side: a devotional written for what you are carrying today, engineered so it can never quietly misquote scripture.",
    description:
      "A devotional app for imperfect journeys: the overwhelmed, the curious, the unchurched, the devoted. It is not built to replace tradition. It keeps the shared rhythm and adds the personal side the format never had.",
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
          "Faith is learned in community: the same readings, the same routines, the same page for everyone. Barna finds 56% of Christians say their spiritual life is entirely private, and a growing group report that the standard forms simply do not work for them. The communal side is well resourced. The private side, where most of it happens, gets a template.",
          "ISIT complements tradition rather than replacing it. It keeps the weekly devotional, the shared devotions everyone knows and the whole Bible, then writes one for whatever you are actually carrying, rooted first in Scripture. No algorithm, no ads.",
        ],
      },
      {
        id: "how",
        kind: "prose",
        heading: "Personalisation with a safety net",
        body: [
          "Generated spiritual guidance is higher-stakes than most AI writing: it has to carry authority without hallucinated certainty. Restraint is the feature here, so a cheaper, edgier model was tested on the real prompt and turned down twice.",
          "Nothing generated reaches a reader unverified. Every tailored devotional passes a fact-check against the live web before publication, a pass that deliberately costs several times more than the writing itself.",
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
          "That ratio is a choice. Verification is the one cost this product will not cut to protect a margin, so the subscription is tuned around keeping it.",
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
              "A verse's translation label is only ever updated when its text was actually re-fetched in that translation. The bug this rule killed: a failed fetch publishing NKJV wording tagged “NET”, a lie a reader can never detect.",
          },
          {
            value: "Device date",
            label: "Not the server's, not UTC",
            context:
              "The daily verse broke three times by rolling over on UTC midnight instead of the reader's own, showing tomorrow's verse at 1am. Now a hard rule with the reproduction documented.",
          },
          {
            value: "No italics",
            label: "In scripture passages",
            context:
              "Retired across the app: emphasis the original text does not carry is editorialising. The passage is presented as written.",
          },
        ],
        footnote:
          "Design follows the same discipline: two type families rather than three, and generated devotionals drawn from a closed, server-enforced set of themes rather than whatever a model invents.",
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
      {
        id: "screens",
        kind: "prose",
        heading: "What I'd do differently",
        body: [
          "Define “today” on day one. The daily verse rolled over on UTC midnight instead of the reader's clock, and that assumption shipped three times before it became a written rule. Decide whose midnight you honour before the first query.",
          "Measure the cost of honesty before pricing it. The fact-check pass dominates the machine cost of a tailored devotional, several times the writing itself, and that was discovered after the price was set. Instrument first, price second.",
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
      "Adulting, minus one decision. It feeds you with what you have, wherever you are: one meal from your own ingredients, your diet respected, the power back with you.",
    description:
      "tapa. answers one question: “what can I cook with this?” Type it, say it or take a pic of what you have, plus how long you have and how many you are feeding. One considered recipe back, not fifty results. This is what keeping it that simple costs.",
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
          "In one Wakefield Research survey, 68% of Americans called deciding what to eat their biggest mealtime challenge. Work out what you have, then what it could become, and because that is tedious you cook the same three things forever. Recipe sites answer with fifty results and a life story above each.",
          "tapa. deletes the decision. Type it, say it or take a pic of what is in the fridge, and get one meal built around your tastes. Variety from the same shelf, with allergies and dietary needs set once and enforced on every recipe.",
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
            label: "Ways in, one recipe out",
            context:
              "Type it, say it, or take a pic, and one recipe comes back. Choice is the load the app exists to remove, so it never returns a list.",
          },
          {
            value: "1×",
            label: "Set your constraints once",
            context:
              "Allergies, dietary rules, household size, skill. Captured in onboarding, applied to every recipe after, editable any time.",
          },
          {
            value: "3",
            label: "Recipes of history",
            context:
              "Enough to go back to last night, not enough to become a database you manage. Favourites are saved deliberately or not at all.",
          },
        ],
        footnote:
          "The same discipline runs through the engineering: when a second account on a shared phone could see the first account's recipes, the fix was ownership at the data layer, every row belonging to an account rather than a device, not a patch on the sign-out path.",
      },
      {
        id: "fair",
        kind: "trend",
        heading: "Finding the free tier honestly",
        intro:
          "A simple app still has to sustain itself. The free allowance was tuned against real numbers, how often people actually cook and what competing apps give away, and the journey is worth showing because each move had a reason.",
        measure: "Free recipes per week",
        rowLabel: "Iteration",
        rows: [
          {
            label: "Launch",
            value: 3,
            display: "3",
            note: "Generous, but the median cook makes 3–4 dinners a week, so free covered everything and the question of upgrading never arrived.",
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
          "The aim was an exchange fair in both directions, set from how people actually cook rather than from hope. The honesty rule ships in the code: upsell copy is derived from the configuration that enforces it, so the app can only promise what it delivers.",
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
          "Own the data properly from the first schema. Local recipes belonged to the phone, not the account, until a TestFlight tester signed into a fresh account and saw someone else's saved recipes.",
          "Research the free tier before launch, not in public. It moved three times in two days, and the cooking-frequency data that settled it existed all along.",
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
    },
    summary:
      "A browser extension that holds both kinds of slipper accountable, the procrastinator and the workaholic. Live on the Chrome Web Store, free, with no account and no server.",
    description:
      "Your phone nags you about screen time. The laptop, where the work happens and the distraction finds you, mostly does not. CaughtSlipping is a sarcastically honest friend that tracks where the hours actually went, then flips and tells you when you have not stopped.",
    tags: ["Product build", "Chrome extension", "Behaviour design", "Privacy"],
    meta: ["Own product", "Solo: product, design, code, copy", "Live on the Chrome Web Store"],
    website: "https://chromewebstore.google.com/detail/ncepfdipljmhbhehjegfemndcgaclnlg",
    strip: [
      { image: "products/caught-today.jpg", alt: "The daily verdict." },
      { image: "products/caught-focus.jpg", alt: "The focus score." },
      { image: "products/caught-work.jpg", alt: "Work Mode." },
      { image: "products/caught-sites.jpg", alt: "Per-site breakdown." },
    ],
    chapters: [
      { id: "why", label: "Why it exists" },
      { id: "hard", label: "The hard part" },
      { id: "grinding", label: "The other slipper" },
      { id: "free", label: "The gate I deleted" },
      { id: "screens", label: "The screens" },
    ],
    blocks: [
      {
        id: "why",
        kind: "prose",
        heading: "Two kinds of slipper, one blind spot",
        body: [
          "There are two kinds of people: the distracted and the overworker. I am both, on different days. Screen-time tools only nag the first one, and they live on the phone. The browser is where the work gets done, so it is also where the distraction finds you, and almost nothing was watching it.",
          "So it is a friend with an attitude rather than a dashboard. Today's number comes with a line matched to how deep you are, a limit you cross redirects the tab to a wall, and re-opening a site you have overdone triggers a three-second pause.",
        ],
      },
      {
        id: "hard",
        kind: "prose",
        heading: "The hard part: most trackers quietly lie",
        body: [
          "Chrome's idle API watches your mouse and keyboard. Watch an hour-long show without touching anything and the browser calls it idle, so the tracker logs three minutes. A product whose promise is receipts cannot ship a number that is wrong in the user's favour.",
          "Four rewrites fixed it. Playing media counts even with no input. Forgotten tabs stop counting after a no-input backstop. Nothing commits more than two minutes past the last proof the machine was awake, so an overnight sleep no longer counts the night. It is most of the engineering in the extension and none of it shows in a screenshot.",
        ],
      },
      {
        id: "grinding",
        kind: "metrics",
        heading: "Caught Grinding: the alter ego",
        intro:
          "Work Mode inverts the product: instead of shaming wasted time it runs a Workaholic Check, anchored to published health research rather than a vibe.",
        items: [
          {
            value: "55h",
            label: "The line that ends the argument",
            context:
              "The WHO and ILO put the health-risk threshold at 55 hours a week: 35% higher stroke risk, 17% higher risk of dying from heart disease. Cross it and the verdict jumps straight to workaholic, source cited on screen.",
          },
          {
            value: "Your hours",
            label: "Not a hardcoded evening",
            context:
              "After-hours and weekend signals read the schedule you set. The same hour of YouTube means something different at 10am Tuesday and 9pm Saturday.",
          },
          {
            value: "0 bytes",
            label: "Leaves your device",
            context:
              "No account, no backend, no database. The app cannot sell what it never collects, which is also why every feature is free.",
          },
        ],
        footnote:
          "Four verdict tiers, from chill to workaholic, driven by after-hours work, weekend grind, no-break streaks and weekly load.",
      },
      {
        id: "free",
        kind: "prose",
        heading: "The gate I built, then deleted",
        body: [
          "Blocking, time limits and the pause interstitial all shipped behind a licence check. Payments were wired, the Pro tier existed, and it was the wrong product: an accountability tool that withholds the intervention until you pay is selling the diagnosis and charging for the cure.",
          "The paywalled features were the ones that change behaviour, so the free tier was a guilt machine with no exit. Licensing came out and everything went free. With no backend to fund, that was affordable as well as right.",
        ],
      },
      {
        id: "screens",
        kind: "gallery",
        heading: "The screens",
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
      {
        id: "screens",
        kind: "prose",
        heading: "What I'd do differently",
        body: [
          "Write the accuracy spec before the tracker. The ways a browser can lie about attention were knowable up front, not one scenario at a time across four rewrites.",
          "Decide the business model before building the gate. Licensing was built, then deleted once it was obvious the paid features were the ones that made the product work.",
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
      "Built a clothing brand end to end: product, store, payments, photography. Validated the only way that counts: sales in the first month, local and international, then a 20-unit bulk order from another brand.",
    description:
      "Filosofee is a South African streetwear label. I designed the range, built the store, wired the payments, ran the shoot and the marketing. It sold in its first month and then landed its first wholesale order. One line of it failed, and that is in here too.",
    tags: ["E-commerce", "Brand", "Product design", "Photography", "AI production"],
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
      { id: "media", label: "Cutting the cost" },
      { id: "stickers", label: "What I killed" },
      { id: "honest", label: "What I'd change" },
    ],
    blocks: [
      {
        id: "build",
        kind: "prose",
        heading: "The whole thing, not a piece of it",
        body: [
          "Filosofee started as a graphic tee brand and grew into apparel, packaging and a store. I did the range, the store, the payment gateways, the photography and the marketing. That is the useful part of this case study: most people who can design a shirt cannot take a card payment, and most people who can build a store have never had to price a garment.",
          "The range is graphic-led: the wordmark pieces, and a set of designs that carry an idea rather than a logo. The store is a hosted storefront with Paystack for local cards and PayPal for everyone else, because a South African brand that cannot take an international payment is a local brand whether it wants to be or not.",
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
        heading: "What validated it",
        intro: "A brand is an opinion until somebody pays for it. Two things settled the question.",
        items: [
          {
            value: "Month one",
            label: "First sales",
            context: "Local and international, from the store rather than from friends.",
          },
          {
            value: "20 units",
            label: "First bulk order",
            context: "Thrifty Adventures, designed and produced as their branded apparel.",
          },
          {
            value: "2",
            label: "Revenue lines it proved",
            context: "Direct-to-consumer, and business-to-business off the same production setup.",
          },
        ],
        footnote:
          "Order volumes are small and reported as such. This is validation, not a trading record. The point of the bulk order is not its size but that it came from a different kind of buyer through the same product, the same suppliers and the same fulfilment.",
      },
      {
        id: "proof",
        kind: "prose",
        heading: "The order that changed the business",
        body: [
          "Thrifty Adventures needed branded apparel for their tours. Filosofee designed and produced it: twenty units, the first wholesale order the brand had taken.",
          "One order does not make a wholesale business. What it did was prove the setup could serve a second, better kind of customer without changing anything: B2B buys more per order, does not need converting one shirt at a time, and comes back on a schedule. The consumer store is the shop window; the print run is the margin.",
        ],
      },
      {
        id: "media",
        kind: "prose",
        heading: "A shoot you pay for once",
        body: [
          "The product shoot was the single most expensive line in the brand's first year: studio, model, photographer, retouching. It also produced the best assets Filosofee has.",
          "So it became the reference rather than the whole library. The shoot fixes what the brand looks like: the black garments, the plain ground, the light, how the pieces sit on a person. Generated imagery extends it into the volume social needs, matched to that look. Real work sets the standard and AI runs at the pace of a content calendar.",
        ],
      },
      {
        id: "media",
        kind: "gallery",
        pair: true,
        heading: "Photographed, then extended",
        intro:
          "Left: the studio shoot. Right: generated, working from it. Same brand, one of them costing a day and a crew.",
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
        heading: "The line I stopped",
        body: [
          "Filosofee sold stickers alongside the apparel. They were designed, produced, listed and packed, and I ended them.",
          "The economics never worked. A sticker order carries the same admin as a hoodie order, the payment, pick, pack, label, courier and the query if it goes missing, against a fraction of the value. It does not scale either: the volume needed to make the margin meaningful is volume the team cannot pack. For a small consulting team running a brand on the side, that is the wrong shape of work.",
          "Killing it was worth more than the revenue it made. Same effort, moved to garments and wholesale, earns several times as much.",
        ],
      },
      {
        id: "honest",
        kind: "prose",
        heading: "What I'd change",
        body: [
          "Price the admin, not the item. Stickers looked profitable per unit and were not, because the per-order cost never appeared in the sums. Anything sold below a certain price should be tested against the handling it drags with it before it is listed.",
          "And chase the bulk order sooner. The wholesale order arrived because someone asked, not because anyone went looking. It was the highest-value thing the brand did all year and it was inbound, which says the outbound version was never tried.",
        ],
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
      "A meme about designers handing developers a brief that looks great and costs a fortune to build. I wanted to know if that was still true. One day, under $300, working site.",
    description:
      "The joke is the gap between what a designer imagines and what gets built. A chameleon that takes the colour of the product beside it is a lovely idea and a five-figure production. I took the brief seriously to find out whether AI had closed that gap.",
    tags: ["Art direction", "AI production", "Front-end", "Motion"],
    meta: ["Self-directed", "Build challenge", "Mar 2026"],
    website: "https://deft-pasca-8eec5e.netlify.app",
    strip: [
      { image: "lumiskin/hero-aurora.jpg", alt: "" },
      { image: "lumiskin/collection-aurora.jpg", alt: "" },
      { image: "lumiskin/hero-jade.jpg", alt: "" },
      { image: "lumiskin/hero-peach.jpg", alt: "" },
    ],
    chapters: [
      { id: "dare", label: "The dare" },
      { id: "idea", label: "The idea" },
      { id: "make", label: "Making it" },
      { id: "cost", label: "What it cost" },
      { id: "build", label: "The build" },
      { id: "honest", label: "What I'd change" },
    ],
    blocks: [
      {
        id: "dare",
        kind: "prose",
        heading: "Designers dream it. Developers price it.",
        body: [
          "A meme went round design circles: a concept site where a chameleon takes the colour of the bottle beside it, cut against the canyon-swing clip. Designer in the chair. Programmer and Developer either side, about to push.",
          "Everyone has been in that meeting. The design is good. Building it means a studio, a handler and a render farm, so it dies. I wanted to know whether that was still true or just a habit, and whether AI had actually changed the answer.",
          "It had. One day, under $300, on consumer subscriptions.",
        ],
      },
      {
        id: "dare",
        kind: "video",
        heading: "The meme that started it",
        intro: "The concept site on top, the verdict underneath.",
        src: "/media/case-studies/lumiskin-inspiration.mp4",
        poster: "lumiskin/inspiration-poster.webp",
        portrait: true,
        alt: "A split screen: above, a concept site for Chroma Juice where a chameleon shifts through berry, orange and green to match each bottle; below, the canyon-swing meme with two people in blue jackets labelled Programmer and Developer standing over a seated man labelled Designer.",
        footnote:
          "Not my work, and included as the thing being answered rather than as a portfolio piece. The concept site and the edit are credited to @uiux_sumeet, whose watermark is on the clip.",
      },
      {
        id: "idea",
        kind: "prose",
        heading: "A hero that earns the word premium",
        body: [
          "Copying the juice site would have proved nothing, so I moved the mechanic to cosmetics, a category whose identity is already colour. Aurora Petal is lavender, Jade Mist green, Peach Quartz warm clay.",
          "The chameleon settles beside a bar, takes its colour, and the product card arrives on the match. No line of copy explaining it.",
          "Changing the category kept every expensive part: a live animal, three colourways, macro product work and a thirty-second film. The exact bill the meme is laughing at.",
        ],
      },
      {
        id: "idea",
        kind: "video",
        heading: "One mechanic, three colourways",
        intro:
          "Stills undersell this one. The whole idea is a transition, so the page shows the thing running rather than three frames of it. The chameleon matches the bar it is standing next to, and the card arrives once the colour has landed.",
        src: "/media/portfolio/website_video_lumiskin.mp4",
        poster: "lumiskin/hero-aurora.jpg",
        alt: "The LumiSkin hero cycling through all three colourways: the chameleon shifts to lavender, pink and amber to match Aurora Petal, Jade Mist and Peach Quartz, each with its product card.",
      },
      {
        id: "make",
        kind: "prose",
        heading: "Generated, not shot",
        body: [
          "Nothing was photographed or filmed. Stills first, then animated into three eight-second clips, then a site built with an agentic IDE and finished by hand.",
          "Order matters. Locking the bars and palette as cheap stills meant the film only had to move something that already existed. Go straight to video and you re-roll thirty seconds every time a soap looks wrong.",
          "The hard part was consistency: keeping the same bar looking like the same bar across sixteen images. That is where the effort went, not into any single prompt.",
        ],
      },
      {
        id: "cost",
        kind: "metrics",
        heading: "What it actually cost",
        intro:
          "Three line items, all of them subscription or per-second pricing rather than a quote.",
        items: [
          {
            value: "< $300",
            label: "All in",
            context:
              "Subscriptions plus generation, including the agentic IDE used to build the site.",
          },
          {
            value: "1 day",
            label: "Start to working site",
            context: "One person. No crew, no studio, no handler, no CGI house, no animal.",
          },
          {
            value: "16 + 24s",
            label: "Generated images and video",
            context:
              "A $20 consumer subscription for the stills; ≈$10 of Veo at its published $0.40/second rate for the film.",
          },
        ],
        footnote:
          "Veo pricing is Google's published Gemini API rate. Subscriptions are list prices for the consumer tiers actually used. Time is not costed. It was a day's work, and putting a day rate on it would be inventing a number.",
      },
      {
        id: "cost",
        kind: "metrics",
        heading: "What the conventional route would have cost",
        intro:
          "Published 2026 market rates for the same three jobs, quoted as ranges because that is how they are quoted. These are benchmarks, not quotes anyone gave for this project.",
        items: [
          {
            value: "$6,500+",
            label: "Conservative total",
            context:
              "Taking the bottom of every range below, and still excluding the animal handler this concept needs.",
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
            label: "The gap",
            context: "Between the cheapest conventional route and what this cost.",
          },
        ],
        footnote:
          "Sources: 2026 photography pricing surveys (LarsMiller Media, ProShot Media, Nightjar); 3D animation from Advids and Vidico; landing page rates from Uwindi and eseospace. These ranges buy a licensed shoot, a crew, usage rights and someone accountable. The comparison is of output, not of everything an agency sells.",
      },
      {
        id: "build",
        kind: "prose",
        heading: "The part that is not a prompt",
        body: [
          "React 19, Vite and GSAP, with Google Antigravity doing the first pass and Claude finishing it. The split was deliberate: the agentic pass gets a page standing up fast and is much weaker on the small decisions that separate a demo from something shippable.",
          "The main one: the sequence is not driven off the video. The obvious build reads the four-second mark off the player itself, and breaks silently, because autoplay is blocked often enough (Low Power Mode, Safari, data saver) that the cards can simply never appear on a page whose whole job is showing products.",
          "So the timeline runs on its own timers and the video is decoration. Eight seconds a segment, card at 3.2 seconds. If the video never plays the sequence still runs: products over a still frame, which is worse rather than broken.",
        ],
      },
      {
        id: "build",
        kind: "checklist",
        heading: "The rest of the detail work",
        intro:
          "Small things, and the reason the page holds up away from a fast desktop on a good connection.",
        items: [
          "Reduced motion is honoured properly: the auto-advance stops entirely, so the hero settles on one product instead of cycling. The cards still appear. The preference is about motion, not about hiding the products.",
          "An IntersectionObserver pauses the video once the hero scrolls away, so a page left open in a tab is not decoding 1080p to nobody.",
          "A one-directional scrim sits under the wordmark, because the type has to stay legible over three different clips whose backgrounds change colour.",
          "Products are positioned as percentages against the frame rather than pinned to pixels, so the card lands next to the chameleon at any viewport instead of drifting off it.",
          "The seek is wrapped in a try/catch: setting currentTime on a video that is not seekable yet throws, and losing the whole sequence to a race on load would be a silly way to break a hero.",
        ],
      },
      {
        id: "honest",
        kind: "prose",
        heading: "What I'd change",
        body: [
          "The three clips crossfade rather than continue: the chameleon dissolves between colours instead of walking through them. Most people will not read it as a cut, but the concept deserves one unbroken take. A generation problem I did not solve.",
          "Generate the products at a fixed camera and lighting setup from the start. The collection frames drift in angle between bars: invisible on the hero, obvious in a grid. Lock it as a constraint before generating, not after.",
          'The conclusion is narrower than "AI is cheap". What collapsed is the cost of making assets. The judgement calls did not get cheaper, and they are what makes the page work.',
          "The chameleon was not my idea. It was a meme saying the thing could not be built. Taking it seriously and shipping it in a day was the work. Ideas were never the scarce part. Execution was.",
        ],
      },
    ],
    seo: {
      title: "LumiSkin case study | Alroy Ndhlovu",
      description:
        "A meme said the brief was too expensive to build. A cosmetics hero with a colour-matching chameleon, made in a day for under $300 against a $6,500+ quote.",
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
