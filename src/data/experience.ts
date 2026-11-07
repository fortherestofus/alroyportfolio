/**
 * Work history, most recent first. Source: prd/01-content.md, cross
 * checked against the 2026 résumé.
 *
 * `logoFile` names a file in src/assets/logos/. Leave it undefined and
 * the row falls back to a Lucide glyph in the same frame, so a missing
 * mark never blocks the build.
 *
 * Ordered by start date, newest first, under the standing independent
 * consulting entry. Adding a row here is all it takes; the section
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
  /**
   * Where to see the work from this role: project pages and case
   * studies. Shown as links under the note, so the history and the
   * portfolio point at each other.
   */
  work?: { label: string; href: string }[];
}

export const EXPERIENCE: Role[] = [
  {
    title: "Brand, Product & Marketing Consultant",
    company: "Independent",
    employment: "Self-employed",
    dates: "2018 – Present",
    note: "Art direction for Jenna Clifford, event content for the IAB Bookmark Awards, a staff training film for Total Sports made end to end, and training for iHub, Meta and the IFC. Products built: InSpiritInTruth, tapa., CaughtSlipping, Hakkan and, for Innovatr, Social Sweep.",
    work: [
      { label: "Jenna Clifford", href: "/work/jenna-clifford/" },
      { label: "IAB Bookmark Awards", href: "/work/iab-bookmarks/" },
      { label: "Alabanza", href: "/work/alabanza/" },
      { label: "Mitch Sneakers", href: "/work/mitch-sneakers/" },
      { label: "Websites", href: "/work/websites/" },
    ],
  },
  {
    title: "Brand & Marketing Manager and Product Lead (Social Sweep)",
    company: "Innovatr",
    employment: "Full-time",
    dates: "Mar 2026 – Sep 2026",
    logoFile: "innovatr.jpg",
    note: "Rebrand, CRM and paid engine for a consumer research platform, and Social Sweep from business case to launch.",
    work: [
      { label: "Case study", href: "/case-studies/innovatr/" },
      { label: "Social Sweep", href: "/case-studies/social-sweep/" },
    ],
  },
  {
    title: "Digital Marketing Consultant",
    company: "Thrifty Adventures",
    employment: "Contract",
    dates: "Jul 2025 – Mar 2026",
    logoFile: "thrifty.jpeg",
    note: "Paid and organic across LinkedIn, TikTok and Google for a South African tour operator.",
    work: [{ label: "Case study", href: "/case-studies/thrifty-adventures/" }],
  },
  {
    title: "Web Design Specialist",
    company: "Deep Ocean",
    employment: "Freelance",
    dates: "Oct 2024 – Oct 2025",
    logoFile: "Deep-Ocean-Logo.jpeg",
    note: "Designed and built the company website, then ran its email, domains and maintenance.",
  },
  {
    title: "Web Design Specialist",
    company: "English Plus Academy",
    employment: "Contract",
    dates: "Oct 2024 – Mar 2025",
    logoFile: "EPA-logo.jpeg",
    note: "Redesigned the academy's website and moved its hosting to carry planned growth.",
    work: [{ label: "The site", href: "/work/websites/" }],
  },
  {
    title: "Digital Marketing Consultant",
    company: "African Agri Council",
    employment: "Contract",
    dates: "Aug 2024 – Nov 2024",
    logoFile: "aac.png",
    note: "Digital marketing for the council and its African Agri Investment Indaba.",
  },
  {
    title: "Social Media Specialist",
    company: "Eris Property Group",
    employment: "Contract",
    dates: "Aug 2024",
    // TODO(alroy): logo missing, see README.
    note: "Social media for five of the group's shopping centres: content, community and analytics.",
  },
  {
    title: "Digital Media & Marketing Consultant",
    company: "Energy Capital & Power",
    employment: "Contract",
    dates: "Nov 2023 – Mar 2024",
    logoFile: "ECP_logo_internal_1Round-150x150-1.png",
    note: "Campaigns for its flagship international events, and PR training for delegates of Equatorial Guinea's Ministry of Mines and Hydrocarbons.",
  },
  {
    title: "Brand & Social Media Management",
    company: "Kelly-Ann Mealia",
    employment: "Freelance",
    dates: "Sep 2022 – Apr 2024",
    // TODO(alroy): logo missing, see README.
    note: "Managed the LinkedIn brand of Energy Capital & Power's co-founder: content, video, photography and community.",
    work: [{ label: "The work", href: "/work/kelly-ann-mealia/" }],
  },
  {
    title: "Digital Marketing Consultant",
    company: "IFC (World Bank Group)",
    employment: "Contract",
    dates: "May 2022 – Oct 2023",
    logoFile: "IFC.jpeg",
    note: "A digital marketing curriculum for about 50 tourism businesses, and one-to-one consulting for about 20.",
  },
  {
    title: "Meta Certified Lead Trainer & Consultant",
    company: "Digify Africa",
    employment: "Contract",
    dates: "Jul 2020 – Nov 2022",
    logoFile: "Digify-Africa.png",
    note: "Trained 1,000+ people on Meta's products as a certified lead trainer.",
  },
  {
    title: "Product, Marketing & E-Commerce Manager",
    company: "Reka Afrika",
    employment: "Full-time",
    dates: "Jul 2017 – Oct 2018",
    logoFile: "reka-afrika.jpeg",
    note: "Sourced suppliers, ran the product range and its marketing, and built the online store.",
  },
  {
    title: "E-Commerce & Product Manager",
    company: "iBags.co.za",
    employment: "Full-time",
    dates: "Apr 2013 – Jun 2017",
    logoFile: "ibags.jpeg",
    note: "Ran e-commerce end to end for four years: suppliers, product range and the website.",
  },
];
