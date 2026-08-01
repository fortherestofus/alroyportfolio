/**
 * Global site constants. Anything that appears in more than one
 * place (URLs, contact details, nav structure) lives here so copy
 * changes never mean hunting through markup.
 * Source: prd/01-content.md
 */

export const SITE = {
  name: "Alroy Ndhlovu",
  url: "https://alroyndhlovu.com",
  title: "Alroy Ndhlovu | Full-Stack Marketing, Branding & Business Tech Consultant",
  description:
    "Alroy Ndhlovu is a full-stack digital marketing, branding and business technology consultant with 10+ years of experience helping brands grow through data, design and AI.",
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
  cal: "https://cal.com/mralroyndhlovu",
} as const;

/** The six journey sections. Drives the timeline nav and page order. */
export const SECTIONS = [
  { id: "who", number: "01", label: "Who is Alroy", short: "Who" },
  { id: "experience", number: "02", label: "Work experience", short: "Work" },
  { id: "education", number: "03", label: "Education", short: "Study" },
  { id: "portfolio", number: "04", label: "Portfolio", short: "Portfolio" },
  { id: "case-studies", number: "05", label: "Case studies", short: "Cases" },
  { id: "contact", number: "06", label: "Contact", short: "Contact" },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"];
