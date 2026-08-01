/**
 * Verbatim from prd/01-content.md. The only edit is the typo fix noted
 * there ("temimely" → "timely" in the IFC quote); wording is otherwise
 * untouched, since these are other people's words.
 */
export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  organisation: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Alroy consistently produces high-quality and timely work and is always willing to go the extra mile to ensure a project's completion. His calm and patient demeanour make him a pleasure to work with.",
    name: "Hermione Nevill",
    role: "Senior Consultant",
    organisation: "IFC (International Finance Corporation)",
  },
  {
    quote:
      "Alroy demonstrated an exceptional work ethic, resourcefulness, and dedication to client success, including supporting post-contract. I would happily work with him again and recommend him without reservation.",
    name: "Devi Paulsen-Abbott",
    role: "Commercial and Strategy Director",
    organisation: "CIO Africa by dx5",
  },
  {
    quote:
      "Worked with Alroy for 2+ years. He's extremely professional and has a variety of talents you can make use of. He's like a Swiss army knife lol. Wherever his profile fit, he'd always be first in mind to put onto a project.",
    name: "Kelly-Ann Ayuk",
    role: "Co-Founder and Chairperson",
    organisation: "Energy Capital & Power",
  },
];

/** "I've worked with" strip. Same marks as the experience rows. */
export const CLIENT_LOGOS = [
  { name: "Innovatr", logoFile: "innovatr.jpg" },
  { name: "Digify Africa", logoFile: "Digify-Africa.png" },
  { name: "Energy Capital & Power", logoFile: "ECP_logo_internal_1Round-150x150-1.png" },
  { name: "IFC (World Bank Group)", logoFile: "IFC.jpeg" },
  { name: "African Agri Council", logoFile: "aac.png" },
  { name: "Meta", logoFile: "Facebook_Logo_Primary.png" },
  { name: "Jenna Clifford", logoFile: "Jenna-C.jpg" },
] as const;
