/**
 * Copy for the LinkedIn document ad, printed to
 * public/alroy-ndhlovu-linkedin.pdf from /linkedin/.
 *
 * A document ad is read in a feed, by a stranger, at speed. The first
 * two slides decide whether there is a third, and the reader is either
 * hiring or buying, never both and never identified. So the document
 * makes one case for both of them and splits only on the last slide,
 * where the ask actually differs.
 *
 * Everything measurable is read from the files that already hold it
 * (EXPERIENCE, CASE_STUDIES, PRODUCTS, TESTIMONIALS, PORTFOLIO) and
 * never retyped here. What lives in this file is the writing that only
 * this document needs: the hook, the slide headings, the framing of
 * each product as a problem rather than a feature list, and the two
 * closing asks.
 *
 * The one rule the numbers follow: every figure on these slides exists
 * in case-studies.ts or products.ts first, quoted from Alroy's own ad
 * reports. A document ad is seen by people who will check.
 *
 * House style for this file, set by Alroy and different from the rest
 * of the repo: no em dashes, and no rhetorical scaffolding. No "not X
 * but Y" antithesis, no sentence fragments for emphasis, no balanced
 * triads. Plain sentences with ordinary punctuation. The writing is
 * supposed to sound like him talking, and those devices are the tell
 * that it is not.
 */

/**
 * The cover.
 *
 * It promises diagnosis rather than delivery, which is the distinction
 * the rest of the document is built on: most suppliers execute a brief,
 * and the value here is working out what the brief should have been.
 * It also stops short of saying what happens next, so the reader has a
 * question the following eleven slides answer.
 *
 * Length is a design constraint, not a preference. The cover column
 * runs about 17 characters per line at 56pt, so every character spent
 * here costs type size on the one slide whose whole job is stopping a
 * scroll.
 */
export const COVER = {
  eyebrow: "Marketing · Brand · Design · Product",
  headline: "I identify business problems, then build solutions around them.",
  standfirst:
    "Twelve years across marketing, brand, design and product. I help turn expensive problems into cost-saving solutions.",
  location: "Johannesburg, South Africa · Working worldwide",
} as const;

/**
 * Slide 02. The story, in the time it takes to swipe past it.
 *
 * The client list is past tense on purpose. Alroy worked with the IFC
 * and Meta, and does not now; writing it as current work is the kind
 * of claim a recruiter checks in thirty seconds. Named as past work it
 * still does its job, which is to show the level he operates at.
 */
export const INTRO = {
  heading: "Hello, I'm Alroy",
  body: [
    "Twelve years, across a range of industries and every working arrangement there is: full-time employee, contractor, and my own boss, sometimes in the same year. Different industries and different budgets mean I have usually seen some version of the problem before.",
    "I have built brands, websites, campaigns and products, then managed and marketed them, for organisations from the IFC and Meta down to founder-led startups. I run projects start to finish: diagnosis, plan, build, and the growth after launch.",
  ],
  pullquote:
    "85% of executives say their organisation is bad at diagnosing problems, and 87% say it costs them money. Most businesses do not need another supplier. They need someone to work out what is wrong first.",
  /*
   * Cited on the page, in small type. The claim is the spine of the
   * cover line, and an uncited version of it is indistinguishable from
   * every consultant who asserts the same thing without evidence.
   */
  pullquoteSource: "Harvard Business Review, 106 executives, 17 countries",
} as const;

/**
 * Slide 03. Experience only, on purpose.
 *
 * This slide used to mix tenure with campaign performance, and the two
 * were arguing with each other: a reader cannot hold "twelve years" and
 * "36.6% form conversion" as the same kind of fact. Tenure and range
 * belong here, where they answer "who is this", and the performance
 * figures belong on the case-study slides, where the context that makes
 * them mean anything already lives.
 */
