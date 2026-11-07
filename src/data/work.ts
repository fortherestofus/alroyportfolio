/**
 * Portfolio projects: one body of work each, with its own page at
 * /work/<slug>/.
 *
 * A project is not a case study. The case studies are about what a
 * piece of work returned, with numbers; these are about the work
 * itself, for a reader who wants to see the photography, the films and
 * the sites rather than read about them. So a project page is mostly
 * media, with a credits block saying who it was for and what Alroy did.
 *
 * Copy rules, since these pages are read by people deciding whether to
 * hire him: say what is in the frame, say what he did, and stop. No
 * claims about results that are not measured, and work made on his own
 * initiative for a brand that did not commission it is labelled as such
 * on the tile and on the page.
 *
 * Media files come from `scripts/import-work-media.mjs`, which reads
 * the originals from his Portfolio folder and writes compressed copies:
 * stills to src/assets/work/<slug>/, clips to public/media/work/. They
 * resolve by filename through `shotImage()` in ./portfolio.ts.
 */

export type WorkLabel = "Self-initiated" | "Concept";

export interface WorkItem {
  /** A still, or a clip's poster frame. Filename only. */
  image: string;
  /** Read as the caption as well as the alt text, so a full sentence. */
  alt: string;
  /** Path under public/ for a clip. */
  video?: string;
  /** The clip has a sound track. It starts muted; the viewer opts in. */
  sound?: boolean;
  /**
   * Long enough to be watched rather than glanced at. Plays on request
   * with full controls instead of looping on its own as it scrolls in.
   */
  film?: boolean;
  /** Clip length in seconds, for the VideoObject markup. */
  seconds?: number;
  /** The heading it sits under, when the project is split into groups. */
  group?: string;
}

export interface WorkProject {
  slug: string;
  name: string;
  /** Who it was for. Omitted for his own and self-initiated work. */
  client?: string;
  /** Spec work is said to be spec work. */
  label?: WorkLabel;
  year?: string;
  role: string;
  deliverables: string[];
  /** One line: the tile and the page's opening sentence. */
  summary: string;
  intro: string[];
  /** Filename of the still shown on the tile. */
  cover: string;
  /** Short silent loop the tile plays on hover, under public/. */
  preview?: string;
  items: WorkItem[];
  /**
   * Splits the gallery under headings, in this order, for a project
   * that is several bodies of work in one (five malls, say). Items name
   * their group; the note is one line under the heading.
   */
  groups?: { name: string; note?: string }[];
  /**
   * Overrides the column count the page works out from the media. It
   * counts a square post as landscape, which suits a page of mostly
   * wide frames but leaves a page of square posts at two big columns.
   */
  columns?: 2 | 3;
  links?: { label: string; href: string; external?: boolean }[];
  seo: { title: string; description: string };
  /** Shown on the home page; the rest are on /work/. */
  featured?: boolean;
}

