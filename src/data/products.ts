import type { ImageMetadata } from "astro";
import { CASE_STUDIES, studyPath } from "./case-studies";

/**
 * Products Alroy has built and shipped (section 05).
 *
 * The three sections that show work each answer a different question,
 * and the split is what keeps them from repeating each other:
 *
 * - Portfolio (04) is a quick showcase — craft artifacts by discipline.
 * - Products (05) is this: can he build? Each card is a thing with a
 *   name, a user and a stack, plus the condensed story of making it.
 * - Case studies (06) is client work, judged on what it returned to the
 *   business.
 *
 * So a product appears here and nowhere else. Its long-form build story
 * lives at /products/<slug>/ and is reached from this card, rather than
 * taking a second card in section 06 and reading as two projects.
 *
 * Taglines and descriptions are taken verbatim, or lightly tightened,
 * from lib/apps.ts in the fortherestofus studio repo, which is the
 * source of truth for how these are positioned.
 */
const files = import.meta.glob<{ default: ImageMetadata }>(
  "../assets/products/*.{png,jpg,jpeg,webp,avif}",
  { eager: true },
);

const byFilename = new Map<string, ImageMetadata>();
for (const [path, module] of Object.entries(files)) {
  const filename = path.split("/").pop();
  if (filename) byFilename.set(filename, module.default);
}

export function productImage(filename?: string): ImageMetadata | null {
  if (!filename) return null;
  return byFilename.get(filename) ?? null;
}

export interface ProductShot {
  image: string;
  alt: string;
}

/**
 * The condensed build story, in the order a reader needs it: what was
 * wrong, what was done about it, and the thing that shows it worked.
 *
 * Three short entries and no more. This is a card — the full version is
 * the page it links to, and a card that tries to be the page is just a
 * page nobody scrolls. Every figure here is quoted from that page
 * rather than written fresh, so the two can never disagree.
 */
export interface ProductStory {
  problem: string;
  approach: string;
  result: string;
}

export interface Product {
  name: string;
  category: string;
  tagline: string;
  description: string;
  /** Shipping state, shown as a chip. */
  status: string;
  platform: string;
  /**
   * What it is actually built with, read off each repo's package.json
   * or manifest rather than recalled. Kept to the choices that say
   * something — the framework, the data layer, the hard parts — not
   * every transitive dependency. The last entry is the dev tooling,
   * because how these get built this fast is part of the point.
   */
  stack: string[];
  /**
   * The frame the screenshots are shown in, which has to match the
   * thing they are pictures of. A browser-extension popup is not a
   * phone: forcing one into a handset-shaped frame crops a third of it
   * away.
   */
  shape: "phone" | "panel" | "screen";
  /** The problem, the approach and the proof. See ProductStory. */
  story: ProductStory;
  /** Slug of the matching build story, where one exists. */
  caseStudy?: string;
  /**
   * Where to go and get it, once there is somewhere to go. Only set for
   * products that have actually shipped — a link is the difference
   * between a portfolio of concepts and a portfolio of things people
   * can install.
   */
  link?: { url: string; label: string };
  shots: ProductShot[];
}

/**
 * A product keeps its `caseStudy` slug whether or not the page has been
 * written yet, because the slug is correct either way. The link only
 * renders once a page actually exists — pointing at a 404 is worse than
 * not mentioning it. Asking CASE_STUDIES directly rather than keeping a
 * manual flag means a new study wires itself up when it lands.
 */
export function hasCaseStudyPage(slug?: string): boolean {
  return slug !== undefined && CASE_STUDIES.some((study) => study.slug === slug);
}

/**
 * The URL of a product's build story, or null when it has none written.
 *
 * Asks `studyPath` rather than composing the path here, so a card, the
 * page it points at and the llms.txt line are all reading the same
 * rule — and moving a study between sections stays a one-word change.
 */
export function caseStudyLink(slug?: string): string | null {
  const study = slug ? CASE_STUDIES.find((entry) => entry.slug === slug) : undefined;
  return study ? studyPath(study) : null;
}

