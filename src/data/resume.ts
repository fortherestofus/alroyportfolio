/**
 * Everything the résumé needs that the site does not already say.
 *
 * The two PDFs are rendered from the same Astro data as the site, so
 * `EXPERIENCE`, `EDUCATION`, `PRODUCTS`, `CASE_STUDIES` and `PORTFOLIO`
 * are read directly and never copied here. What is left is the three
 * things a portfolio site has no reason to carry:
 *
 *   1. Achievement bullets. The site shows *where* Alroy worked; a
 *      résumé has to say what he did there, and an ATS scores almost
 *      entirely on the nouns inside those bullets.
 *   2. Keyword blocks. Competencies and tools, written out flat so a
 *      parser can index them.
 *   3. The contact line, which wants a city — ATS location filters are
 *      unforgiving — where the site only ever needed a country.
 *
 * Source: Alroy's LinkedIn role descriptions (read 20 Oct 2026),
 * cross-checked against the measured outcomes in case-studies.ts.
 * Where a figure appears in both, the case study wins: those numbers
 * are quoted from the ad reports and are the ones that can be checked.
 *
 * `inferred: true` marks a bullet written from a job title alone,
 * because LinkedIn carries no description for that role. They are
 * honest but generic, and they are the first thing to replace.
 */

export interface ResumeBullet {
  text: string;
  /** Written from the title alone — no source description exists. */
  inferred?: boolean;
}

export interface RoleDetail {
  /**
   * Matches `company` in experience.ts. That file is the single source
   * for titles, dates and employment type; this one only adds prose, so
   * a date fixed there is fixed in both PDFs without a second edit.
   */
  company: string;
  /** Where the work happened, as LinkedIn records it. */
  location?: string;
  /**
   * One line of context for a company a reader will not recognise.
   * Recruiters outside South Africa will not know Innovatr or Reka
   * Afrika, and a bullet list under an unknown name is unreadable.
   */
  context?: string;
  bullets: ResumeBullet[];
  /**
   * Render as a single line — title, company, dates — with no bullets.
   *
   * Used for the pre-2018 roles, which have no description anywhere to
   * write from. A bullet invented to fill the space would say nothing
   * the title has not already said, and three of them in a row at the
   * foot of the document cost a page that the recent work needs. Standard
   * "earlier experience" practice, and a parser still gets every field.
   */
  compact?: boolean;
  /**
   * Sub-roles held at the same employer, newest first. Digify Africa is
   * four positions over two and a half years; collapsing them loses the
   * progression from assistant lead to lead, and splitting them into
   * four top-level entries reads as job-hopping.
   */
  subRoles?: { title: string; dates: string; bullet: string }[];
}

export const RESUME = {
  /*
   * Four disciplines, named as disciplines rather than as one invented
   * job title.
   *
   * The hybrid is the problem to solve here: a résumé that says
   * "consultant" matches nothing, and one that says "Marketing Manager"
   * throws away the half of the record that builds software. Keyword
   * matching in an ATS is literal, so the line spells out all four
   * tracks and lets whichever filter is running find its own.
   *
   * LinkedIn's headline is narrower — "Digital Media, Marketing &
   * Business Technology Consultant | Branding Strategist" — and that is
   * fine: recruiters cross-check titles and dates, not headlines.
   */
  headline:
    "Marketing & Brand Strategy · Product Management & UX Design · AI-Native Product Builder",
  location: "Johannesburg, Gauteng, South Africa",
  linkedin: "linkedin.com/in/alroyndhlovu",
  /*
   * Opens on the four tracks, in the exact phrasing job descriptions
   * use, then earns each one: a named client, a named product, a
   * number. Written long on purpose — the summary is the densest block
   * a parser reads and the first thing a human reads, and those two
   * readers want the same thing here.
   */
  summary:
    "Marketing, brand and product consultant with 12+ years across brand strategy, growth and performance marketing, product management, UX/UI design and business technology. Runs integrated go-to-market campaigns and paid media across Meta, Google, LinkedIn and TikTok, and builds the CRM and marketing automation behind them. Builds software AI-natively rather than by hand: writes the specification, chooses the stack, directs coding agents such as Claude Code and reviews what they produce. Four products taken from discovery to launch in 2026: two mobile apps live on the App Store, a published Chrome extension and an AI research tool. Hands-on platform work in WordPress, Shopify, WooCommerce, Squarespace and Webflow. Delivered for the IFC (World Bank Group), Meta, Digify Africa, Energy Capital & Power, Innovatr and the African Agri Council. Lead-form conversion at 36.6% against a 10–15% benchmark, paid acquisition at roughly three times better cost per lead than the B2B median, and an enterprise software licence replaced by a tool built in-house.",
} as const;

