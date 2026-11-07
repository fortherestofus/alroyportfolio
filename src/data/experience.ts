/**
 * Work history, most recent first. Source: prd/01-content.md, cross
 * checked against the 2026 résumé, the LinkedIn role descriptions (via
 * resume.ts) and the case studies. Innovatr's scope is Alroy's own
 * account of the role (7 Nov 2026).
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
  /**
   * One sentence under the title: what the job was, in the words a
   * recruiter or a search engine would use for it.
   */
  note?: string;
  /**
   * What was actually done and what it achieved, one line each. Only
   * for roles with enough to say; a short contract gets the note alone.
   * Every figure here is quoted from a case study or the résumé source.
   */
  highlights?: string[];
  /**
   * The disciplines and platforms the role used, written out as the
   * literal terms people search for ("LinkedIn Ads", not "paid
   * social"). Shown as a quiet tag line; they are there to be matched.
   */
  skills?: string[];
  /**
   * Where to see the work from this role: project pages, case
   * studies, or the live thing on the client's own site. Shown as
   * links under the note, so the history and the portfolio point at
   * each other. An absolute URL opens in a new tab.
   */
  work?: { label: string; href: string }[];
}

export const EXPERIENCE: Role[] = [
  {
    title: "Brand, Product & Marketing Consultant",
    company: "Independent",
    employment: "Self-employed",
    dates: "2018 – Present",
    note: "Brand strategy, digital marketing, creative direction, video production and training for clients, alongside building and launching my own software products.",
    highlights: [
      "Built and launched four products end to end: InSpiritInTruth and tapa. (iOS apps on the App Store), CaughtSlipping (Chrome extension) and Hakkan (AI research tool).",
      "Art direction and content direction for Jenna Clifford, the event video for the IAB Bookmark Awards, and a staff training video for Total Sports, produced end to end.",
      "Digital marketing training and consulting for Meta, the IFC (World Bank Group) and iHub.",
      "Founded Filosofee, a streetwear label: range design, e-commerce store and payments, the photoshoot and the go-to-market.",
    ],
    skills: [
      "Brand strategy",
      "Digital marketing",
      "Art direction",
      "Content direction",
      "Video production",
      "Product management",
      "AI-native development",
      "E-commerce",
    ],
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
    note: "Ran all digital marketing for a consumer insights platform, owned its brand and website, and took Social Sweep from business case to launch as product lead.",
    highlights: [
      "Ran LinkedIn Ads with account-based targeting: 61% of delivery reached decision-makers, at a third of the B2B median cost per lead.",
      "Built the CRM from nothing and wrote and designed every email sequence in Zoho Campaigns: 36.7% opens and 4.1% clicks on onboarding, both above B2B norms.",
      "Ran social media, turning research findings into LinkedIn carousels, video and ad creative.",
      "Repositioned the brand with the founder, then wrote the brand guidelines and produced the brand assets.",
      "Redesigned and maintained the company website, and worked on parts of the core product.",
      "Product lead for Social Sweep, an AI social listening tool: made the build-versus-buy case, then built and maintained it. It replaced a US$5,000-a-year licence and now sells in every Innovatr membership.",
    ],
    skills: [
      "Digital marketing",
      "LinkedIn Ads",
      "Account-based marketing",
      "CRM",
      "Email marketing",
      "Marketing automation",
      "Social media marketing",
      "Brand guidelines",
      "Website redesign",
      "Product management",
    ],
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
    note: "Built the paid and organic marketing for a South African tour operator from scratch across LinkedIn, TikTok and Google, giving each channel one job in turning attention into leads.",
    highlights: [
      "LinkedIn lead forms converted at 36.6% against a 10–15% benchmark; a brochure offer drove 73% of all leads.",
      "3.1 million organic TikTok views, 38% of them from search, and TikTok ads at 0.97% click-through against a 0.52% median.",
      "Google Ads across search, display and Performance Max, at a cost per click about 99% below the travel median.",
      "Creative and audience A/B testing cut cost per click 58% month on month.",
    ],
    skills: [
      "Performance marketing",
      "LinkedIn Ads",
      "TikTok Ads",
      "Google Ads",
      "TikTok marketing",
      "Lead generation",
      "A/B testing",
      "Brand strategy",
    ],
    work: [{ label: "Case study", href: "/case-studies/thrifty-adventures/" }],
  },
  {
    title: "Web Design Specialist",
    company: "Deep Ocean",
    employment: "Freelance",
    dates: "Oct 2024 – Oct 2025",
    logoFile: "Deep-Ocean-Logo.jpeg",
    note: "Designed and built the company website, then ran its business email, domain management and website maintenance.",
    skills: [
      "Web design",
      "Web development",
      "Business email",
      "Domain management",
      "Website maintenance",
    ],
    work: [{ label: "The site", href: "https://deepocean.solutions/" }],
  },
  {
    title: "Web Design Specialist",
    company: "English Plus Academy",
    employment: "Contract",
    dates: "Oct 2024 – Mar 2025",
    logoFile: "EPA-logo.jpeg",
    note: "Redesigned the academy's website and migrated its hosting to carry planned growth, then stayed on call for web development and technical support.",
    skills: ["Website redesign", "Web development", "Hosting migration", "Technical support"],
    work: [{ label: "The site", href: "/work/websites/" }],
  },
  {
    title: "Digital Marketing Consultant",
    company: "African Agri Council",
    employment: "Contract",
    dates: "Aug 2024 – Nov 2024",
    logoFile: "aac.png",
    note: "Ran digital marketing for the council and its African Agri Investment Indaba: paid media and content strategy across Facebook, LinkedIn and Google, CRM automation, lead capture and campaign analysis.",
    skills: [
      "Digital marketing strategy",
      "Event marketing",
      "Facebook Ads",
      "LinkedIn Ads",
      "Google Ads",
      "CRM automation",
      "Campaign analytics",
    ],
  },
  {
    title: "Social Media Specialist",
    company: "Eris Property Group",
    employment: "Freelance",
    dates: "Aug 2024",
    logoFile: "eris.png",
    note: "Agency-side social media for five of the group's shopping centres on a short-term support contract: posts for more than twenty of their stores, page covers, community management and occasional paid boosts.",
    skills: [
      "Social media management",
      "Social media content",
      "Graphic design",
      "Paid social",
      "Retail marketing",
      "Multi-brand content",
      "Community management",
    ],
    work: [{ label: "The work", href: "/work/eris-property-group/" }],
  },
  {
    title: "Digital Media & Marketing Consultant",
    company: "Energy Capital & Power",
    employment: "Contract",
    dates: "Nov 2023 – Mar 2024",
    logoFile: "ECP_logo_internal_1Round-150x150-1.png",
    note: "Campaigns for its flagship international energy events, and a PR and digital marketing training programme for delegates of Equatorial Guinea's Ministry of Mines and Hydrocarbons.",
    highlights: [
      "Content direction and creation, campaign build and management across LinkedIn, Google Ads and Facebook, and regular reporting.",
      "Designed and delivered the PR and digital marketing training programme for the ministry's delegates.",
    ],
    skills: [
      "Event marketing",
      "B2B marketing",
      "LinkedIn Ads",
      "Google Ads",
      "Facebook Ads",
      "PR training",
      "Campaign reporting",
    ],
  },
  {
    title: "Brand & Social Media Management",
    company: "Kelly-Ann Mealia",
    employment: "Freelance",
    dates: "Sep 2022 – Apr 2024",
    // TODO(alroy): logo missing, see README.
    note: "Managed the LinkedIn personal brand of Energy Capital & Power's co-founder and chairperson: content creation, video, photography and community management.",
    skills: [
      "Personal branding",
      "LinkedIn content strategy",
      "Video production",
      "Photography",
      "Community management",
    ],
    work: [{ label: "The work", href: "/work/kelly-ann-mealia/" }],
  },
  {
    title: "Digital Marketing Consultant",
    company: "IFC (World Bank Group)",
    employment: "Contract",
    dates: "May 2022 – Oct 2023",
    logoFile: "IFC.jpeg",
    note: "Wrote the digital marketing curriculum for about 50 tourism SMEs on the IFC's We Are Victoria Falls recovery programme, and consulted one to one with about 20 of them.",
    skills: [
      "Curriculum design",
      "Digital marketing training",
      "SME consulting",
      "Tourism marketing",
    ],
    work: [{ label: "The training", href: "https://wearevictoriafalls.com/training/" }],
  },
  {
    title: "Meta Certified Lead Trainer & Consultant",
    company: "Digify Africa",
    employment: "Contract",
    dates: "Jul 2020 – Nov 2022",
    logoFile: "Digify-Africa.png",
    note: "Trained 1,000+ small businesses, students and marketers on Facebook, Instagram and Meta's business tools for Meta's training partner in Africa, rising from assistant lead to programme lead.",
    highlights: [
      "Boost with Facebook trainer for two and a half years, across Meta's suite of business products.",
      "Digify Pro: assistant lead in 2021, programme lead in 2022, covering digital marketing, social media and entrepreneurship.",
      "Facebook Diaspora Workshop: wrote and delivered the curriculum for 20+ UK-based diaspora businesses.",
    ],
    skills: [
      "Meta Certified",
      "Facebook marketing",
      "Instagram marketing",
      "Meta Ads",
      "Training delivery",
      "Curriculum development",
    ],
  },
  {
    title: "Product, Marketing & E-Commerce Manager",
    company: "Reka Afrika",
    employment: "Full-time",
    dates: "Jul 2017 – Oct 2018",
    logoFile: "reka-afrika.jpeg",
    note: "Ran e-commerce end to end: supplier sourcing, the product range, product photography, marketing and building the online store.",
    skills: [
      "E-commerce management",
      "Product management",
      "Supplier sourcing",
      "Product photography",
      "Online store development",
    ],
  },
  {
    title: "E-Commerce & Product Manager",
    company: "iBags.co.za",
    employment: "Full-time",
    dates: "Apr 2013 – Jun 2017",
    logoFile: "ibags.jpeg",
    note: "Ran e-commerce end to end for four years: supplier sourcing, product range management, the website and product presentation, working alongside the marketing agency.",
    skills: [
      "E-commerce management",
      "Product range management",
      "Merchandising",
      "Supplier management",
      "Agency management",
    ],
  },
];