export const NUMBERS = [
  { value: "12+", label: "Years across marketing, brand, design and product" },
  { value: "1,200+", label: "Projects and clients served" },
  {
    value: "13",
    label: "Roles held",
    context: "Across employment, contract and freelance",
  },
  {
    value: "10+",
    label: "Industries worked in",
    context: "From development finance and energy to travel, property and retail",
  },
  {
    value: "1,000+",
    label: "People trained on Meta's products",
    context: "Through Digify Africa, Meta's delivery partner in Africa",
  },
  {
    value: "70",
    label: "Businesses coached one to one",
    context: "On IFC and Meta programmes across Southern Africa and the UK",
  },
] as const;

/**
 * Slide 04. The four disciplines, each with the vocabulary a reader is
 * scanning for underneath it. Written as what gets delivered, with the
 * nouns on the second line for the scan.
 */
export const DISCIPLINES = [
  {
    number: "01",
    name: "Marketing & Growth",
    blurb:
      "Campaigns and go-to-market plans built on audience insight and performance data, tuned for a number someone has to hit.",
    keywords: [
      "Paid media",
      "Meta · Google · LinkedIn · TikTok",
      "Demand generation",
      "CRO & A/B testing",
      "SEO",
      "CRM & marketing automation",
      "Analytics",
    ],
  },
  {
    number: "02",
    name: "Brand & Creative",
    blurb:
      "Positioning, visual systems and the content that carries them across every touchpoint, not only the logo sheet.",
    keywords: [
      "Brand strategy",
      "Visual identity",
      "Art direction",
      "Content strategy",
      "Copywriting",
      "Photography",
      "Motion design",
    ],
  },
  {
    number: "03",
    name: "Product & UX",
    blurb:
      "Apps and SaaS taken from problem to shipped product: discovery, UX/UI, build, and the roadmap that follows launch.",
    keywords: [
      "Product management",
      "UX/UI design",
      "User research",
      "Prototyping",
      "Design systems",
      "Roadmapping",
      "Accessibility",
    ],
  },
  {
    number: "04",
    name: "Business Tech & AI",
    blurb:
      "Automation, AI and e-commerce systems that cut manual work, replace licence fees and scale with the business.",
    keywords: [
      "AI-native development",
      "Agentic workflows",
      "Process automation",
      "API integration",
      "RAG & grounding",
      "E-commerce builds",
    ],
  },
] as const;

/**
 * Slide 05. The range slide, and the reason it exists: calling yourself
 * multi-disciplinary is a claim until six different kinds of artefact
 * are sitting next to each other. Filenames resolve through `shotImage`
 * in portfolio.ts, so these are the same files the site shows.
 *
 * `focus` sets object-position for a shot whose subject is not in the
 * middle. Every photograph in the library is 4:5 and every tile here is
 * landscape, so the default centre crop takes the face out of a portrait
 * and the cover lines off an editorial page.
 */
export const RANGE = [
  {
    image: "branding_logo_media.webp",
    label: "Identity",
    note: "Marks, wordmarks and brand systems",
  },
  {
    image: "website_video_lumiskin-poster.webp",
    label: "Web",
    note: "Brand sites and storefronts",
  },
  {
    image: "hakkan-research.jpg",
    label: "UX/UI",
    note: "App and product interfaces",
  },
  {
    image: "design_print_digital_2.webp",
    label: "Editorial",
    note: "Print, packaging and layout",
    /* Cover lines sit in the top third; a centre crop loses them. */
    focus: "50% 22%",
  },
  {
    image: "photography_editorial.webp",
    label: "Photography",
    note: "Studio, editorial and e-commerce",
    /* Shot 4:5. A centre crop into a landscape tile cuts the face off,
       which is the one thing a portrait has to keep. */
    focus: "50% 18%",
  },
  {
    image: "thrifty_socialmedia.webp",
    label: "Content",
    note: "Social, video and campaign creative",
  },
] as const;

/**
 * Slides 06 and 07. The two client case studies, condensed to the four
 * figures each that survive being checked.
 *
 * The clients are unnamed here at Alroy's request. That costs the proof
 * something, because a named brand carries more than "a travel company"
 * does, so the link stays and says the client is named in the full
 * study. The reader who cares is one click from the name; the slide
 * itself claims nothing it has to ask permission for.
 *
 * The link text no longer prints the slug either. "/case-studies/
 * thrifty-adventures" named the client in the one line that was
 * supposed to protect it.
 */
