/**
 * Work history, most recent first. Source: prd/01-content.md, cross
 * checked against the 2026 résumé.
 *
 * `logoFile` names a file in src/assets/logos/. Leave it undefined and
 * the row falls back to a Lucide glyph in the same frame, so a missing
 * mark never blocks the build.
 *
 * Ordered by start date, newest first, under the standing Independent
 * Contractor entry. Adding a row here is all it takes; the section
 * renders straight from this array.
 */
export interface Role {
  title: string;
  company: string;
  /** Display string exactly as it should read. */
  dates: string;
  logoFile?: string;
  /** Optional one-liner shown under the title. */
  note?: string;
}

export const EXPERIENCE: Role[] = [
  {
    title: "Independent Contractor",
    company: "Various",
    dates: "2018 – Present",
    note: "Consulting across marketing, brand and business technology.",
  },
  {
    title: "Brand & Marketing Manager",
    company: "Innovatr",
    dates: "Mar 2026 – Sep 2026",
    logoFile: "innovatr.jpg",
  },
  {
    title: "Digital Marketing Consultant",
    company: "Thrifty Adventures",
    dates: "Jul 2025 – Present",
    logoFile: "thrifty.jpeg",
  },
  {
    title: "Web Design Specialist",
    company: "Deep Ocean",
    dates: "Oct 2024 – Oct 2025",
    logoFile: "Deep-Ocean-Logo.jpeg",
  },
  {
    title: "Web Design Specialist",
    company: "English Plus Academy",
    dates: "Oct 2024 – Mar 2025",
    logoFile: "EPA-logo.jpeg",
  },
  {
    title: "Digital Marketing Consultant",
    company: "African Agri Council",
    dates: "Aug 2024 – Nov 2024",
    logoFile: "aac.png",
  },
  {
    title: "Digital Media & Marketing Consultant",
    company: "Energy Capital & Power",
    dates: "Jan 2024 – Mar 2024",
    logoFile: "ECP_logo_internal_1Round-150x150-1.png",
  },
  {
    title: "Brand & Social Media Management",
    company: "Kelly-Anne Mealia",
    dates: "Sep 2022 – Apr 2024",
    // TODO(alroy): logo missing, see README.
  },
  {
    title: "Digital Marketing Consultant",
    company: "IFC (World Bank Group)",
    dates: "May 2022 – Oct 2023",
    logoFile: "IFC.jpeg",
  },
  {
    title: "Meta Certified Lead Trainer & Consultant",
    company: "Digify Africa",
    dates: "Jul 2020 – Nov 2022",
    logoFile: "Digify-Africa.png",
  },
  {
    title: "Digital Media, Marketing & E-Commerce",
    company: "Reka Afrika",
    dates: "Jul 2017 – Oct 2018",
    logoFile: "reka-afrika.jpeg",
  },
  {
    title: "Web Content & E-Commerce Manager",
    company: "iBags.co.za",
    dates: "Apr 2013 – Jun 2017",
    logoFile: "ibags.jpeg",
  },
];