/**
 * The achievement bullets, keyed by company.
 *
 * Order does not matter here — the page walks EXPERIENCE and looks each
 * role up, so this list can never fall out of step with the site's.
 */
export const ROLE_DETAILS: RoleDetail[] = [
  {
    company: "Various",
    location: "Johannesburg, South Africa · Hybrid",
    context:
      "Trading as Dejamedia Company and Alroy Ndhlovu | The Brand. Consulting across marketing, brand and business technology.",
    bullets: [
      {
        text: "Delivered brand strategy, content strategy, integrated campaigns, marketing optimisation and business process automation for organisations including the IFC (World Bank Group), Meta, Digify Africa, Energy Capital & Power, the African Agri Council, Total Sports, Jenna Clifford, Cash'n'Sport, Nembhard Inc, English Plus Academy and Deep Ocean.",
      },
      {
        text: "Served 1,200+ projects and clients across 12+ years, spanning paid media, brand identity, UX/UI design, e-commerce builds on WordPress, Shopify and Webflow, and CRM and marketing automation.",
      },
      {
        text: "Delivered the LumiSkin brand site, covering concept, AI production, front-end and motion, in a single day for under $300, against $6,500+ quoted for the same brief produced conventionally.",
      },
      {
        text: "Founded and run Filosofee, a South African streetwear label: designed the range, built the e-commerce store, integrated payments, art-directed the shoot and ran the go-to-market. Sold locally and internationally in its first month and landed a 20-unit wholesale order from another brand.",
      },
    ],
  },
  {
    company: "Innovatr",
    location: "Johannesburg, South Africa · Hybrid",
    context:
      "Consumer intelligence platform whose flagship product, Test24, returns real consumer insight in 24 hours for brand and innovation teams.",
    bullets: [
      {
        text: "Led brand strategy and growth marketing: owned paid media and demand generation across LinkedIn, Google and Meta, developed multi-format content, and built the CRM and marketing automation workflows behind a qualified pipeline.",
      },
      {
        text: "Ran paid acquisition at roughly three times better cost per lead (CPL) than the B2B median, and led the rebrand with the founder, covering positioning, visual identity and go-to-market strategy.",
      },
      {
        text: "Designed and built Social Sweep, a proprietary real-time social listening product: API integrations across every major platform feeding an analysis and reporting pipeline. Replaced an annual enterprise software licence with an in-house product the company can now sell.",
      },
      {
        text: "Supported client innovation projects for Discovery Bank, DGB, Namibian Breweries and Rain, across CPG, financial services and telecoms.",
      },
    ],
  },
  {
    company: "Thrifty Adventures",
    location: "Remote",
    context: "Travel operator running group and tailored tours out of South Africa.",
    bullets: [
      {
        text: "Owned marketing strategy and paid media across four channels, plus brand strategy, content design, e-commerce strategy and business development, taking the brand from scattered to deliberate.",
      },
      {
        text: "Lifted lead-form conversion rate to 36.6% against a 10–15% LinkedIn benchmark; the brochure offer went on to drive 73% of all leads, while cost per lead on everything else ran 39% higher.",
      },
      {
        text: "Grew TikTok to 3.1 million organic views from the existing account, with paid click-through at 0.97% against a 0.52% platform median.",
      },
      {
        text: "Restructured the paid account through creative and audience A/B testing, cutting cost per click 58% month on month, lifting reach roughly eight-fold in the first month and holding it through the scale-up.",
      },
    ],
  },
  {
    company: "Deep Ocean",
    location: "Remote",
    bullets: [
      {
        text: "Designed and built the company website, and provided ongoing technical support across email infrastructure, domain registration and maintenance.",
      },
    ],
  },
  {
    company: "English Plus Academy",
    location: "Remote",
    bullets: [
      {
        text: "Redesigned the academy's website and migrated the hosting infrastructure to a provider able to carry planned business growth.",
      },
      {
        text: "Stayed on as consultant on call for web development and online business technology support.",
      },
    ],
  },
  {
    company: "African Agri Council",
    location: "South Africa · Remote",
    context: "African Agri Council NPC and its African Agri Investment Indaba event.",
    bullets: [
      {
        text: "Owned digital marketing strategy and delivery for the council and its flagship investment Indaba.",
      },
      {
        text: "Formulated paid media and content strategy across Facebook, LinkedIn and Google, built CRM automation and lead-capture workflows, and ran campaign data analysis that fed each successive round of optimisation.",
      },
    ],
  },
  {
    company: "Eris Property Group",
    location: "South Africa · Remote",
    bullets: [
      {
        text: "Short-term contract developing and coordinating social media for five of the group's shopping centres: content development, community management, and data and analytics.",
      },
    ],
  },
  {
    company: "Energy Capital & Power",
    location: "Remote",
    bullets: [
      {
        text: "Designed and delivered PR and digital marketing training programmes for delegates of the Minister of Mines and Hydrocarbons, Equatorial Guinea.",
      },
      {
        text: "Consulted on and ran campaign support for the company's flagship multinational annual events: content direction and creation, campaign build and management across LinkedIn, Google Ads and Facebook, and periodic reporting.",
      },
    ],
  },
  {
    company: "Kelly-Anne Mealia",
    bullets: [
      {
        text: "Ran brand and social media management for the client on an ongoing freelance basis.",
        inferred: true,
      },
    ],
  },
  {
    company: "IFC (World Bank Group)",
    context:
      "The We Are Victoria Falls programme, sponsored by the IFC in partnership with Zimbabwe Tourism, helping tourism SMEs recover after COVID.",
    bullets: [
      {
        text: "Developed the digital marketing curriculum and content for roughly 50 tourism SMEs across the programme.",
      },
      {
        text: "Delivered one-on-one consulting to around 20 businesses selected for additional support, equipping them with the tools to rebuild demand.",
      },
    ],
  },
  {
    company: "Digify Africa",
    location: "South Africa",
    context:
      "Meta's training delivery partner in Africa. Four positions over two and a half years, from assistant lead to programme lead.",
    bullets: [],
    subRoles: [
      {
        title: "Digify Pro Lead Trainer",
        dates: "Jun 2022 – Aug 2022",
        bullet:
          "Training lead for the Digify Pro programme covering digital marketing, social media and entrepreneurship, with particular emphasis on Meta properties, having served as assistant lead the previous year.",
      },
      {
        title: "Facebook Diaspora Workshop Lead",
        dates: "Nov 2021",
        bullet:
          "Developed and delivered the full curriculum for the Facebook Diaspora Workshop, supporting 20+ UK-based diaspora businesses.",
      },
      {
        title: "Digify Pro Assistant Lead",
        dates: "Jun 2021 – Sep 2021",
        bullet:
          "Assistant lead on the Digify Pro programme, before stepping up to lead it the following year.",
      },
      {
        title: "Boost with Facebook Trainer",
        dates: "Jul 2020 – Nov 2022",
        bullet:
          "Facilitated and delivered training on Meta's suite of products to over 1,000 people, including SMEs, digital marketing students and independent operators.",
      },
    ],
  },
  {
    company: "Reka Afrika",
    compact: true,
    bullets: [
      {
        text: "Ran digital media, marketing and e-commerce for the business.",
        inferred: true,
      },
    ],
  },
  {
    company: "iBags.co.za",
    compact: true,
    bullets: [
      {
        text: "Managed web content and e-commerce operations for the online retailer across a four-year tenure.",
        inferred: true,
      },
    ],
  },
];

