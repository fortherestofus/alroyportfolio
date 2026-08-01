import type { ImageMetadata } from "astro";

/**
 * Portfolio shots, grouped into the five categories from PRD §6.04.
 *
 * Stills resolve by filename out of src/assets/portfolio/ so Astro can
 * optimise them. Video cannot go through astro:assets, so a clip names
 * its poster (optimised) and points at the encoded file that
 * `npm run video` wrote to public/portfolio/video/.
 *
 * Alt text is written from the actual image, not the filename. It is
 * the caption shown under each slide as well as the accessible
 * description, so it has to read as a sentence.
 */
const files = import.meta.glob<{ default: ImageMetadata }>(
  "../assets/portfolio/*.{png,jpg,jpeg,webp,avif}",
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
        alt: "Sign-in screen for Bold Beauty, the form on the left and a trio of portraits filling the right half.",
      },
      {
        image: "uxui_checkout.webp",
        alt: "Checkout step of a shuttle booking flow, showing the trip summary in rand beside a card payment form.",
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
    cover: "website_video_dejamedia-poster.webp",
    shots: [
      {
        image: "website_video_dejamedia-poster.webp",
        video: "/portfolio/video/website_video_dejamedia.mp4",
        alt: "The Deja Media site scrolling through its hero and services, headlined “Let's tell your brand story through business tech”.",
      },
      {
        image: "website_video_ecommerce-poster.webp",
        video: "/portfolio/video/website_video_ecommerce.mp4",
        alt: "A beauty e-commerce homepage scrolling through its product and lifestyle imagery.",
      },
      {
        image: "Action_4.png",
        alt: "Innovatr landing section headlined “Not a report. A direction. Clear. Every single time.”, showing the video-interview analysis view beneath it.",
      },
    ],
  },
  {
    id: "branding",
    name: "Branding",
    cover: "branding_packaging.webp",
    shots: [
      {
        image: "branding_packaging.webp",
        alt: "Three wine labels side by side, each carrying a different illustrated landscape.",
      },
      {
        image: "branding_logo_media.webp",
        alt: "The Legacy Lab wordmark and figure mark set on an orange to teal gradient.",
      },
      {
        image: "branding_corporate.webp",
        alt: "Deja Media business cards in gold foil, fanned on a dark surface.",
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
    cover: "design_print_digital_2.webp",
    shots: [
      {
        image: "design_print_digital_2.webp",
        alt: "LE'CONTENT winter fashion cover, cover lines wrapped around a portrait of Tammie Mashau.",
      },
      {
        image: "design_print_digital.webp",
        alt: "MODELME magazine cover, cover lines arranged around a beauty portrait.",
      },
      {
        image: "thrifty_socialmedia.webp",
        alt: "A grid of Thrifty Adventures tour posts covering Turkey, Europe and Zanzibar.",
      },
      {
        image: "gif_social_content-poster.webp",
        video: "/portfolio/video/gif_social_content.mp4",
        alt: "Animated social post for the ASICS Paris Pack trainer.",
      },
      {
        image: "video_travel-poster.webp",
        video: "/portfolio/video/video_travel.mp4",
        alt: "Travel reel opening on the word WORLD over an aerial shot of open water.",
      },
      {
        image: "innovatrsocial_trends.png",
        alt: "Innovatr “Trends & Insights” social graphic promoting a library of bi-monthly signal reports.",
      },
      {
        image: "innovatr_carousel.png",
        alt: "Slide two of an Innovatr social carousel, “The old way: slow, expensive, unclear”, listing 6-8 week turnarounds and R200K study costs.",
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
