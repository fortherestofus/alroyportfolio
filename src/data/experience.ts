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
  /**
   * How the work was engaged, taken from LinkedIn. It matters here:
   * a consultant's history reads as a lot of short stints unless the
   * page says plainly that most of them were contracts, which is the
   * arrangement rather than the tenure.
   */
  employment?: "Full-time" | "Contract" | "Freelance" | "Self-employed";
  /** Optional one-liner shown under the title. */
  note?: string;
}

export const EXPERIENCE: Role[] = [
  {
    title: "Independent Contractor",
    company: "Various",
    employment: "Self-employed",
    dates: "2018 – Present",
    note: "Consulting across marketing, brand and business technology.",
  },
  {
    title: "Brand & Marketing Manager",
    company: "Innovatr",
    employment: "Full-time",
    dates: "Mar 2026 – Sep 2026",
    logoFile: "innovatr.jpg",
  },
  {
    title: "Digital Marketing Consultant",
    company: "Thrifty Adventures",
    employment: "Contract",
    dates: "Jul 2025 – Present",
    logoFile: "thrifty.jpeg",
  },
  {
    title: "Web Design Specialist",
    company: "Deep Ocean",
    employment: "Freelance",
    dates: "Oct 2024 – Oct 2025",
    logoFile: "Deep-Ocean-Logo.jpeg",
  },
  {
    title: "Web Design Specialist",
    company: "English Plus Academy",
    employment: "Contract",
    dates: "Oct 2024 – Mar 2025",
    logoFile: "EPA-logo.jpeg",
  },
  {
    title: "Digital Marketing Consultant",
    company: "African Agri Council",
    employment: "Contract",
    dates: "Aug 2024 – Nov 2024",
    logoFile: "aac.png",
  },
  {
    title: "Digital Media & Marketing Consultant",
    company: "Energy Capital & Power",
    employment: "Contract",
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
    employment: "Contract",
    dates: "May 2022 – Oct 2023",
    logoFile: "IFC.jpeg",
  },
  {
    title: "Meta Certified Lead Trainer & Consultant",
    company: "Digify Africa",
    employment: "Contract",
    dates: "Jul 2020 – Nov 2022",
    logoFile: "Digify-Africa.png",
  },
  {
    title: "Digital Media, Marketing & E-Commerce",
    company: "Reka Afrika",
    employment: "Full-time",
    dates: "Jul 2017 – Oct 2018",
    logoFile: "reka-afrika.jpeg",
  },
  {
    title: "Web Content & E-Commerce Manager",
    company: "iBags.co.za",
    employment: "Full-time",
    dates: "Apr 2013 – Jun 2017",
    logoFile: "ibags.jpeg",
  },
];