/** Lookup used by both résumé pages. */
export function roleDetail(company: string): RoleDetail | undefined {
  return ROLE_DETAILS.find((detail) => detail.company === company);
}

/**
 * The competencies block: the single densest keyword surface on the
 * document, and the one an ATS scores hardest.
 *
 * Grouped under plain labels rather than laid out in columns. A
 * two-column skills grid is the classic parser failure — the parser
 * reads across the row and welds the left column's last word onto the
 * right column's first.
 *
 * Phrasing is deliberate and sometimes redundant. ATS matching is
 * literal rather than conceptual, so "conversion rate optimisation"
 * does not match a bullet that says "improved conversions", and a
 * British spelling does not match an American job description. Where a
 * term is commonly written both ways, both are listed — "optimisation
 * (CRO)", "UX/UI design" alongside "user experience" — which costs a
 * few words and wins the match either way.
 *
 * The five groups are the four tracks Alroy is actually hired for, plus
 * the training work that sits across all of them. Whichever filter is
 * running, it finds its own vocabulary in one place.
 */
export const COMPETENCIES = [
  {
    label: "Marketing & Growth",
    items: [
      "Marketing strategy",
      "Go-to-market strategy",
      "Integrated campaigns",
      "Performance marketing",
      "Paid media",
      "Paid social",
      "Paid search",
      "Meta Ads",
      "Google Ads",
      "LinkedIn Ads",
      "TikTok Ads",
      "Demand generation",
      "Lead generation",
      "Conversion rate optimisation (CRO)",
      "A/B testing",
      "Search engine optimisation (SEO)",
      "Email marketing",
      "CRM and marketing automation",
      "Marketing analytics",
      "Return on ad spend (ROAS)",
      "Cost per lead (CPL)",
      "Customer acquisition",
      "E-commerce strategy",
      "Social media marketing",
      "Community management",
    ],
  },
  {
    label: "Brand & Creative",
    items: [
      "Brand strategy",
      "Brand positioning",
      "Brand identity",
      "Brand voice",
      "Visual identity",
      "Brand guidelines",
      "Brand storytelling",
      "Rebranding",
      "Corporate branding",
      "Creative direction",
      "Art direction",
      "Content strategy",
      "Copywriting",
      "Graphic design",
      "Packaging design",
      "Photography",
      "Video production",
      "Motion design",
    ],
  },
  {
    label: "Product & UX",
    items: [
      "Product management",
      "Product marketing",
      "Product positioning",
      "Product design",
      "UX/UI design",
      "User experience design",
      "User research",
      "Discovery",
      "Information architecture",
      "Wireframing",
      "Prototyping",
      "Design systems",
      "Usability testing",
      "Responsive design",
      "Accessibility (WCAG)",
      "Roadmapping",
      "Agile project management",
      "Pricing strategy",
      "Mobile app development",
      "SaaS product development",
    ],
  },
  {
    label: "Business Technology, Automation & AI",
    items: [
      "Business technology consulting",
      "Digital transformation",
      "Business process automation",
      "Workflow automation",
      "No-code and low-code automation",
      "Systems integration",
      "API integration",
      "CMS implementation",
      "E-commerce platform builds",
      "AI-native product development",
      "AI-assisted (vibe) coding",
      "Directing coding agents",
      "Technical specification",
      "Stack selection",
      "Rapid prototyping",
      "AI workflow design",
      "Agentic workflows",
      "Retrieval-augmented generation (RAG)",
      "Prompt engineering",
      "Multimodal input (vision and voice)",
      "Model evaluation and grounding",
      "Citation verification",
      "Hallucination mitigation",
      "Human-in-the-loop review",
      "Cloud computing",
      "Data analysis",
      "Privacy-by-design",
    ],
  },
  {
    label: "Consulting & Enablement",
    items: [
      "Stakeholder management",
      "Client consulting",
      "Training delivery",
      "Curriculum development",
      "E-learning implementation",
      "Workshop facilitation",
      "Public speaking",
      "Cross-functional collaboration",
    ],
  },
] as const;

