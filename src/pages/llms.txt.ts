import type { APIRoute } from "astro";
import { SITE, SOCIAL, SECTIONS } from "../data/site";
import { SERVICES } from "../data/services";
import { CASE_STUDIES } from "../data/case-studies";
import { PRODUCTS } from "../data/products";
import { EXPERIENCE } from "../data/experience";

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
    `Alroy Ndhlovu is a full-stack digital marketing, branding, business technology and product consultant based in South Africa, with over ten years of experience. He works across strategy, brand, paid media, content, and the design and engineering of software products — and ships the products himself rather than only advising on them.`,
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
    "Full write-ups, each with the problem, the decisions, the measured outcome and what he would do differently.",
    "",
    ...CASE_STUDIES.map(
      (study) =>
        `- [${study.name}](${url(`/case-studies/${study.slug}/`)}) (${study.dates}): ${study.summary}`,
    ),
    "",
    "## Products he has built",
    "",
    ...PRODUCTS.map(
      (product) =>
        `- **${product.name}** (${product.platform}, ${product.status}) — ${product.tagline} ${product.description}`,
    ),
    "",
    "## Recent experience",
    "",
    ...EXPERIENCE.slice(0, 6).map((role) => `- **${role.title}**, ${role.company} (${role.dates})`),
    "",
    "## Sections of the site",
    "",
    ...SECTIONS.map(
      (section) => `- [${section.heading}](${url(`/#${section.id}`)}): ${section.blurb}`,
    ),
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
