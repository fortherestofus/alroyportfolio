import type { ImageMetadata } from "astro";

/**
 * The imagery behind the hero (PRD §6, hero direction agreed 1 Aug 2026).
 *
 * A spread of the work rather than the best of it: the point is to show
 * range at a glance, so branding, UI, photography, product and client
 * work all appear. Nothing here is meant to be looked at closely — it
 * runs at 35% behind a scrim — so the set is chosen for silhouette and
 * colour variety rather than for detail.
 *
 * These are a separate, much cheaper derivative of the same source files
 * the portfolio uses. Reusing the portfolio's own encodes would ship
 * roughly ten times the bytes for pictures nobody can resolve.
 */
const portfolio = import.meta.glob<{ default: ImageMetadata }>(
  "../assets/portfolio/*.{png,jpg,jpeg,webp}",
  { eager: true },
);
const products = import.meta.glob<{ default: ImageMetadata }>(
  "../assets/products/*.{png,jpg,jpeg,webp}",
  { eager: true },
);
const caseStudies = import.meta.glob<{ default: ImageMetadata }>(
  "../assets/case-studies/**/*.{png,jpg,jpeg,webp}",
  { eager: true },
);

const byName = new Map<string, ImageMetadata>();
for (const group of [portfolio, products, caseStudies]) {
  for (const [path, module] of Object.entries(group)) {
    const name = path.split("/").pop();
    if (name) byName.set(name, module.default);
  }
}

export function collageImage(file: string): ImageMetadata | null {
  return byName.get(file) ?? null;
}

/**
 * Columns drift in alternating directions. Split so no column is all one
 * discipline — a column of nothing but screenshots reads as a product
 * page, and one of nothing but photography reads as a photographer's
 * site. The mix is the argument.
 */
export const COLLAGE_COLUMNS: string[][] = [
  [
    "branding_corporate.webp",
    "hakkan-report.jpg",
    "photography_editorial_mag.webp",
    "web-home-after.jpg",
    "uxui_checkout.webp",
    "thrifty_socialmedia.webp",
    "branding_packaging.webp",
  ],
  [
    "innovatr_carousel.png",
    "photography_editorial_lifestyle.webp",
    "social_sweep_report.jpg",
    "design_print_digital.webp",
    "isit-home.png",
    "filosofee_design.webp",
    "photography_eccommerce.webp",
  ],
  /* The third column only appears above 1280px, where there is room. */
  [
    "uxui_signup.webp",
    "branding_logo_media.webp",
    "web-tools-after.jpg",
    "photography_editorial_bw.webp",
    "carousel-way-1.png",
    "design_404.webp",
    "caught-today.jpg",
  ],
];