/**
 * Tools, in the literal spelling a filter searches for.
 *
 * The groups carry the distinction that matters, and it is the reason
 * this block is shaped the way it is.
 *
 * Alroy is not a developer and the résumé must not imply he is. The
 * first screen for any role that reads "React Native" on a CV is a
 * technical one, and he would be answering for code he did not write.
 * But the products are real, they are live on two app stores, and the
 * stacks are real choices he made and directed. Both of those are true
 * at once, and the group label is what keeps them true: the platform
 * and marketing tools are hands-on, and the product stacks say plainly
 * that they were specified and directed rather than hand-written.
 *
 * That framing is also the stronger one. "Developer who also markets"
 * is a common profile and an easy one to doubt. "Marketer and designer
 * who specifies and ships his own software through coding agents" is
 * the profile the AI-native and product-engineer postings are actually
 * written for, and the four shipped products are the proof.
 *
 * `assumed: true` still marks anything the work plainly required that
 * nothing on this site evidences, so it can be confirmed or deleted in
 * one pass.
 */
export const TOOLS = [
  {
    label: "Platforms & CMS",
    note: "hands-on",
    items: [
      { name: "WordPress" },
      { name: "WooCommerce" },
      { name: "Shopify" },
      { name: "Squarespace" },
      { name: "Webflow" },
    ],
  },
  {
    label: "Marketing & analytics",
    items: [
      { name: "Meta Ads Manager" },
      { name: "Google Ads" },
      { name: "LinkedIn Campaign Manager" },
      { name: "TikTok Ads Manager" },
      { name: "Google Analytics 4" },
      { name: "Google Tag Manager" },
      { name: "Google Search Console", assumed: true },
      { name: "HubSpot", assumed: true },
      { name: "Mailchimp", assumed: true },
      { name: "Paddle" },
      { name: "RevenueCat" },
    ],
  },
  {
    label: "Design, product & delivery",
    items: [
      { name: "Figma" },
      { name: "Affinity Designer" },
      { name: "Adobe Creative Suite", assumed: true },
      { name: "Canva", assumed: true },
      { name: "Notion" },
      { name: "Airtable" },
      { name: "Linear" },
      { name: "Jira", assumed: true },
      { name: "Asana" },
      { name: "Trello", assumed: true },
      { name: "Miro", assumed: true },
      { name: "Slack" },
    ],
  },
  {
    label: "AI & automation",
    items: [
      { name: "Claude" },
      { name: "Claude Code" },
      { name: "OpenAI Codex" },
      { name: "Google Gemini" },
      { name: "Grok" },
      { name: "Vercel AI SDK" },
      { name: "Zapier" },
      { name: "Make", assumed: true },
      { name: "n8n", assumed: true },
      { name: "Model Context Protocol (MCP)" },
    ],
  },
  {
    label: "Product stacks",
    note: "specified and directed; built with coding agents, not hand-written",
    items: [
      { name: "TypeScript" },
      { name: "React" },
      { name: "React Native" },
      { name: "Expo" },
      { name: "Next.js" },
      { name: "Astro" },
      { name: "Tailwind CSS" },
      { name: "Supabase" },
      { name: "PostgreSQL" },
      { name: "SQLite" },
      { name: "Chrome Manifest V3" },
      { name: "Vercel" },
      { name: "Netlify" },
      { name: "Git" },
    ],
  },
] as const;