export const STUDIES = [
  {
    slug: "thrifty-adventures",
    kicker: "Case study · Travel",
    client: "A travel company",
    heading: "A travel brand that was spending on the wrong channel",
    body: "Owned marketing strategy and paid media across four channels, plus brand, content and e-commerce strategy. The account was restructured around creative and audience testing, then rebuilt around a single offer that turned out to carry everything.",
    metrics: [
      {
        value: "36.6%",
        label: "Form completion on the brochure offer",
        context: "8.6% on the identical form with nothing to collect",
      },
      { value: "73%", label: "Of all leads came from that one ask" },
      { value: "−58%", label: "Cost per click, month on month" },
      {
        value: "0.97%",
        label: "Click-through",
        context: "Against a 0.52% platform median",
      },
    ],
  },
  {
    slug: "innovatr",
    kicker: "Case study · Consumer research",
    client: "A research company",
    heading: "A rebrand, a pipeline, and a product that replaced a licence",
    body: "Led brand strategy and growth marketing: the rebrand with the founder, paid media and demand generation across LinkedIn, Google and Meta, and the CRM behind the pipeline. Then designed and built their social listening tool, integrated across every major platform.",
    metrics: [
      { value: "~3×", label: "Better cost per lead than the B2B median" },
      {
        value: "61%",
        label: "Of delivery reached decision-makers",
        context: "Senior, Director, VP, C-suite, Owner, Partner",
      },
      { value: "14 of 22", label: "Top companies by delivery were named targets" },
      { value: "0 → live", label: "CRM built in six months" },
    ],
  },
] as const;

/**
 * Slide 08. Each product framed as the problem it solves, because a
 * stranger in a feed has no reason to care what it is built with. The
 * stack is the job of slide 10.
 *
 * Keyed by `name` in products.ts, which supplies the status, platform,
 * store link and screenshots.
 */
export const PRODUCT_PITCH: Record<string, { problem: string; solution: string }> = {
  InSpiritInTruth: {
    problem: "Devotional apps either water scripture down or assume you already know it.",
    solution:
      "Generation grounded against a fixed scripture corpus, with a verification pass taking roughly 77% of the AI effort, because an app that quotes scripture cannot afford to misquote it.",
  },
  "tapa.": {
    problem: "You have ingredients in the fridge and no idea what to cook with them.",
    solution:
      "Photograph it, say it or type it. Dietary rules are set once and enforced as hard constraints rather than prompt suggestions. Works offline.",
  },
  CaughtSlipping: {
    problem: "You know you are losing hours online. Nothing tells you honestly.",
    solution:
      "Local-first behavioural tracking that calls you out. No account and no server, so everything stays on the device.",
  },
  Hakkan: {
    problem: "Content research takes days, and still comes out sounding like everyone else's.",
    solution:
      "Multi-platform retrieval synthesised into a cited, source-grounded report, then written in your own learned voice. Rebuilding the evidence filter took verified human sources from 29% to 57%.",
  },
};

/** The order they appear on the slide: shipped first, beta last. */
export const PRODUCT_ORDER = ["InSpiritInTruth", "tapa.", "CaughtSlipping", "Hakkan"] as const;

/**
 * Slide 09. The method, in the three states the studio runs on.
 *
 * This is the slide the cover is writing a cheque for. "Discover what
 * they're missing" is a promise about step one, and step one is where
 * twelve years of research and campaign work actually shows up. The
 * four disciplines read as a list until they are shown as one loop:
 * the marketing finds the problem, the build answers it, and the
 * marketing sells what got built.
 */
