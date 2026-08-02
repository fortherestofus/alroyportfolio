/**
 * Global site constants. Anything that appears in more than one
 * place (URLs, contact details, nav structure) lives here so copy
 * changes never mean hunting through markup.
 * Source: prd/01-content.md
 */

export const SITE = {
  name: "Alroy Ndhlovu",
  url: "https://alroyndhlovu.com",
  /*
   * 53 characters. Google truncates a title around 60, and the previous
   * one ran to 86 — the four disciplines it was trying to list were cut
   * off mid-word in the one place they were supposed to be read.
   */
  title: "Alroy Ndhlovu — Marketing, Brand & Product Consultant",
  /*
   * The meta and OG description, budgeted to 160 characters because
   * that is where search results truncate. Answer-shaped on purpose
   * ("Alroy Ndhlovu is a…") so it survives being lifted out of context
   * by a search or answer engine.
   */
  description:
    "Alroy Ndhlovu is a marketing, branding, business technology and product consultant with 10+ years helping brands grow through data, design and AI.",
  /*
   * The long version, for places with no character budget: structured
   * data and llms.txt. Separate from `description` because a truncation
   * limit is a property of search results, not of the truth.
   */
  bio: "Alroy Ndhlovu is a full-stack digital marketing, branding, business technology and product consultant based in South Africa, with over ten years of experience. He works across strategy, brand, paid media, content, and the design and engineering of software products — and ships the products himself rather than only advising on them.",
  locale: "en_ZA",
  email: "hello@alroyndhlovu.com",
  phone: "+27 76 267 8936",
  phoneHref: "+27762678936",
  resume: "/alroy-ndhlovu-resume.pdf",
} as const;

export const SOCIAL = {
  linkedin: "https://www.linkedin.com/in/alroyndhlovu/",
  dribbble: "https://dribbble.com/mralroyndhlovu",
  instagram: "https://www.instagram.com/mralroyndhlovu",
  github: "https://github.com/fortherestofus",
  /*
   * A specific event, not the profile. The profile URL renders as a menu
   * of meeting types that has to be clicked through before any
   * availability shows; pointing at the event drops the reader straight
   * onto a calendar. The paid consultation is linked beneath the embed
   * rather than lost — Alroy is talking to employers and clients at the
   * same time, and the rate is a signal he wants kept.
   */
  cal: "https://cal.com/mralroyndhlovu/quick",
  calConsultation: "https://cal.com/mralroyndhlovu/consultation",
} as const;

/**
 * The six journey sections. Single source for the timeline nav, the
 * page order and each section's left column.
 *
 * `label` is the nav label, `short` the mobile pill, `heading` the h2.
 * Blurbs for 02, 03 and 06 are verbatim from 01-content.md; 01 is the
 * tightened hero line; 04 and 05 describe what the section contains.
 */
export const SECTIONS = [
  {
    id: "who",
    number: "01",
    label: "Who is Alroy",
    short: "Who",
    heading: "Who is Alroy Ndhlovu",
    blurb:
      "Full-stack digital marketing, business technology and branding strategy. I help businesses grow by designing high-impact solutions through data, automation, AI and creative strategy.",
  },
  {
    id: "experience",
    number: "02",
    label: "Work experience",
    short: "Work",
    heading: "Work experience",
    blurb:
      "Ten plus years across marketing, media, e-commerce and technology. Contract and consulting work for global organisations and ambitious brands.",
  },
  {
    id: "education",
    number: "03",
    label: "Education",
    short: "Study",
    heading: "Education",
    blurb:
      "Always learning. Formal certificates and specialisations across marketing, product, design and engineering.",
  },
  {
    id: "portfolio",
    number: "04",
    label: "Portfolio",
    short: "Portfolio",
    heading: "Portfolio",
    blurb:
      "Selected work across UX/UI, web, branding, content and photography. Open a category to page through the shots.",
  },
  {
    id: "products",
    number: "05",
    label: "Products",
    short: "Products",
    heading: "Products I've built",
    blurb:
      "Business technology is not just advice. These are shipped products, built end to end with modern AI-assisted speed.",
  },
  {
    id: "case-studies",
    number: "06",
    label: "Case studies",
    short: "Cases",
    heading: "Case studies",
    blurb:
      "The long version. The starting point, the thinking, the work, and what changed as a result.",
  },
  {
    id: "contact",
    number: "07",
    label: "Contact",
    short: "Contact",
    heading: "Contact",
    blurb:
      "I'm open for work. If you like what I do and want me on your team or project, reach out.",
  },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"];
