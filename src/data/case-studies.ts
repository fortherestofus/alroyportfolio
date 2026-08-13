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
    dates: "Jul 2025 – Jan 2026",
    hero: {
      image: "thrifty-adventures/hero-social.jpg",
      alt: "A grid of Thrifty Adventures tour posts covering Turkey, Europe, Zanzibar and Egypt.",
    },
    summary:
      "Built a travel brand's entire paid and organic presence from zero across four channels: 3.1 million TikTok views, 70,000 Google clicks for $2,099, and 742 LinkedIn leads at R30 — each channel doing the one job it is actually good at.",
    description:
      "Thrifty Adventures runs group and tailored tours out of South Africa. No paid activity, no tracking, nothing running. I built four channels, each doing one job: TikTok to get found, TikTok ads to start conversations, Google to catch people already searching, LinkedIn for the considered trip.",
    tags: ["Paid media", "Organic social", "Search", "Lead generation", "Channel strategy"],
    logoFile: "thrifty.jpeg",
    meta: ["Client · Thrifty Adventures", "Paid media & content", "Jul 2025 – Jan 2026"],
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
          "LinkedIn is where you go to reach a job title. Thrifty Adventures sells group tours to Egypt, Namibia, Dubai and Zanzibar, to people spending their own money on their own holidays. On paper it is the wrong platform, and that is roughly what the industry assumes.",
          "No campaigns, no saved audiences, no tracking, no idea what a click was worth. So the question was not how to scale LinkedIn. It was whether LinkedIn works for consumer travel at all.",
          "Seven months and R117,322 later, it does — but not for the reason I expected going in.",
        ],
      },
      {
        id: "testing",
        kind: "prose",
        heading: "One objective at a time, then all of them",
        body: [
          "July was deliberately small: R1,834 behind a single website-visits campaign, split only by whether the audience sat in South Africa or in the diaspora abroad. 29,032 impressions, and R5.80 a click, which is what an account with no history pays.",
          "September was the real test: four campaigns, four objectives, one month — awareness, traffic, lead generation and engagement. Running them side by side is the only way to learn what a platform charges for each thing it sells. It produced the first 202 leads and the comparison that decided everything after.",
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
          "CPM fell 81% across the run, R63.16 to R12.18. Cost per landing page click fell 70%, R5.80 to R1.72. Monthly reach grew about 47 times. Some of that is an account earning its own history.",
      },
      {
        id: "offer",
        kind: "metrics",
        heading: "The brochure was the whole finding",
        intro:
          "Targeting did not decide this. Two sets of lead forms, same audience, same platform, overlapping months. One asked people to enquire about a trip. The other offered the 2026 brochure. Only one asked for something the reader already wanted.",
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
          "Same platform, market, months and form. The only variable was what the ad asked for. The 8.93% is engagement, not click-through: LinkedIn bills reactions, comments, shares and follows as clicks on engagement campaigns, and that post drove no landing page clicks.",
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
          "Clicks here are landing page clicks, not LinkedIn's headline Clicks column, which also counts reactions, comments, shares and follows. The 0.52% median is AgencyAnalytics, January 2025, across 150,000+ campaigns. Rand costs are account facts — no credible South African or travel-sector benchmark exists.",
      },
      {
        id: "tiktok",
        kind: "prose",
        heading: "The channel that did the finding",
        body: [
          "LinkedIn was the experiment. TikTok was the engine — and it did not start from nothing. The account already existed with an audience behind it, which changes what a view count means.",
          "Destinations shot plainly, captioned as questions people actually type: the Dubai tour, the Namibia tour, what a Zanzibar trip costs. A small thing, and the whole reason it works — the videos stay findable months later instead of for the two days the algorithm favours them.",
        ],
      },
      {
        id: "tiktok",
        kind: "metrics",
        heading: "3.1 million views in eight months",
        intro:
          "What the account did in the window I ran it — not what it was worth before, and not a claim to have built it from scratch.",
        items: [
          {
            value: "3.1M",
            label: "Video views",
            context: "Organic, Jun 2025 to Jan 2026.",
          },
          {
            value: "4.6M",
            label: "Viewers reached",
            context: "Over twelve months, 3.3M of them people who had never seen the brand.",
          },
          {
            value: "39.8K",
            label: "Followers",
            context: "The account's size at the end of the run, and 116.8K likes.",
          },
          {
            value: "38.1%",
            label: "Of views came from search",
            context:
              "People looking for a destination and finding Thrifty, rather than being served it.",
          },
          {
            value: "7,200",
            label: "Shares",
            context:
              "The signal that matters most on the platform: someone sending it to a person.",
          },
          {
            value: "50.4K",
            label: "Best performing video",
            context: "The 2026 travel packages set, pinned to the profile.",
          },
        ],
        footnote:
          "Views, viewers, shares and the search split are period figures for Jun 2025 to Jan 2026. The follower count is the account's size, not growth — it had a following before this work and the starting number was not recorded. On search: For You typically carries around 70% of views, here 57.6%. No published benchmark exists for search share by account.",
      },
      {
        id: "tiktok",
        kind: "metrics",
        heading: "And then paid, to start conversations",
        intro:
          "One destination, one video, one objective: get a person into a message thread. A week of delivery, priced per conversation started.",
        items: [
          {
            value: "166",
            label: "Conversations started",
            context: "In a single week, across nine destination videos.",
          },
          {
            value: "R7.51",
            label: "Average cost each",
            context: "Weighted across all nine, not the best one quoted as if it were typical.",
          },
          {
            value: "71",
            label: "Best single video",
            context: "Bali and Thailand, at R7.54 a conversation.",
          },
          {
            value: "R2.46",
            label: "Cheapest",
            context: "Mauritius — five conversations, so a small sample rather than a trend.",
          },
        ],
        footnote:
          "TikTok's own figures for 30 Jan – 6 Feb 2026, reported as the week they cover. \u201cConversations\u201d is TikTok's metric for a messaging thread opened off an ad. How many became bookings is unknown — that attribution was never wired up.",
      },
      {
        id: "google",
        kind: "metrics",
        heading: "Search, for the people already looking",
        intro:
          "The cheapest job on the list, and the one with the least argument attached: someone typing the name of a tour is not a person to be persuaded.",
        items: [
          {
            value: "70,099",
            label: "Clicks",
            context: "From 872,272 impressions, Jun 2025 to Feb 2026.",
          },
          {
            value: "$2,099",
            label: "Total spend",
            context: "Across six campaigns — search, display, Performance Max and Demand Gen.",
          },
          {
            value: "$0.03",
            label: "Average cost per click",
            context: "Against a $2.14 median for travel in Google's 2026 benchmark set.",
          },
          {
            value: "8.04%",
            label: "Account click-through rate",
            context: "The display campaign carried 18.12% of it on its own.",
          },
          {
            value: "$0.12",
            label: "Cost per click, search only",
            context: "The 2025 Trips campaign, at a 4.30% click-through rate.",
          },
        ],
        footnote:
          "Benchmark: WordStream's 2026 study of 13,474 US search campaigns — travel medians of 9.32% CTR, $2.14 CPC, $44.70 per lead. Two caveats. It covers search, and most of this volume is display and Performance Max, where clicks are cheaper by design. And it is US pricing; South African inventory is far less contested, so much of the gap is the market rather than the management.",
      },
      {
        id: "google",
        kind: "gallery",
        pair: true,
        heading: "The dashboards behind the numbers",
        intro:
          "Every figure on this page is read off one of these rather than reconstructed from a report written afterwards.",
        shots: [
          {
            image: "thrifty-adventures/tiktok-overview.jpg",
            alt: "TikTok Studio: 3.1M video views, 25K profile views, 29K likes and 7.2K shares, with the traffic source panel showing 57.6% For You and 38.1% Search.",
          },
          {
            image: "thrifty-adventures/tiktok-profile.jpg",
            alt: "The Thrifty Adventures TikTok profile: 39.8K followers, 116.8K likes, and a grid of destination videos led by the 2026 travel packages set at 50.4K views.",
          },
          {
            image: "thrifty-adventures/tiktok-ads.jpg",
            alt: "TikTok Ads manager showing cost per conversation by destination video, from R2.46 for Mauritius to R24.25 for Zimbabwe and Botswana.",
          },
          {
            image: "thrifty-adventures/google-report.jpg",
            alt: "Google Ads report editor: six campaigns totalling 70,099 clicks and 872,272 impressions at an 8.04% click-through rate and $2,099 spend.",
          },
        ],
      },
      {
        id: "mix",
        kind: "checklist",
        heading: "What each channel was actually for",
        intro:
          "The point of running four is not four times the volume. It is that a holiday is not bought in one motion, and the channels are good at different parts of it.",
        items: [
          "TikTok organic is how the brand gets found — 38% of views arriving from search means the back catalogue keeps working long after a post stops trending.",
          "TikTok ads turn that attention into a conversation with a human being, at single-digit rand, which is the cheapest qualified contact anywhere in the account.",
          "Google catches the people who have already decided to travel and are pricing it. Cheapest clicks in the mix, and the least persuasion required.",
          "LinkedIn sells the considered trip — the professional booking a group tour, reached with a brochure rather than an enquiry form, at R26.74 a lead.",
          "None of them was asked to do another one's job, which is the actual finding. The brochure that made LinkedIn work would have died on TikTok, and the destination video that pulls conversations on TikTok drew 0.10% click-through as a LinkedIn ad.",
        ],
      },
      {
        id: "honest",
        kind: "prose",
        heading: "What didn't work",
        body: [
          "Brand awareness was the most expensive thing on the platform: R8,400 at 0.109% CTR and R19.76 a click. As a click channel it failed. It did deliver 211,026 video views and 84,324 completions, so the money was not burnt — but there were cheaper ways to buy that attention.",
          "Single-destination videos did not travel. Egypt, Namibia and Dubai each drew 0.10–0.16% CTR at R25–R37 a click. The one composite — a year of trips in a single edit — pulled 1,791 clicks at R0.87 and 106,232 completions. People responded to the range, not one place.",
          "LinkedIn's conversion column is not reportable: 97,475 conversions against 57,345 clicks. It counts actions after an impression as well as after a click, on a 30-day click and 7-day view window, and a broad rule fires on ordinary page loads. Until it is split into click and view conversions it cannot be described as people who saw an ad and acted. No conversion figure appears on this page.",
          "Google's column has the same fault: 12,069 conversions from 70,099 clicks, and 9,528 from 4,099 on the search campaign alone — a 232% conversion rate. A broad conversion action firing on page loads. Clicks, impressions, CTR and cost are real; conversions are not quoted.",
        ],
      },
      {
        id: "honest",
        kind: "prose",
        heading: "What I'd do differently",
        body: [
          "Run the brochure from month one. It only entered in September, so two months of lead spend went on the weaker ask — 36.6% form completion against 8.6%. Test the offer before tuning the audience.",
          "Configure conversion tracking on day zero. The broad tag made seven months of conversion data unusable, and nothing after the fact can un-mix view-throughs from clicks.",
        ],
      },
    ],
    seo: {
      title: "Thrifty Adventures case study | Alroy Ndhlovu",
      description:
        "How Alroy Ndhlovu tested LinkedIn for a South African travel brand: 742 leads at R30, and why the offer mattered more than the audience.",
    },
  },
  {
    slug: "innovatr",
    name: "Innovatr",
    dates: "Mar 2026 – Sep 2026",
    hero: {
      image: "innovatr/web-home-after.jpg",
      alt: "The rebuilt Innovatr home page, leading with the consumer-intelligence positioning.",
    },
    summary:
      "Rebuilt the whole front of a research business — positioning, website, content engine and paid programme — sourced its addressable market from nothing, and replaced a US$8,000-a-year software licence with a product the company could sell.",
    description:
      "Innovatr is a consumer research and growth consultancy selling into a market that had bought the same thing from Kantar, IPSOS and Nielsen for decades. I joined as Brand & Marketing Manager. This is what changed in seven months.",
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
          "The product was genuinely different. The way it was presented was not.",
          "The site led with “Stop Guessing. Launch Better Innovation.” — a line that could have belonged to any research agency. No paid programme, effectively no inbound traffic, and no way to turn the research already being produced into demand for more of it.",
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
          "Every study Innovatr ran produced findings nobody outside the client ever saw. Two jobs came out of that. The Gen Z drinking carousel is the research argued in public, with its 4,339 comments shown rather than described. The old-versus-new carousel makes the case for the method itself. Both do what the product does: state a claim, then put the evidence under it.",
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
          "The paid programme ran the same argument in a format built to be scrolled past. “The Innovatr Way” set the frame directly: Kantar, IPSOS and Nielsen unchanged in decades, six-week turnarounds, R500K studies, 30% of findings ever influencing a decision.",
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
          "A business selling research to decision-makers has to know who they are. Innovatr had no list. I built one from Apollo prospecting, the Workshop17 tenant database, client outreach, the LinkedIn page audience and inbound signups, de-duplicated it into one CRM, then matched it back into LinkedIn as the ad audiences. That last step is the point: ads aimed at named companies and real job titles, not the platform's guesses.",
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
          "Sourced audience, not inbound enquiries. The proof is under Results: LinkedIn's delivery demographics show the ads landing on the seniorities and companies these lists were built from.",
      },
      {
        id: "results",
        kind: "metrics",
        heading: "The ads landed in the right rooms",
        intro:
          "Spending on ads is easy. The question is whether they reached people who can buy. Innovatr sells to senior decision-makers at banks, insurers and consumer brands, so the first test is not clicks — it is LinkedIn's own delivery demographics.",
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
          "LinkedIn's delivery demographics for the account, April–July 2026. Nearly two-thirds of every rand landed on someone senior enough to sign off a study.",
      },
      {
        id: "results",
        kind: "trend",
        heading: "Leads grew, and got better every month",
        intro:
          "Lead-form leads by month, count and quality together. The programme ran in short creative flights, each one tightening who saw the forms.",
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
          "Work-email share climbed from ~27% at launch to ~75% mid-programme to 91% in the newest cohort. Leads are not set against the total media budget — that budget bought four different jobs, separated in the next section.",
      },
      {
        id: "results",
        kind: "metrics",
        heading: "One budget, four jobs — each judged on its own",
        intro:
          "Most of the budget was never pointed at leads. Video bought attention, carousels bought site conversions, static bought cheap clicks, and only the lead-gen documents bought leads. Each format is scored on its own job, against LinkedIn's B2B benchmarks.",
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
          "No flight ran longer than five weeks against LinkedIn's six to eight week optimisation runway, so these are pre-optimisation numbers. A June conversion tag counting view-throughs is excluded throughout.",
      },
      {
        id: "results",
        kind: "metrics",
        heading: "Every benchmark, side by side",
        intro:
          "The account against LinkedIn's published B2B norms, and the email programme against standard B2B benchmarks. One number missed; it is shown with the rest.",
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
          "One miss: carousel CTR ran 0.32% against a 0.40–0.55% band, the only format below benchmark. So carousels stayed on the conversion job they were winning rather than the click job they were losing.",
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
          "By role: CX management at Capitec, market research at FNB, business analysis at Old Mutual, risk and compliance at Vodacom Financial Services, business development at Cardinal Insurance Management Systems, head of marketing at Warwick Wine Estate, the chief executive of Bed King, product lead at SnapScan. Roles only, from the lead-form exports.",
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
          "Ask it a plain-language question — “How do South Africans talk about Chinese car brands versus German ones?” — and it picks the platforms worth reading, then returns a report where every claim resolves to a real comment. Sentiment, emotion mix, where the conversation lives, what is spiking. It runs on the Social Crawl API: 46 platforms across social, search, commerce and the open web.",
          "That turned a line of annual cost into a line of product. The same engine Innovatr would have rented became something it could sell, positioned at R20,000 a study.",
          "The saving is the small part. The tool Innovatr nearly licensed was itself acquired by a market research group a few months later — terms undisclosed, after four years and outside investment. A research firm wanted the capability in-house. Innovatr reached the same conclusion for two months of work, a Replit subscription and a Claude one.",
          "Not parity — theirs is a company with a roadmap, a support desk and customers. The point is narrower: the capability that used to justify an acquisition is now something one person can build in a quarter. The question is no longer whether you can afford to build it, but whether owning beats renting.",
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
          "R20,000 is the positioned price, not revenue booked. The licence figure is the quote Innovatr held at the time. Platform count is Social Crawl's published coverage — 46 platforms, 368 endpoints — of which Social Sweep queries the relevant subset.",
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
    dates: "Jul 2026 – present",
    hero: {
      image: "products/hakkan-report.jpg",
      alt: "A Hakkan report: 965 items cited and 903 real voices across seven platforms, with the sentiment split beneath.",
    },
    summary:
      "Built a content research tool to fight AI slop — content is created strictly from a researched report, real articles and real conversations, and the tool shows you when a number is derived rather than researched.",
    description:
      "Hakkan (発刊, “to publish”) is a research-first content tool. Give it a topic and it reads the real conversation — Reddit, TikTok, X, YouTube, the open web — then hands you a visual report with receipts and builds content from it in your own voice.",
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
          "Twelve years in marketing, watching the medium slide into what everyone now calls AI slop: fluent text that reads fine and knows nothing. The tools caused it. Every AI writer starts from a blank page and asks the model to fill it.",
          "Hakkan inverts that. It starts from thousands of real articles, posts and conversations matched to your question, and treats them as the source of truth. Content is built strictly from the report — the model is never the source. What it cannot do, you add yourself.",
          "Hakkan (発刊) is Japanese for “to publish”, and aloud it echoes “harken” — to listen closely. Listen first, then publish. The design borrows from paper and study markers, because the argument is that the oldest publishing values still apply.",
        ],
      },
      {
        id: "how",
        kind: "prose",
        heading: "How it works: research → report → your voice",
        body: [
          "Give it a topic. It fans out across social and the open web, filters for relevance, and builds a visual report: themes categorised, sentiment weighed, angles ranked, every quote cited to whoever said it. Then export the research, or generate content from it in a voice trained on your own writing.",
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
          "The promise is “what people actually said”, and the first evidence filter quietly betrayed it. A verbose article restates the topic in its headline, so it scored high. A real reply — “Why need a nanny if I won’t have a job” — is short and oblique, so it died as off-topic. The filter was killing the material the product sells.",
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
          "Read the reference images, not a summary of them. Built from a written description, the first report page came out a 7,600-pixel essay — thirteen sections, ten screens — when every actual reference was a card grid with a metric band. A day lost to that.",
          "Batch the evidence filter from day one. Scoring every item in one model call worked until streaming delivered what we were paying for, and the call outgrew its timeout — killing runs that had already spent money. Small batches and bounded parallelism were always the right shape.",
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
    hero: {
      image: "inspiritintruth/hero-screens.jpg",
      alt: "Three InSpiritInTruth screens: the devotionals library, the home screen, and the in-app Bible.",
    },
    summary:
      "Brought personalisation to the devotional — a format that has not changed in decades — and engineered it so that an app quoting scripture can never quietly misquote it.",
    description:
      "A devotional app for imperfect journeys — the overwhelmed, the curious, the unchurched, the devoted. The format has looked the same for generations: one text, written for everyone, read alone. ISIT keeps that rhythm and adds what it never had — a devotional written for what you are carrying today.",
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
          "The devotional is one of the oldest content formats there is: a passage, a reflection, a prayer, the same page for everyone. That sameness is its comfort and its limit. Someone navigating faith outside church, struggling to stay consistent, or carrying something specific today — the format has never met any of them where they are.",
          "ISIT keeps what is worth keeping: a weekly devotional written by a person, the whole Bible in the app, no algorithm, no ads. Then it adds the missing piece. Share what you are going through and it writes a devotional for exactly that, rooted first in Scripture.",
        ],
      },
      {
        id: "how",
        kind: "prose",
        heading: "Personalisation with a safety net",
        body: [
          "Generated spiritual guidance is higher-stakes than most AI writing. It has to carry authority without hallucinated certainty. So the generators run on the model that ranks first for restraint and coherence — here, restraint is the feature and creative risk is the failure mode. A cheaper, edgier model was tested on the real prompt and turned down twice.",
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
          "Define “today” on day one. The daily verse rolled over on UTC midnight instead of the reader's clock, and that assumption shipped three times before it became a written rule. Decide whose midnight you honour before the first query.",
          "Measure the cost of honesty before pricing it. The fact-check pass dominates the machine cost of a tailored devotional — several times the writing itself — and that was discovered after the price was set. Instrument first, price second.",
        ],
      },
    ],
    seo: {
      title: "InSpiritInTruth case study | Alroy Ndhlovu",
      description:
        "Bringing personalisation to the devotional: how InSpiritInTruth writes for what you are carrying today, and the engineering that keeps it honest.",
    },
  },
  {
    slug: "tapa",
    name: "tapa.",
    dates: "Jul 2026 – present",
    hero: {
      image: "tapa/hero-screens.jpg",
      alt: "Three tapa. screens: entering what is in the fridge, the home screen, and a finished recipe.",
    },
    summary:
      "Built a recipe app for every day and kept it radically simple — your ingredients in, one well-considered recipe out — because life needs more simple, and simplicity is a discipline, not a shortcut.",
    description:
      "tapa. answers one question: “what can I cook with this?” Tell it or show it what you have, how long you have and how many you are feeding, and it returns one considered recipe. Not fifty results. This is what keeping it that simple costs.",
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
          "Eating is a basic need, and deciding what to eat is the most taxing part of the day. Work out what you have, then what it could become, and because that is tedious you cook the same three things forever. Recipe sites answer with fifty results and a life story above each — more deciding, not less.",
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
            label: "Ways in, one recipe out",
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
          "Own the data properly from the first schema. Local recipes belonged to the phone, not the account, until a TestFlight tester signed into a fresh account and saw someone else's saved recipes. Every row owned by a user, enforced at the data layer, was always the right design.",
          "Research the free tier before launch, not in public. It went from three recipes a week to one to two inside two days, and the cooking-frequency data that settled it existed all along. Check how people already behave before deciding what to charge for.",
        ],
      },
    ],
    seo: {
      title: "tapa. case study | Alroy Ndhlovu",
      description:
        "Building something for every day and keeping it simple: how tapa. answers “what can I cook with this?” with one good recipe, and prices the exchange fairly.",
    },
  },
  {
    slug: "lumiskin",
    name: "LumiSkin",
    dates: "Mar 2026",
    hero: {
      image: "lumiskin/hero-aurora.jpg",
      alt: "The LumiSkin hero: a chameleon shifts to lavender to match the soap beside it as the Aurora Petal card slides in.",
      video: "/media/portfolio/website_video_lumiskin.mp4",
    },
    summary:
      "A luxury cosmetics hero with a live chameleon that changes colour to match the soap — the kind of film that normally needs a studio, a crew and a five-figure budget. Built for under $300.",
    description:
      "A design exploration: what a premium beauty brand looks like if the hero does something rather than sits there. A chameleon walks in, shifts colour to match the bar beside it, and the product card arrives on the match. Every asset generated, for less than a day of studio time.",
    tags: ["Art direction", "AI production", "Front-end", "Motion"],
    meta: ["Self-directed", "Design exploration", "Mar 2026"],
    website: "https://deft-pasca-8eec5e.netlify.app",
    strip: [
      { image: "lumiskin/hero-aurora.jpg", alt: "" },
      { image: "lumiskin/collection-aurora.jpg", alt: "" },
      { image: "lumiskin/hero-jade.jpg", alt: "" },
      { image: "lumiskin/hero-peach.jpg", alt: "" },
    ],
    chapters: [
      { id: "idea", label: "The idea" },
      { id: "make", label: "Making it" },
      { id: "cost", label: "What it cost" },
      { id: "build", label: "The build" },
      { id: "honest", label: "What I'd change" },
    ],
    blocks: [
      {
        id: "idea",
        kind: "prose",
        heading: "A hero that earns the word premium",
        body: [
          "Beauty brands nearly all open the same way: product on a clean surface, serif headline, Shop button. It photographs well and says nothing. What would a hero look like if it performed the promise instead of describing it?",
          "The soaps answer it. Aurora Petal is lavender, Jade Mist green, Peach Quartz warm clay — a range whose identity is colour. So the hero is a chameleon: it settles beside a bar, takes its colour, and the card slides in on the match. The metaphor sells without a line of copy explaining it.",
          "It is deliberately the expensive kind of brief. A live animal, three colourways, macro product work and a thirty-second film means a studio, a handler, a CGI house and a build. The sort of concept that dies in a budget meeting — which is why it was worth testing what production actually costs now.",
        ],
      },
      {
        id: "idea",
        kind: "video",
        heading: "One mechanic, three colourways",
        intro:
          "Stills undersell this one — the whole idea is a transition, so the page shows the thing running rather than three frames of it. The chameleon matches the bar it is standing next to, and the card arrives once the colour has landed.",
        src: "/media/portfolio/website_video_lumiskin.mp4",
        poster: "lumiskin/hero-aurora.jpg",
        alt: "The LumiSkin hero cycling through all three colourways: the chameleon shifts to lavender, pink and amber to match Aurora Petal, Jade Mist and Peach Quartz, each with its product card.",
      },
      {
        id: "make",
        kind: "prose",
        heading: "Generated, not shot",
        body: [
          "Nothing was photographed or filmed. Product renders, the chameleon, macro texture and lifestyle frames were generated as stills, animated into three eight-second clips, and wrapped in a site built with an agentic IDE and finished by hand.",
          "The order matters. Stills first meant the bars, packaging and palette were locked cheaply as images, so the film only had to move something that already existed. Going straight to video means re-rolling thirty seconds every time a soap looks wrong.",
          "The honest limitation is consistency. Getting the same bar to look like the same bar across sixteen images is the actual work, and it is where most of the effort went — not in any single prompt but in holding one object still across a set of them.",
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
            value: "16",
            label: "Generated images",
            context:
              "Product renders, macro texture, protocol and collection frames — produced on a standard ChatGPT subscription.",
          },
          {
            value: "24s",
            label: "Generated video",
            context:
              "Three eight-second clips from Google Veo, crossfaded into one continuous hero.",
          },
          {
            value: "≈$10",
            label: "The video, at list price",
            context:
              "24 seconds at Veo 3's published $0.40/second API rate. On Veo 3 Fast ($0.15/second) the same footage is under $4.",
          },
          {
            value: "$20",
            label: "A month of image generation",
            context: "The standard consumer subscription tier, not an enterprise licence.",
          },
          {
            value: "1",
            label: "People involved",
            context: "No crew, no studio, no handler, no CGI house, no animal.",
          },
          {
            value: "< $300",
            label: "All in",
            context:
              "Subscriptions plus generation, including the agentic IDE used to build the site.",
          },
        ],
        footnote:
          "Veo pricing is Google's published Gemini API rate. Subscriptions are list prices for the consumer tiers actually used. Time is not costed — this was built in evenings, and a day rate would be invented.",
      },
      {
        id: "cost",
        kind: "metrics",
        heading: "What the conventional route would have cost",
        intro:
          "Published 2026 market rates for the same three jobs, quoted as ranges because that is how they are quoted. These are benchmarks, not quotes anyone gave for this project.",
        items: [
          {
            value: "$800 – $2,400",
            label: "The stills, as photography",
            context:
              "16 images at the $50–$150 per image typical of beauty and cosmetics product work.",
          },
          {
            value: "$1,200 – $3,500",
            label: "One studio day",
            context:
              "Commercial product photographer day rate — before the animal handler this concept needs.",
          },
          {
            value: "$3,000 – $15,000",
            label: "The film, as 3D/CGI",
            context:
              "A 30–60 second product animation runs $3,000–$5,000; a 30-second commercial at the higher end reaches $5,000–$15,000.",
          },
          {
            value: "$1,500 – $6,000",
            label: "The site, built out",
            context:
              "A custom animated landing page: $1,500–$3,000 from a boutique agency, $3,000–$6,000 mid-size.",
          },
          {
            value: "$6,500+",
            label: "Conservative total",
            context: "Taking the bottom of every range above, and still excluding the handler.",
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
          "The main one: the sequence is not driven off the video. The obvious build reads the four-second mark off the player itself — and breaks silently, because autoplay is blocked often enough (Low Power Mode, Safari, data saver) that the cards can simply never appear on a page whose whole job is showing products.",
          "So the timeline runs on its own timers and the video is decoration. Eight seconds a segment, card at 3.2 seconds. If the video never plays the sequence still runs — products over a still frame, which is worse rather than broken.",
        ],
      },
      {
        id: "build",
        kind: "checklist",
        heading: "The rest of the detail work",
        intro:
          "Small things, and the reason the page holds up away from a fast desktop on a good connection.",
        items: [
          "Reduced motion is honoured properly: the auto-advance stops entirely, so the hero settles on one product instead of cycling. The cards still appear — the preference is about motion, not about hiding the products.",
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
          "The three clips crossfade rather than continue — the chameleon dissolves between colours instead of walking through them. Most people will not read it as a cut, but the concept deserves one unbroken take. A generation problem I did not solve.",
          "Generate the products at a fixed camera and lighting setup from the start. The collection frames drift in angle between bars — invisible on the hero, obvious in a grid. Lock it as a constraint before generating, not after.",
          'And the real conclusion is narrower than "AI is cheap". What collapsed here is the cost of producing assets. Deciding that a chameleon is the right idea, that the card should arrive on the colour match, and that the sequence must not depend on autoplay — none of that got cheaper, and all of it is what makes the page work.',
        ],
      },
    ],
    seo: {
      title: "LumiSkin case study | Alroy Ndhlovu",
      description:
        "A luxury cosmetics hero with a colour-matching chameleon, generated end to end for under $300 against a $6,500+ conventional production quote.",
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
