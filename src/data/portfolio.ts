import type { ImageMetadata } from "astro";

/**
 * Portfolio shots, grouped into the five categories from PRD §6.04.
 *
 * Stills resolve by filename out of src/assets/portfolio/ so Astro can
 * optimise them. Video cannot go through astro:assets, so a clip names
 * its poster (optimised) and points at the encoded file that
 * `npm run video` wrote to public/media/portfolio/.
 *
 * Alt text is written from the actual image, not the filename. It is
 * the caption shown under each slide as well as the accessible
 * description, so it has to read as a sentence.
 */
/*
 * The product and case-study screenshots are portfolio work too — the
 * apps are UX/UI, whatever section they debut in — so the lookup spans
 * all three folders rather than duplicating files between them.
 */
const files = import.meta.glob<{ default: ImageMetadata }>(
  [
    "../assets/portfolio/*.{png,jpg,jpeg,webp,avif}",
    "../assets/products/*.{png,jpg,jpeg,webp,avif}",
    "../assets/case-studies/**/*.{png,jpg,jpeg,webp,avif}",
  ],
  { eager: true },
);

const byFilename = new Map<string, ImageMetadata>();
for (const [path, module] of Object.entries(files)) {
  const filename = path.split("/").pop();
  if (filename) byFilename.set(filename, module.default);
}

export function shotImage(filename?: string): ImageMetadata | null {
  if (!filename) return null;
  return byFilename.get(filename) ?? null;
}

export interface Shot {
  /** Still: the image itself. Video: the poster frame. */
  image: string;
  alt: string;
  /** Set for a clip; path under public/, written by `npm run video`. */
  video?: string;
}

export interface PortfolioCategory {
  id: string;
  name: string;
  /** Filename of the cover still shown on the card. */
  cover: string;
  shots: Shot[];
}

export const PORTFOLIO: PortfolioCategory[] = [
  {
    id: "uxui",
    name: "UX/UI",
    cover: "uxui_signup.webp",
    shots: [
      {
        image: "uxui_signup.webp",
        alt: "Sign-in screen for a beauty booking app, the form on the left and a trio of portraits filling the right half.",
      },
      {
        image: "uxui_checkout.webp",
        alt: "Checkout step of a shuttle booking flow, showing the trip summary in rand beside a card payment form.",
      },
      {
        image: "hakkan-research.jpg",
        alt: "Research tool question screen — one input, depth and time-range controls, and the platforms it reads.",
      },
      {
        image: "isit-home.png",
        alt: "Devotional app home screen: the week's devotional and verse of the day in a warm serif system.",
      },
      {
        image: "tapa-home.jpg",
        alt: "Recipe app home screen with the day's suggestion and a saved-recipe shelf.",
      },
      {
        image: "design_404.webp",
        alt: "Illustrated 404 page: two figures in sunglasses and dark coats standing beside oversized numerals.",
      },
    ],
  },
  {
    id: "web",
    name: "Web",
    cover: "website_video_lumiskin-poster.webp",
    shots: [
      {
        image: "website_video_lumiskin-poster.webp",
        video: "/media/portfolio/website_video_lumiskin.mp4",
        alt: "Skincare brand website hero: a chameleon shifts to lavender to match the soap beside it as a product card slides in over the video.",
      },
      {
        image: "website_video_filosofee-poster.webp",
        video: "/media/portfolio/website_video_filosofee.mp4",
        alt: "Apparel storefront scrolling from its hero through the t-shirt and hoodie categories to a product page.",
      },
      {
        image: "website_video_dejamedia-poster.webp",
        video: "/media/portfolio/website_video_dejamedia.mp4",
        alt: "Agency website scrolling through its hero and services sections.",
      },
      {
        image: "website_video_ecommerce-poster.webp",
        video: "/media/portfolio/website_video_ecommerce.mp4",
        alt: "A beauty e-commerce homepage scrolling through its product and lifestyle imagery.",
      },
    ],
  },
  {
    id: "branding",
    name: "Branding",
    cover: "design_print_digital_2.webp",
    shots: [
      {
        image: "branding_packaging.webp",
        alt: "Three wine labels side by side, each carrying a different illustrated landscape.",
      },
      {
        image: "branding_logo_media.webp",
        alt: "Wordmark and figure mark set on an orange to teal gradient.",
      },
      {
        image: "branding_corporate.webp",
        alt: "Corporate business cards in gold foil, fanned on a dark surface.",
      },
      {
        image: "design_print_digital_2.webp",
        alt: "Winter fashion magazine cover, cover lines wrapped around a studio portrait.",
      },
      {
        image: "design_print_digital.webp",
        alt: "Beauty magazine cover, cover lines arranged around a studio portrait.",
      },
      {
        image: "filosofee_design.webp",
        alt: "Black t-shirt printed with a red speech bubble reading “indoda must what?”.",
      },
    ],
  },
  {
    id: "content",
    name: "Content",
    cover: "thrifty_socialmedia.webp",
    shots: [
      {
        image: "thrifty_socialmedia.webp",
        alt: "A grid of travel tour social posts covering Turkey, Europe and Zanzibar.",
      },
      {
        image: "appstore_isit_sheet.jpg",
        alt: "App Store screen sheet for a devotional app: six phones, each under its own headline, from “For the devoted, the questioning, the busy” to “Consistency without the guilt”.",
      },
      {
        image: "appstore_tapa_sheet.jpg",
        alt: "App Store screen sheet for a recipe app: six phones under headlines from “Cook with what you have” to “Keep the good ones. Share the great ones.”",
      },
      {
        image: "appstore_caughtslipping_grinding.jpg",
        alt: "App Store panel for a screen-time app's Work Mode — “Caught Grinding: for the overworkers” — beside a card reading nine hours forty-one worked today.",
      },
      {
        image: "social_sweep_demo-poster.webp",
        video: "/media/portfolio/social_sweep_demo.mp4",
        alt: "Walkthrough video made for a consumer insights company: a plain-language question in, a cited report out.",
      },
      {
        image: "gif_social_content-poster.webp",
        video: "/media/portfolio/gif_social_content.mp4",
        alt: "Animated social media graphic for a sneaker launch.",
      },
      {
        image: "video_travel-poster.webp",
        video: "/media/portfolio/video_travel.mp4",
        alt: "Travel ad video made for a travel company.",
      },
      {
        image: "Action_4.png",
        alt: "Website landing section for a consumer insights platform, showing the video-interview analysis view beneath it.",
      },
      {
        image: "innovatrsocial_trends.png",
        alt: "Social media graphic promoting a library of bi-monthly signal reports.",
      },
      {
        image: "innovatr_carousel.png",
        alt: "Social media carousel slide, “The old way: slow, expensive, unclear”, listing 6-8 week turnarounds and R200K study costs.",
      },
    ],
  },
  {
    id: "photography",
    name: "Photography",
    cover: "photography_editorial.webp",
    shots: [
      {
        image: "photography_editorial.webp",
        alt: "Studio beauty portrait against black, edged with a red rim light.",
      },
      {
        image: "photography_editorial_mag.webp",
        alt: "Portrait in dark sunglasses, lit warm gold against a black background.",
      },
      {
        image: "photography_editorial_bw.webp",
        alt: "Black and white portrait lying back on a pillow beside scattered newspapers.",
      },
      {
        image: "photography_editorial_lifestyle.webp",
        alt: "Overhead poolside portrait in white swimwear on warm concrete.",
      },
      {
        image: "photography_eccommerce.webp",
        alt: "Full-length studio portrait in a white tailored suit against a pale backdrop.",
      },
    ],
  },
];
