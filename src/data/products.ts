import type { ImageMetadata } from "astro";
import { CASE_STUDIES } from "./case-studies";

/**
 * Products Alroy has built and shipped (section 05).
 *
 * This is not the portfolio and it is not the case studies. The
 * portfolio is craft artifacts by discipline; the case studies are the
 * long version of four projects. A product is a thing with a name, a
 * user and a stack, and the point of the section is to prove that
 * "business technology" in the positioning means software he actually
 * ships, not just advises on.
 *
 * Where a product already has a case study, the card links through
 * rather than repeating it.
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
  /** Slug of the matching case study, where one exists. */
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

export const PRODUCTS: Product[] = [
  {
    name: "Hakkan",
    category: "Research & Content",
    tagline: "Worth listening to.",
    description:
      "Most AI writing tools start with a blank page and guess. Hakkan starts with research: it reads the conversation where it actually happens, returns a report where every claim carries receipts, then turns that into publishable work in a voice learned from your own samples.",
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
      "A weekly devotional written to be read slowly, AI-written ones for whatever you are carrying right now, and the whole Bible in the app. Built for people who cannot always make it to church but still want to stay close to it. No algorithm, no ads.",
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
      "Deletes one very specific kind of mental load: deciding what to eat. Tell it what is in the fridge by typing, talking or photographing it, and get back a real recipe built around your tastes. Dietary needs are set once and enforced as hard rules.",
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
      "Your phone nags you about screen time, but the real damage happens on the computer you sit at all day. It tracks where the hours go and reports back without mercy. Flip it around and Caught Grinding warns you when productive has quietly become overworking. Everything stays on your device.",
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