export const WORK: WorkProject[] = [
  {
    slug: "jenna-clifford",
    name: "Jenna Clifford",
    client: "Jenna Clifford",
    role: "Art direction and content",
    deliverables: ["Art direction", "Photography", "Behind-the-scenes film", "Social content"],
    summary:
      "Art direction and content for a jewellery brand: portraits, and a shoot staged as a tea party.",
    intro: [
      "Jenna Clifford is a South African jewellery brand. I art-directed its content: close portraits that keep the pearls, diamonds and bridal pieces in focus, and a shoot for one line staged as a tea party in a garden, in the spirit of Alice in Wonderland.",
      "The film is the behind-the-scenes cut I made from that day.",
    ],
    cover: "jenna-clifford-photo-1.jpg",
    items: [
      {
        image: "jenna-clifford-film-poster.jpg",
        video: "/media/work/jenna-clifford-film.mp4",
        sound: true,
        film: true,
        seconds: 63,
        alt: "Behind-the-scenes film from the tea party shoot: two models in lace gowns and diamond jewellery in a garden, with smoke and giant paper roses.",
      },
      {
        image: "jenna-clifford-photo-1.jpg",
        alt: "Close portrait: a pearl earring and a pearl bracelet, one hand in her hair.",
      },
      {
        image: "jenna-clifford-photo-2.jpg",
        alt: "A model behind a bridal veil, a diamond ring on her hand.",
      },
      {
        image: "jenna-clifford-photo-3.jpg",
        alt: "A model with long blonde hair in pearl drop earrings and a pendant, in a garden.",
      },
      {
        image: "jenna-clifford-photo-4.jpg",
        alt: "Black-and-white close-up: a wide smile and a diamond drop earring.",
      },
      {
        image: "jenna-clifford-photo-5.jpg",
        alt: "A model in a silk scarf and a cross pendant, lit by the sun in a garden.",
      },
      {
        image: "jenna-clifford-photo-6.jpg",
        alt: "A model in a beaded bridal gown and a bracelet, in a garden.",
      },
    ],
    seo: {
      title: "Jenna Clifford: art direction and content | Alroy Ndhlovu",
      description:
        "Art direction and content for Jenna Clifford jewellery: portraits of pearls, diamonds and bridal pieces, and a behind-the-scenes film of a tea party shoot.",
    },
    featured: true,
  },
  {
    slug: "kelly-ann-mealia",
    name: "Kelly-Ann Mealia",
    client: "Kelly-Ann Mealia, co-founder of Energy Capital & Power",
    year: "2022 – 2024",
    role: "LinkedIn personal brand",
    deliverables: ["Photography", "Video", "Post design", "Community management"],
    summary:
      "Photography, video and posts for the LinkedIn brand of Energy Capital & Power's co-founder.",
    intro: [
      "Kelly-Ann Mealia co-founded Energy Capital & Power. I ran her LinkedIn presence: portrait sessions in two looks, short videos with captions on screen, and post designs for her views on Africa's energy sector. I also managed her community.",
    ],
    cover: "kelly-ann-mealia-portrait-1.jpg",
    preview: "/media/work/kelly-ann-mealia-preview.mp4",
    items: [
      {
        image: "kelly-ann-mealia-video-poster.jpg",
        video: "/media/work/kelly-ann-mealia-video.mp4",
        sound: true,
        film: true,
        seconds: 66,
        alt: "A LinkedIn video: Kelly-Ann speaks to camera in a lilac suit, with the key words captioned on screen.",
      },
      {
        image: "kelly-ann-mealia-portrait-1.jpg",
        alt: "Kelly-Ann seated in a white blouse and green trousers against a green wall.",
      },
      {
        image: "kelly-ann-mealia-portrait-2.jpg",
        alt: "Standing against the green wall, one fist raised.",
      },
      {
        image: "kelly-ann-mealia-portrait-3.jpg",
        alt: "In a lilac suit against a terracotta backdrop, checking her watch.",
      },
      {
        image: "kelly-ann-mealia-post-1.jpg",
        alt: "LinkedIn post: “South Africa's Gas Amendment Bill: a new era for the gas sector”.",
      },
      {
        image: "kelly-ann-mealia-post-2.jpg",
        alt: "LinkedIn post: “The potential for Africa's universal access to modern energy services by 2030”.",
      },
      {
        image: "kelly-ann-mealia-post-3.jpg",
        alt: "New year post: “Wishing you all a successful year ahead.”",
      },
    ],
    seo: {
      title: "Kelly-Ann Mealia: LinkedIn personal brand | Alroy Ndhlovu",
      description:
        "Portraits, captioned videos and post designs for the LinkedIn brand of Kelly-Ann Mealia, co-founder of Energy Capital & Power, plus community management.",
    },
    featured: true,
  },
  {
    slug: "alabanza",
    name: "Alabanza Fashion Boutique",
    client: "Alabanza Fashion Boutique",
    role: "Content direction and photography",
    deliverables: ["Art direction", "Studio photography", "E-commerce images", "Social content"],
    summary: "Studio photography for a fashion boutique's online store and social pages.",
    intro: [
      "I directed and shot the content for Alabanza's online store and social pages: full-length looks for the product pages, close crops for details like pearl trim, lace gloves and pleating, and beauty portraits for social.",
    ],
    cover: "alabanza-01.jpg",
    items: [
      {
        image: "alabanza-01.jpg",
        alt: "A model in a black dress with pearl-studded bow sleeves, lace gloves and a wide black hat.",
      },
      {
        image: "alabanza-02.jpg",
        alt: "A white tailored suit with a fringed waist, shot three-quarter length.",
      },
      {
        image: "alabanza-03.jpg",
        alt: "Beauty portrait in a metallic pleated top.",
      },
      {
        image: "alabanza-04.jpg",
        alt: "Close crop of the black dress: pearl trim and a lace glove.",
      },
      {
        image: "alabanza-05.jpg",
        alt: "The white suit, full length, against a soft arched shadow.",
      },
      {
        image: "alabanza-06.jpg",
        alt: "Beauty portrait with sculpted pink organza shoulders.",
      },
      {
        image: "alabanza-07.jpg",
        alt: "Close crop of the metallic pleated top.",
      },
      {
        image: "alabanza-08.jpg",
        alt: "Close crop of the suit's fringe and wide-leg trousers.",
      },
    ],
    seo: {
      title: "Alabanza Fashion Boutique: photography | Alroy Ndhlovu",
      description:
        "Content direction and studio photography for Alabanza Fashion Boutique: full-length looks for the online store, detail crops and beauty portraits for social.",
    },
    featured: true,
  },
  {
    slug: "iab-bookmarks",
    name: "IAB Bookmark Awards 2023",
    client: "IAB South Africa",
    year: "2023",
    role: "Event video",
    deliverables: ["Event video", "Social content"],
    summary: "Video from the awards night, cut for the IAB's social channels.",
    intro: [
      "I made the event video for the 2023 Bookmark Awards, for IAB South Africa's social channels: the stage, the winners and the after-party.",
    ],
    cover: "iab-bookmarks-video-poster.jpg",
    preview: "/media/work/iab-bookmarks-preview.mp4",
    items: [
      {
        image: "iab-bookmarks-video-poster.jpg",
        video: "/media/work/iab-bookmarks-video.mp4",
        sound: true,
        film: true,
        seconds: 73,
        alt: "Event video from the IAB Bookmark Awards 2023: the stage and pyrotechnics, winners with their awards, speeches and the after-party.",
      },
    ],
    seo: {
      title: "IAB Bookmark Awards 2023: event video | Alroy Ndhlovu",
      description:
        "The event video from the IAB Bookmark Awards 2023, made for IAB South Africa's social channels: the stage, the winners, the speeches and the after-party.",
    },
    featured: true,
  },
  {
    slug: "smirnoff-at-home",
    name: "Smirnoff, at home",
    label: "Self-initiated",
    role: "Concept, styling, photography and video",
    deliverables: ["Concept", "Styling", "Photography", "Video"],
    summary: "A content series for Smirnoff Infusions: poolside, on a lounger and in the water.",
    intro: [
      "A self-initiated series, not commissioned by Smirnoff. I came up with the concept, styled it and shot it: a lounger set with travel books and a cold glass, and a pool set in a wide-brimmed hat, shot from above for the video.",
    ],
    cover: "smirnoff-at-home-01.jpg",
    preview: "/media/work/smirnoff-at-home-preview.mp4",
    items: [
      {
        image: "smirnoff-at-home-video-poster.jpg",
        video: "/media/work/smirnoff-at-home-video.mp4",
        sound: true,
        seconds: 30,
        alt: "Social video: a model in a wide black-and-white hat floats in the pool with a bottle of Smirnoff Infusions, shot from above, then pours a drink at the pool's edge.",
      },
      {
        image: "smirnoff-at-home-01.jpg",
        alt: "At the pool's edge in a wide-brimmed hat and white sunglasses, a bottle of Smirnoff Infusions beside her.",
      },
      {
        image: "smirnoff-at-home-02.jpg",
        alt: "On a lounger with a New York travel book, the bottle and a glass on a stack of books.",
      },
      {
        image: "smirnoff-at-home-03.jpg",
        alt: "Close crop: pouring over ice, the glass resting on a London travel book.",
      },
      {
        image: "smirnoff-at-home-04.jpg",
        alt: "The pool set: hat brim low, glass in hand, bottle on the ledge.",
      },
      {
        image: "smirnoff-at-home-05.jpg",
        alt: "Adding a slice of lemon to the glass, the bottle in front.",
      },
      {
        image: "smirnoff-at-home-06.jpg",
        alt: "The bottle resting on her leg beside a glass of ice.",
      },
      {
        image: "smirnoff-at-home-07.jpg",
        alt: "Raising the glass in the pool, one hand on her hat.",
      },
      {
        image: "smirnoff-at-home-08.jpg",
        alt: "Reclining on the lounger, travel book in hand.",
      },
    ],
    seo: {
      title: "Smirnoff, at home: self-initiated content | Alroy Ndhlovu",
      description:
        "A self-initiated photo and video series for Smirnoff Infusions, styled and shot at home: a lounger set with travel books and a pool set shot from above.",
    },
    featured: true,
  },
  {
    slug: "websites",
    name: "Websites",
    role: "Design and build",
    deliverables: ["Web design", "Online stores", "Front-end build"],
    summary:
      "Eight sites, recorded in the browser: online stores, a language school, an events festival, a news site and my own.",
    intro: [
      "Sites I've designed and built, recorded in the browser so you can see them move. None of the recordings have sound.",
    ],
    cover: "websites-cover.jpg",
    items: [
      {
        image: "website_video_lumiskin-poster.webp",
        video: "/media/portfolio/website_video_lumiskin.mp4",
        seconds: 30,
        alt: "LumiSkin: a concept site for a skincare brand, built in a day.",
      },
      {
        image: "website_video_filosofee-poster.webp",
        video: "/media/portfolio/website_video_filosofee.mp4",
        seconds: 31,
        alt: "Filosofee: the online store for a streetwear label.",
      },
      {
        image: "website_video_epa-poster.jpg",
        video: "/media/portfolio/website_video_epa.mp4",
        seconds: 18,
        alt: "English Plus Academy: the redesigned site for a language school.",
      },
      {
        image: "website_video_foe-poster.jpg",
        video: "/media/portfolio/website_video_foe.mp4",
        seconds: 15,
        alt: "Festival of Eventing: the site for an events industry festival in Cape Town, with sponsor and exhibitor information.",
      },
      {
        image: "website_video_ecommerce-poster.webp",
        video: "/media/portfolio/website_video_ecommerce.mp4",
        seconds: 15,
        alt: "HerHerbHope: an online store for skincare and bath products.",
      },
      {
        image: "website_video_cashnsport-poster.jpg",
        video: "/media/portfolio/website_video_cashnsport.mp4",
        seconds: 15,
        alt: "Cash'n'Sport: a news site on the business of African sport.",
      },
      {
        image: "website_video_isit-poster.jpg",
        video: "/media/portfolio/website_video_isit.mp4",
        seconds: 11,
        alt: "InSpiritInTruth: the newsletter site for my devotional.",
      },
      {
        image: "website_video_alroy-poster.jpg",
        video: "/media/portfolio/website_video_alroy.mp4",
        seconds: 12,
        alt: "An earlier version of my own site.",
      },
    ],
    seo: {
      title: "Websites I've designed and built | Alroy Ndhlovu",
      description:
        "Eight websites I've designed and built, as screen recordings: online stores, a language school, an events festival, a sports business news site and my own.",
    },
    featured: true,
  },
  {
    slug: "eris-property-group",
    name: "Eris Property Group",
    client: "Eris Property Group",
    year: "2024",
    role: "Social media content and page management",
    deliverables: [
      "Social media content",
      "Post design",
      "Page covers",
      "Community management",
      "Paid boosting",
      "Reporting",
    ],
    summary:
      "Agency-side social media for five of Eris Property Group's shopping centres: content for the stores inside them, community management and paid boosts.",
    intro: [
      "Eris Property Group develops and manages property across South Africa. In August 2024, on a short-term support contract, I handled social media for five of its malls: Chuma, Letseng, Mamotse, Sechaba and Taung.",
      "I designed posts for more than twenty stores across the malls, from Pick n Pay, Pep and Debonairs to local pharmacies, butchers and salons, and published them to the respective pages. I also managed each page's community, ran occasional paid boosts and reported on performance. Below is a selection, grouped by mall.",
    ],
    cover: "eris-property-group-sechaba-rage.jpg",
    columns: 3,
    groups: [
      { name: "Chuma Mall" },
      { name: "Sechaba Mall" },
      { name: "Letseng Mall" },
      { name: "Mamotse Mall" },
      { name: "Taung Mall" },
    ],
    items: [
      {
        group: "Chuma Mall",
        image: "eris-property-group-chuma-cover.jpg",
        alt: "Chuma Mall's page cover: “Convenient shopping for all” over four shoppers on yellow, with 50+ stores, 750 free parking bays and the taxi rank listed beneath.",
      },
      {
        group: "Chuma Mall",
        image: "eris-property-group-chuma-legit.jpg",
        alt: "Legit's Women's Month “Take 2 sale”: a denim jacket and jeans hung over a chair against pink.",
      },
      {
        group: "Chuma Mall",
        image: "eris-property-group-chuma-fish-and-chips.jpg",
        alt: "Real Fish & Chips: “Sort out that hunger fast fast!” beside wings, chips and russians.",
      },
      {
        group: "Chuma Mall",
        image: "eris-property-group-chuma-pep-cell.jpg",
        alt: "Pep Cell: the Xiaomi Redmi A3 with its storage, memory and battery listed beside it.",
      },
      {
        group: "Sechaba Mall",
        image: "eris-property-group-sechaba-cover.jpg",
        alt: "Sechaba Mall's page cover: “Shop local, shop Sechaba” beside a laughing woman in sunglasses, on red and yellow.",
      },
      {
        group: "Sechaba Mall",
        image: "eris-property-group-sechaba-rage.jpg",
        alt: "Rage: “Sunny days await”, a model by a pool beside a close-up of woven sandals.",
      },
      {
        group: "Sechaba Mall",
        image: "eris-property-group-sechaba-crazy-store.jpg",
        alt: "The Crazy Store: “Shop crazy”, a child with painted hands and a spread of craft supplies on orange.",
      },
      {
        group: "Sechaba Mall",
        image: "eris-property-group-sechaba-womens-month.jpg",
        alt: "Sechaba Mall's Women's Month post: a woman in a headwrap dancing outdoors, captioned “Celebrating women”.",
      },
      {
        group: "Letseng Mall",
        image: "eris-property-group-letseng-debonairs.jpg",
        alt: "Debonairs Pizza: “Try something amazing” over a slice pulling melted cheese.",
      },
      {
        group: "Letseng Mall",
        image: "eris-property-group-letseng-fashion-threads.jpg",
        alt: "Fashion Threads: a model in a red dress on deep red, the store's name set in a fashion serif.",
      },
      {
        group: "Letseng Mall",
        image: "eris-property-group-letseng-butchery.jpg",
        alt: "Roots Butchery: “High quality meat” and “best price in town” on a dark board of raw cuts.",
      },
      {
        group: "Mamotse Mall",
        image: "eris-property-group-mamotse-optometrist.jpg",
        alt: "Mogapi Optometrist: “Affordable and accessible eye care” beside a smiling man in glasses.",
      },
      {
        group: "Mamotse Mall",
        image: "eris-property-group-mamotse-nails.jpg",
        alt: "Nail Excellence: a manicured hand behind a white circle carrying the salon's name.",
      },
      {
        group: "Mamotse Mall",
        image: "eris-property-group-mamotse-pep.jpg",
        alt: "Pep: “New season, new bedding” over a made bed, with two detail shots set into it.",
      },
      {
        group: "Taung Mall",
        image: "eris-property-group-taung-ackermans.jpg",
        alt: "Ackermans: a collage of children's denim outfits and close-ups, “Denim” across the middle.",
      },
      {
        group: "Taung Mall",
        image: "eris-property-group-taung-studio-88.jpg",
        alt: "Studio 88: “Shop soccer season!” beside a player in a Real Madrid training top.",
      },
      {
        group: "Taung Mall",
        image: "eris-property-group-taung-womens-month.jpg",
        alt: "Taung Mall's Women's Month post: a painted, flower-crowned portrait of a woman above a row of faces, on yellow.",
      },
    ],
    seo: {
      title: "Eris Property Group: mall social media | Alroy Ndhlovu",
      description:
        "Agency-side social media for five Eris Property Group shopping centres: posts for more than twenty tenant brands, community management and paid boosts.",
    },
  },
  {
    slug: "mitch-sneakers",
    name: "Mitch Sneakers",
    client: "Mitch Sneakers",
    role: "Photo and video content",
    deliverables: ["Photography", "Video", "Social content", "Web images"],
    summary: "Photo and video for a sneaker brand's social media and website.",
    intro: [
      "Content for Mitch Sneakers' social media and website: outdoor shoots on a sports field, a tennis court and against a concrete wall, and a short video for social.",
    ],
    cover: "mitch-sneakers-01.jpg",
    preview: "/media/work/mitch-sneakers-preview.mp4",
    items: [
      {
        image: "mitch-sneakers-video-poster.jpg",
        video: "/media/work/mitch-sneakers-video.mp4",
        sound: true,
        seconds: 19,
        alt: "Social video for Mitch Sneakers: quick cuts of the sneakers on court, on the move and up close.",
      },
      {
        image: "mitch-sneakers-01.jpg",
        alt: "A model mid-jump on a sports field in pink activewear and white sneakers.",
      },
      {
        image: "mitch-sneakers-02.jpg",
        alt: "A model crouched on a tennis court in a striped dress, sneakers forward.",
      },
      {
        image: "mitch-sneakers-03.jpg",
        alt: "Laughing against a concrete wall, a sneaker held up to her shoulder.",
      },
    ],
    seo: {
      title: "Mitch Sneakers: photo and video | Alroy Ndhlovu",
      description:
        "Photo and video content for Mitch Sneakers' social media and website: outdoor shoots on a sports field and a tennis court, and a short social video.",
    },
  },
  {
    slug: "filosofee",
    name: "Filosofee",
    role: "Art direction, content and online store",
    deliverables: ["Art direction", "Photography", "Online store", "Social content"],
    summary:
      "Art direction and content for a streetwear label's store and social pages, and the store itself.",
    intro: [
      "Filosofee is a South African streetwear label. I art-directed the shoots for its store and social pages, from studio shots of the wordmark tees and hoodies to the clothes worn out and about, and built the online store.",
      "The case study covers the rest: the range, payments and the first sales.",
    ],
    cover: "filosofee-01.jpg",
    items: [
      {
        image: "website_video_filosofee-poster.webp",
        video: "/media/portfolio/website_video_filosofee.mp4",
        seconds: 31,
        alt: "The Filosofee store, scrolling from its hero through the tees and hoodies to a product page.",
      },
      {
        image: "filosofee-01.jpg",
        alt: "A model in a black Filosofee hoodie against a pale studio backdrop.",
      },
      {
        image: "filosofee-02.jpg",
        alt: "A model in a black Filosofee tee, looking over her shoulder.",
      },
      {
        image: "filosofee-03.jpg",
        alt: "Two models in Filosofee tees against a dark textured wall.",
      },
      {
        image: "filosofee-04.jpg",
        alt: "A model in an oversized Filosofee hoodie, hands behind her head.",
      },
      {
        image: "filosofee-05.jpg",
        alt: "Two friends in Filosofee hoodies in the back of a car.",
      },
      {
        image: "filosofee-06.jpg",
        alt: "Stickers on a laptop, carried under one arm.",
      },
    ],
    links: [
      { label: "Read the case study", href: "/case-studies/filosofee/" },
      { label: "Visit the store", href: "https://www.filosofee.shop", external: true },
    ],
    seo: {
      title: "Filosofee: art direction and content | Alroy Ndhlovu",
      description:
        "Art direction and content for Filosofee, a South African streetwear label: studio and lifestyle shoots for the store and social, and the online store itself.",
    },
  },
  {
    slug: "gucci-at-home",
    name: "Gucci, at home",
    label: "Self-initiated",
    role: "Concept, lighting, photography and video",
    deliverables: ["Concept", "Lighting", "Photography", "Video"],
    summary: "A content series for Gucci sunglasses: hard light, deep shadow and a bookshelf.",
    intro: [
      "A self-initiated series, not commissioned by Gucci. Hard light, deep shadow and a bookshelf, shot as stills and a short video for social.",
    ],
    cover: "gucci-at-home-01.jpg",
    preview: "/media/work/gucci-at-home-preview.mp4",
    items: [
      {
        image: "gucci-at-home-video-poster.jpg",
        video: "/media/work/gucci-at-home-video.mp4",
        sound: true,
        seconds: 8,
        alt: "Short social video: the Gucci dust bag, then close-ups of the sunglasses on the model under hard light.",
      },
      {
        image: "gucci-at-home-01.jpg",
        alt: "Close portrait in Gucci sunglasses, the light raking across her face.",
      },
      {
        image: "gucci-at-home-02.jpg",
        alt: "The model beside a lit bookshelf in a floral robe.",
      },
      {
        image: "gucci-at-home-03.jpg",
        alt: "Leaning into the bookshelf, the red-and-green stripe on the sunglasses catching the light.",
      },
    ],
    seo: {
      title: "Gucci, at home: self-initiated content | Alroy Ndhlovu",
      description:
        "A self-initiated photo and video series for Gucci sunglasses, shot at home with hard light, deep shadow and a bookshelf, as stills and a short social video.",
    },
  },
  {
    slug: "botanik",
    name: "Botanik wine labels",
    label: "Concept",
    role: "Packaging design",
    deliverables: ["Label design", "Packaging concepts"],
    summary:
      "Label concepts for a wine range: each bottle carries its own landscape or botanical print.",
    intro: [
      "Label concepts for a wine range called Botanik. Each bottle carries its own illustration, from mountains to tropical leaves and flowers, shown here in styled scenes.",
    ],
    cover: "botanik-01.jpg",
    items: [
      {
        image: "botanik-01.jpg",
        alt: "A dark bottle with a mountain landscape label against an orange wall and dried grasses.",
      },
      {
        image: "botanik-02.jpg",
        alt: "A bottle with a tropical palm label beside a glass of white wine and a bowl of fruit.",
      },
      {
        image: "botanik-03.jpg",
        alt: "A bottle with a bright botanical label among orange and green leaves.",
      },
      {
        image: "botanik-04.jpg",
        alt: "A bottle with a floral label against red ferns.",
      },
      {
        image: "botanik-05.jpg",
        alt: "A bottle wrapped in a dense tropical print, lying on a white surface.",
      },
      {
        image: "botanik-06.jpg",
        alt: "A Botanik bottle in a dark floral print, tilted on a white plinth.",
      },
    ],
    seo: {
      title: "Botanik wine labels: packaging concepts | Alroy Ndhlovu",
      description:
        "Label concepts for Botanik, a wine range where each bottle carries its own illustrated landscape or botanical print, shown in styled product scenes.",
    },
  },
];

export const workPath = (project: Pick<WorkProject, "slug">) => `/work/${project.slug}/`;

export const FEATURED_WORK = WORK.filter((project) => project.featured);

/** The tile's second line: what was made, not every deliverable. */
export const workLine = (project: WorkProject) => project.deliverables.slice(0, 2).join(" · ");