/**
 * One line per product, written for the résumé rather than lifted from
 * the site.
 *
 * Each says what the system does, what it measured, and — the part the
 * rest of the document depends on — what Alroy's hand in it actually
 * was. "Specified and directed" is the accurate verb. He wrote the
 * brief, chose the stack, drove the coding agents and reviewed the
 * output; he did not type the implementation, and a résumé that lets a
 * reader assume otherwise is one he has to walk back in the interview.
 *
 * The technical detail stays, because it is true of the product and it
 * is what a technical reader is looking for. Only the agency changes.
 *
 * Keyed by `name` in products.ts.
 */
export const PRODUCT_NOTES: Record<string, string> = {
  Hakkan:
    "Specified and directed an agentic research pipeline: multi-platform retrieval synthesised into a cited, source-grounded report, then generation in the user's own learned voice. Rebuilding the evidence filter took verified human sources from 29% of citations to 57%; anything the model inferred is flagged rather than hidden.",
  InSpiritInTruth:
    "Retrieval-grounded generation against a fixed scripture corpus, with a verification pass taking ~77% of the AI effort against ~22% on the writing, because an app that quotes scripture cannot afford to misquote it. Live on the App Store.",
  "tapa.":
    "Multimodal input (text, voice and vision) resolved into a single constrained generation, with dietary rules set once and enforced as hard constraints rather than prompt suggestions. Offline-first. Live on the App Store.",
  CaughtSlipping:
    "Local-first behavioural tracking with no account and no server: everything stays on the device. Published on the Chrome Web Store.",
};