export const PROCESS = [
  {
    number: "01",
    title: "Identify",
    stamp: "Week 0",
    blurb:
      "I work out what the actual problem is, who it affects, and what a result would look like with a number on it. Twelve years of research, brand and campaign work is what makes this part quick. I do not write a proposal until it is clear.",
    tint: "amber",
  },
  {
    number: "02",
    title: "Build",
    stamp: "Week by week",
    blurb:
      "I write the specification, choose the stack and direct coding agents, then review what they produce. Short cycles, with something you can look at by the end of each one. Four products reached launch this way in a single year.",
    tint: "rust",
  },
  {
    number: "03",
    title: "Grow",
    stamp: "Launch onward",
    blurb:
      "Launching is the easy part. After it comes positioning, paid media, CRM and the content that carries them, measured against the number we agreed at the start.",
    tint: "olive",
  },
] as const;

/** The receipts under the process slide. Both are in the record already. */
export const PROCESS_PROOF = [
  {
    value: "1 day, under $300",
    label: "The LumiSkin brand site, covering concept, AI production, front-end and motion",
    context: "Against $6,500+ quoted for the same brief produced conventionally",
  },
  {
    value: "US$5,000 a year, replaced",
    label: "A social listening licence, rebuilt in-house for under R10,000",
    context: "Now a product the company can sell instead of a cost it carries",
  },
] as const;

/**
 * Slide 10. The toolset, grouped so the one distinction that matters
 * survives the scan.
 *
 * Alroy is not a developer and this document may not imply he is. The
 * platform and marketing tools are hands-on; the product stacks were
 * specified and directed, built with coding agents rather than typed.
 * Both are true, and the group label is what keeps them true.
 *
 * Every group ends with "and more", which is accurate rather than
 * padding: the list is what he has shipped with, not the limit of what
 * he will use, and a tool he has not touched yet is a week's work
 * rather than a reason to lose the brief.
 *
 * `tint` colours the pills so the groups read as groups at a glance.
 * This is the third and last slide allowed the product washes, and it
 * earns them: five grey lists of names is the least legible slide in
 * the document, and colour is doing grouping work here rather than
 * decoration.
 */
export const TOOLSET = [
  {
    label: "Marketing & analytics",
    tint: "amber",
    note: "hands-on",
    items: [
      "Meta Ads Manager",
      "Google Ads",
      "LinkedIn Campaign Manager",
      "TikTok Ads Manager",
      "GA4",
      "Google Tag Manager",
      "HubSpot",
      "Mailchimp",
      "and more",
    ],
  },
  {
    label: "Platforms & CMS",
    tint: "olive",
    note: "hands-on",
    items: [
      "WordPress",
      "WooCommerce",
      "Shopify",
      "Squarespace",
      "Webflow",
      "Paddle",
      "RevenueCat",
      "and more",
    ],
  },
  {
    label: "Design & delivery",
    tint: "rust",
    note: "hands-on",
    items: [
      "Figma",
      "Affinity Designer",
      "Adobe Creative Suite",
      "Notion",
      "Airtable",
      "Linear",
      "Asana",
      "Slack",
      "and more",
    ],
  },
  {
    label: "AI & automation",
    tint: "lime",
    note: "hands-on",
    items: [
      "Claude",
      "Claude Code",
      "OpenAI Codex",
      "Gemini",
      "Vercel AI SDK",
      "Model Context Protocol",
      "Zapier",
      "Make",
      "n8n",
      "and more",
    ],
  },
  {
    label: "Product stacks",
    tint: "amber",
    note: "specified and directed, built with coding agents rather than hand-written",
    items: [
      "TypeScript",
      "React",
      "React Native",
      "Expo",
      "Next.js",
      "Astro",
      "Tailwind",
      "Supabase",
      "PostgreSQL",
      "Chrome MV3",
      "Vercel",
      "Git",
      "and more",
    ],
  },
] as const;

/** Slide 12. The only place the two readers get different sentences. */
export const CLOSE = {
  heading: "Let's work",
  tracks: [
    {
      label: "If you're hiring",
      body: "I am open to senior roles in marketing, brand, product and AI-native product building. The kind of brief that wants one person who can strategise, design and ship.",
    },
    {
      label: "If you need it built",
      body: "Consulting and project work through the studio: brand and go-to-market, campaigns and paid media, websites and e-commerce, and software taken from problem to App Store.",
    },
  ],
  signoff: "Either way, the first conversation is free.",
} as const;
