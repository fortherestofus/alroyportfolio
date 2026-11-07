import type { ImageMetadata } from "astro";

/**
 * Portfolio shots, grouped by medium: the loose pieces that are not
 * part of a project in ./work.ts, plus every site under Web so the
 * medium view is complete.
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
    "../assets/work/**/*.{png,jpg,jpeg,webp,avif}",
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
        alt: "Content discovery screen: one input, depth and time-range controls, and the platforms it reads.",
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
        alt: "Dejamedia Company: the site for the studio I trade under, scrolling through its hero and services.",
      },
      {
        image: "website_video_ecommerce-poster.webp",
        video: "/media/portfolio/website_video_ecommerce.mp4",
        alt: "HerHerbHope: an online store for skincare and bath products.",
      },
      {
        image: "website_video_epa-poster.jpg",
        video: "/media/portfolio/website_video_epa.mp4",
        alt: "English Plus Academy: the redesigned site for a language school.",
      },
      {
        image: "website_video_foe-poster.jpg",
        video: "/media/portfolio/website_video_foe.mp4",
        alt: "Festival of Eventing: the site for an events industry festival in Cape Town.",
      },
      {
        image: "website_video_cashnsport-poster.jpg",
        video: "/media/portfolio/website_video_cashnsport.mp4",
        alt: "Cash'n'Sport: a news site on the business of African sport.",
      },
      {
        image: "website_video_dejamedia_blog-poster.jpg",
        video: "/media/portfolio/website_video_dejamedia_blog.mp4",
        alt: "The Dejamedia blog: articles on marketing and running a business.",
      },
      {
        image: "website_video_isit-poster.jpg",
        video: "/media/portfolio/website_video_isit.mp4",
        alt: "InSpiritInTruth: the newsletter site for my devotional.",
      },
      {
        image: "website_video_alroy-poster.jpg",
        video: "/media/portfolio/website_video_alroy.mp4",
        alt: "An earlier version of my own site.",
      },
      {
        image: "web_mockup_personal_brand.jpg",
        alt: "Website mockup for a personal brand, shown on a phone, laptop and tablet.",
      },
    ],
  },
  {
    id: "branding",
    name: "Branding",
    cover: "design_print_digital_2.webp",
    shots: [
      {
        image: "branding_auxaffair_logo.webp",
        alt: "Aux Affair logo: a lowercase wordmark whose last stroke runs out into a dashed audio cable in brass, ivory and ember, ending in a 3.5 mm plug.",
      },
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
      {
        image: "branding_logo_dropinthebowl.jpg",
        alt: "“A Drop in the Bowl” logo: a drop held in an open bowl, printed on linen.",
      },
      {
        image: "branding_logo_lettherebelight.jpg",
        alt: "“Let There Be Light” wordmark, the I drawn as a hanging light bulb.",
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
        alt: "App Store panel for a screen-time app's Work Mode, “Caught Grinding: for the overworkers”, beside a card reading nine hours forty-one worked today.",
      },
      {
        image: "content_culcha_highlights.webp",
        alt: "Four Instagram story highlight covers for an events brand, side by side: Afro Culcha on cobalt blue, Lean Back on crimson, Spotted at Culcha shot up through a ring of faces, and Culcha Summer over palms and sea.",
      },
      {
        image: "appstore_header_video-poster.webp",
        video: "/media/portfolio/appstore_header_video.mp4",
        alt: "The 12-second loop that opens a devotional app's App Store page: the verse and the app's screens in motion.",
      },
      {
        image: "isit_app_promo-poster.webp",
        video: "/media/portfolio/isit_app_promo.mp4",
        alt: "A 25-second vertical promo for a devotional app: real screens fan out, a feeling is typed, and a devotional is written for it.",
      },
      {
        image: "isit_duo_unfold-poster.webp",
        video: "/media/portfolio/isit_duo_unfold.mp4",
        alt: "A devotional app on an iPhone Duo, from real captures: the phone unfolds to two panes, opens a devotional, switches to dark mode, turns upright and closes on the app's wordmark.",
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
        image: "Action_4.png",
        alt: "Website landing section for a consumer insights platform, showing the video-interview analysis view beneath it.",
      },
      {
        image: "innovatrsocial_trends.png",
        alt: "Social media graphic promoting a library of bi-monthly signal reports.",
      },
      {
        image: "email-old-research-opener.jpg",
        alt: "The opening of a marketing email for a consumer research company: a letter from the founder under the headline “Old research is dead. And most brands still haven't noticed.”, in coral and white on deep navy.",
      },
      {
        image: "content_story_heart.jpg",
        alt: "Story graphic: a halftone hand holding a heart over a red and blue gradient.",
      },
      {
        image: "content_story_megaphone.jpg",
        alt: "Story graphic: a megaphone with yellow sound lines over a bright gradient.",
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
      {
        image: "photography_beauty_flowers.jpg",
        alt: "Beauty portrait, eyes closed, under a crown of pink and white flowers.",
      },
      {
        image: "photography_beauty_flowers_2.jpg",
        alt: "The same flower crown, hands framing her face.",
      },
      {
        image: "photography_portrait_felli.jpg",
        alt: "Studio portrait in gold hoops and a diamond choker, one hand at her collarbone.",
      },
      {
        image: "photography_portrait_kgali.jpg",
        alt: "Seated portrait in a zebra-print shirt against a dark brown backdrop.",
      },
      {
        image: "photography_headshot_1.jpg",
        alt: "Corporate headshot: a smiling man in glasses and a black shirt, on a brown backdrop.",
      },
      {
        image: "photography_headshot_3.jpg",
        alt: "Corporate headshot: a smiling woman, arms folded, on a brown backdrop.",
      },
      {
        image: "photography_headshot_2.jpg",
        alt: "Corporate headshot: a man in a black jacket, leaning in, on a dark backdrop.",
      },
      {
        image: "photography_interior_lounge.jpg",
        alt: "Interior: a lounge with white armchairs and a geometric screen.",
      },
      {
        image: "photography_interior_suite.jpg",
        alt: "Interior: an apartment with a kitchenette, a bed and a floor-to-ceiling window.",
      },
    ],
  },
  {
    id: "video",
    name: "Video",
    cover: "video_just6-poster.jpg",
    shots: [
      {
        image: "video_just6-poster.jpg",
        video: "/media/portfolio/video_just6.mp4",
        alt: "Music video for Just 6, shot in the recording studio.",
      },
      {
        image: "video_short_stay-poster.jpg",
        video: "/media/portfolio/video_short_stay.mp4",
        alt: "Film for an Airbnb listing: a day in the apartment, from waking up to the view to an evening in.",
      },
      {
        image: "video_influencer-poster.jpg",
        video: "/media/portfolio/video_influencer.mp4",
        alt: "Vertical video with an influencer in a powder-blue suit, in a white gallery.",
      },
      {
        image: "video_bw_editorial-poster.jpg",
        video: "/media/portfolio/video_bw_editorial.mp4",
        alt: "Black-and-white editorial video: a portrait in an oversized blazer against a curtain.",
      },
      {
        image: "video_travel_social-poster.jpg",
        video: "/media/portfolio/video_travel_social.mp4",
        alt: "Vertical travel video: two cars on a dirt road seen from above, under the word “Travel”.",
      },
      {
        image: "video_travel-poster.webp",
        video: "/media/portfolio/video_travel.mp4",
        alt: "Travel ad video made for a travel company.",
      },
    ],
  },
];