/**
 * What the keyword coverage is actually aimed at, checked by
 * `npm run resume:preview -- --keywords`.
 *
 * These are the four kinds of role Alroy is applying for. The list is
 * the test, not the target: if a term here does not appear in the
 * rendered PDF, either the document needs the phrase or the phrase does
 * not belong on this résumé. Both are useful to know before sending it.
 *
 * Keep it honest. Adding a term here and then writing it into the
 * document to make the count go green is how a résumé ends up full of
 * words its owner cannot defend in an interview.
 */
export const KEYWORD_TARGETS = [
  {
    role: "Marketing / brand roles",
    terms: [
      "brand strategy",
      "brand positioning",
      "go-to-market",
      "integrated campaigns",
      "performance marketing",
      "paid media",
      "demand generation",
      "lead generation",
      "conversion rate",
      "marketing automation",
      "CRM",
      "SEO",
      "campaign",
      "ROAS",
      "e-commerce",
    ],
  },
  {
    role: "Design roles",
    terms: [
      "UX/UI",
      "user research",
      "product design",
      "design system",
      "prototyping",
      "wireframing",
      "art direction",
      "visual identity",
      "accessibility",
      "Figma",
    ],
  },
  {
    role: "Business technology roles",
    terms: [
      "business process automation",
      "workflow automation",
      "systems integration",
      "API",
      "digital transformation",
      "data analysis",
      "cloud",
      "CMS",
      "SaaS",
    ],
  },
  {
    role: "AI-native builder / product engineer roles",
    terms: [
      "AI-native",
      "AI-assisted",
      "coding agents",
      "Claude Code",
      "vibe",
      "rapid prototyping",
      "agentic",
      "AI workflow",
      "retrieval-augmented generation",
      "RAG",
      "prompt engineering",
      "multimodal",
      "grounding",
      "human-in-the-loop",
      "shipped",
      "App Store",
      "Chrome Web Store",
      "TypeScript",
      "React Native",
      "Next.js",
      "Supabase",
    ],
  },
] as const;