export const PRODUCTS: Product[] = [
  {
    name: "Hakkan",
    category: "Research & Content",
    tagline: "Worth listening to.",
    description:
      "Hakkan starts with research, not a blank page. It reads the conversation where it actually happens, hands back a report with receipts, and helps you build content from it in your own voice. Yours to do what you like with.",
    status: "Beta",
    platform: "Web",
    stack: [
      "Next.js 16",
      "React 19",
      "TypeScript",
      "Tailwind v4",
      "Supabase",
      "Vercel AI SDK",
      "Claude + Grok",
      "Paddle",
      "Recharts",
      "Sentry",
      "Claude Code",
    ],
    shape: "screen",
    story: {
      problem: "AI writing tools start from a blank page. Fluent output that knows nothing.",
      approach:
        "Research first. Hakkan reads the real conversation, then helps you write from it in your voice. The report is the source, never the model.",
      result:
        "Rebuilding the evidence filter took real human voices from 29% of citations to 57%. Anything the model inferred is flagged, not hidden.",
    },
    caseStudy: "hakkan",
    shots: [
      {
        image: "hakkan-report.jpg",
        alt: "Hakkan research report showing themes and a sentiment split.",
      },
      {
        image: "hakkan-research.jpg",
        alt: "Hakkan gathering the conversation across social platforms and the open web.",
      },
      {
        image: "hakkan-personas.jpg",
        alt: "Hakkan persona view, grouping the voices found in the research.",
      },
      {
        image: "hakkan-visual-report.jpg",
        alt: "Hakkan visual report, charting where the evidence and the sentiment diverge.",
      },
    ],
  },
  {
    name: "InSpiritInTruth",
    category: "Faith & Devotion",
    tagline: "Take your faith into your own hands.",
    description:
      "Faith personalisation. A weekly devotional written to be read slowly, one written for whatever you are carrying right now, and the whole Bible in the app. For people who cannot always make it to church but still want to stay close. No algorithm, no ads.",
    status: "In development",
    platform: "iOS and Android",
    stack: [
      "React Native",
      "Expo 56",
      "TypeScript",
      "Expo Router",
      "NativeWind",
      "Supabase",
      "TanStack Query",
      "Reanimated + Skia",
      "RevenueCat",
      "Claude Code",
    ],
    shape: "phone",
    story: {
      problem:
        "The devotional has not changed in generations. One text, written for everyone, read alone.",
      approach:
        "Faith personalisation. Share what you are carrying and get a devotional written for that, rooted first in scripture.",
      result:
        "Verification takes ~77% of the AI effort against ~22% on the writing. An app that quotes scripture cannot afford to misquote it.",
    },
    caseStudy: "inspiritintruth",
    shots: [
      {
        image: "isit-home.png",
        alt: "InSpiritInTruth home screen with the week's devotional and the verse of the day.",
      },
      {
        image: "isit-personalise.png",
        alt: "The personalisation step, asking what you are walking through, with mood options below.",
      },
      {
        image: "isit-devotionals.png",
        alt: "The devotionals tab, with the option to have one written for you.",
      },
      {
        image: "isit-discover.png",
        alt: "Discover, browsing devotionals by theme from Faith to Gratitude.",
      },
      {
        image: "isit-bible.png",
        alt: "The in-app Bible with a highlighted verse and the note and save controls.",
      },
      {
        image: "isit-profile.png",
        alt: "Profile screen showing a four day reading streak and totals.",
      },
    ],
  },
  {
    name: "tapa.",
    category: "Food & Cooking",
    tagline: "What can I cook with this?",
    description:
      "Adulting, minus one decision. Tell it what is in the fridge by typing, talking or photographing it, and get back a real meal built around your tastes. Dietary needs are set once and enforced as hard rules.",
    status: "In development",
    platform: "iOS and Android",
    stack: [
      "React Native",
      "Expo 56",
      "TypeScript",
      "NativeWind",
      "Supabase",
      "SQLite offline cache",
      "Zustand",
      "Vision + voice input",
      "RevenueCat",
      "Claude Code",
    ],
    shape: "phone",
    story: {
      problem:
        "Deciding what to eat is the daily tax on being an adult. Recipe sites answer it with fifty results.",
      approach:
        "Work with what you have. Type, say or photograph what is in the fridge and get one meal back, built around your tastes. Dietary needs are set once and enforced.",
      result:
        "Convenience and variety, minus the deciding. The free tier was set from how often people actually cook, not from hope.",
    },
    caseStudy: "tapa",
    shots: [
      { image: "tapa-home.jpg", alt: "tapa. home screen with the day's recipe suggestion." },
      {
        image: "tapa-generate.jpg",
        alt: "Entering the ingredients you have on hand to generate a recipe.",
      },
      { image: "tapa-recipe.jpg", alt: "A generated recipe with ingredients and method." },
      { image: "tapa-cooking.jpg", alt: "Cooking mode, stepping through the method." },
    ],
  },
  {
    name: "CaughtSlipping",
    category: "Focus & Productivity",
    tagline: "The browser extension that calls you out.",
    description:
      "A cheeky extension that calls you out, and always shows you where the time went. Flip it around and Caught Grinding warns you when productive has quietly become overworking. Everything stays on your device.",
    status: "Live",
    platform: "Chrome extension",
    link: {
      url: "https://chromewebstore.google.com/detail/ncepfdipljmhbhehjegfemndcgaclnlg",
      label: "Get it on the Chrome Web Store",
    },
    stack: [
      "Manifest V3",
      "Vanilla JS, no framework",
      "Service worker",
      "declarativeNetRequest",
      "Offscreen documents",
      "chrome.storage, local only",
      "Chart.js",
      "Claude Code",
    ],
    shape: "panel",
    story: {
      problem:
        "Your phone nags you about screen time. The real damage happens on the computer you work at all day.",
      approach:
        "Productivity for the browser, with a twist. It tracks where the hours go and calls you out — then flips, and warns you when productive has become overworking.",
      result:
        "Live on the Chrome Web Store. No account, no server: everything stays on your device.",
    },
    shots: [
      {
        image: "caught-today.jpg",
        alt: "CaughtSlipping's daily verdict, with a shame meter and a per-site breakdown.",
      },
      {
        image: "caught-focus.jpg",
        alt: "The focus view reporting 80 percent productive for the day.",
      },
      {
        image: "caught-work.jpg",
        alt: "Work mode showing hours focused against a balance check.",
      },
      { image: "caught-sites.jpg", alt: "The full list of sites visited during work mode." },
    ],
  },
];
