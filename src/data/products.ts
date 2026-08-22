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
    category: "Content Research & Development",
    tagline: "Worth listening to.",
    description:
      "A content research and creation assistant, built to fight AI slop. Pick a topic you want to lead, and Hakkan researches the real conversation into a cited report: a source of truth you create content from, in a voice it learns from you. A trends module keeps you current.",
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
      problem:
        "“Slop” made Oxford's 2024 Word of the Year shortlist: fluent AI content that knows nothing. Writing tools that start from a blank page produce it by design.",
      approach:
        "Research before writing. Hakkan builds a cited report on your topic as the source of truth, learns your own voice to write from it, and keeps you on the pulse with a trends module.",
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
      "Faith has always been communal: same readings, same routines, and a template feel to the personal side. InSpiritInTruth complements tradition rather than replacing it: devotionals written for whatever you are carrying, alongside the shared devotions and the whole Bible everyone knows. No algorithm, no ads.",
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
        "The devotional has not changed in generations: one text, written for everyone. The communal side of faith is well served. The personal side gets a template.",
      approach:
        "Complement tradition, don't replace it. Share what you are carrying and get a devotional written for that, rooted first in scripture, with shared devotions and the full Bible keeping the communal thread.",
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
      "The daily what-do-I-eat problem, solved with what is already in your kitchen. Type it, say it or take a pic of your ingredients and get real meals back: variety from the same shelf, dietary choices enforced as hard rules. Cooking made simple, and the power back to you.",
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
        "Feed you with what you have, wherever you are. Type, talk or take a pic of the fridge and get variety from the same ingredients, dietary choices set once and enforced as hard rules.",
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
      "A sarcastically honest friend that keeps you in check, calling out the procrastinator and warning the workaholic. It lives in the browser, where the work happens and the distraction finds you. Everything stays on your device.",
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
        "The browser is where work gets done, so it is also where distraction is bound to be found. And screen-time tools only nag one kind of slipper: the distracted, never the overworked.",
      approach:
        "Hold both accountable. It tracks where the hours go and calls you out like a friend would. Then it flips, and Caught Grinding warns you when productive has quietly become overworking.",
      result:
        "Live on the Chrome Web Store. No account, no server: everything stays on your device.",
    },
    caseStudy: "caughtslipping",
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
