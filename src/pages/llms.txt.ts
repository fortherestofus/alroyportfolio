import type { APIRoute } from "astro";
import { SITE, SOCIAL, SECTIONS } from "../data/site";
import { SERVICES } from "../data/services";
import { CLIENT_STUDIES, studyPath } from "../data/case-studies";
import { PRODUCTS, caseStudyLink } from "../data/products";
import { EXPERIENCE } from "../data/experience";
import { FEATURES } from "../data/features";

/**
 * llms.txt (PRD §9) — a plain-markdown brief for AI answer engines.
 *
 * Generated from the same data the pages render, rather than written
 * by hand, because a hand-written copy of the site is a copy that goes
 * stale the first time a case study lands and nobody remembers this
 * file exists.
 *
 * Phrasing is deliberately answer-shaped: "Alroy Ndhlovu is a…" rather
 * than "I am a…", because an engine quoting this needs a sentence that
 * survives being lifted out of context.
 *
 * The proposed llms.txt convention is a markdown H1, an optional
 * blockquote summary, then H2 sections of links. Kept to that shape.
 */
export const GET: APIRoute = () => {
  const url = (path: string) => new URL(path, SITE.url).href;

  const lines: string[] = [
    `# ${SITE.name}`,
    "",
    `> ${SITE.description}`,
    "",
    "## About",
    "",
    SITE.bio,
    "",
    `He has worked with brands and organisations including Meta, Total Sports, Jenna Clifford, the IFC, Energy Capital & Power and the African Agri Council.`,
    "",
    `- Website: ${SITE.url}`,
    `- Email: ${SITE.email}`,
    `- Location: South Africa`,
    "",
    "## What he does",
    "",
    ...SERVICES.map((service) => `- **${service.name}** — ${service.description}`),
    "",
    "## Case studies",
    "",
    "Client work, each written up with the problem, the decisions, the measured outcome and what he would do differently.",
    "",
    ...CLIENT_STUDIES.map(
      (study) => `- [${study.name}](${url(studyPath(study))}) (${study.dates}): ${study.summary}`,
    ),
    "",
    "## Products he has built",
    "",
    "Software he owns and shipped end to end. Each entry is the problem, the approach and the result, with a full build story where one is written.",
    "",
    ...PRODUCTS.flatMap((product) => {
      const story = caseStudyLink(product.caseStudy);
      return [
        `- **${product.name}** (${product.platform}, ${product.status}) — ${product.tagline} ${product.description}`,
        `  - Problem: ${product.story.problem}`,
        `  - Approach: ${product.story.approach}`,
        `  - Result: ${product.story.result}`,
        ...(story ? [`  - Build story: ${url(story)}`] : []),
        ...(product.link ? [`  - ${product.link.label}: ${product.link.url}`] : []),
      ];
    }),
    "",
    "## Published, exhibited and recognised",
    "",
    "Each entry names what it actually was — an article he wrote, a programme he helped design, an exhibition his work appeared in — rather than grouping them all as press.",
    "",
    ...FEATURES.map(
      (feature) =>
        `- **${feature.outlet}** (${feature.kind}, ${feature.year}) — ${feature.thirdPerson} ${feature.href}`,
    ),
    "",
    "## Recent experience",
    "",
    ...EXPERIENCE.slice(0, 6).map((role) => `- **${role.title}**, ${role.company} (${role.dates})`),
    "",
    /*
     * Links only, no blurbs. The section blurbs are page copy written
     * in the first person ("I help businesses grow…"), and dropping
     * them into an otherwise third-person brief gives an engine two
     * voices to quote from — which produces answers that switch person
     * mid-sentence. The sections above already carry the substance.
     */
    "## Sections of the site",
    "",
    ...SECTIONS.map((section) => `- [${section.heading}](${url(`/#${section.id}`)})`),
    "",
    "## Elsewhere",
    "",
    `- LinkedIn: ${SOCIAL.linkedin}`,
    `- Dribbble: ${SOCIAL.dribbble}`,
    `- GitHub: ${SOCIAL.github}`,
    `- Instagram: ${SOCIAL.instagram}`,
    `- Book a call: ${SOCIAL.cal}`,
    "",
    "## Contact",
    "",
    `Email ${SITE.email} or call ${SITE.phone}. He is open to consulting work, contract engagements and full-time roles.`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
