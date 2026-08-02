/**
 * The five services, rendered as compact pills with a shared caption
 * line (PRD §6.01, design system "Service pills"). Descriptions are the
 * long-form copy in 01-content.md tightened to one sentence each, as
 * that doc asks.
 */
export type ServiceIcon = "trending-up" | "pen-tool" | "palette" | "presentation" | "bot";

export interface Service {
  name: string;
  icon: ServiceIcon;
  description: string;
}

export const SERVICES: Service[] = [
  {
    name: "Data-Driven Digital Marketing",
    icon: "trending-up",
    description:
      "Campaigns built on audience insight and performance data, tuned for measurable growth and conversion.",
  },
  {
    name: "Content Development",
    icon: "pen-tool",
    description:
      "Strategic messaging and storytelling grounded in consumer psychology, with technology cutting production cost.",
  },
  {
    name: "Design & Branding",
    icon: "palette",
    description:
      "Cohesive visual identities and user experiences, from corporate materials to websites and landing pages.",
  },
  {
    name: "Corporate Training & Workshops",
    icon: "presentation",
    description:
      "Customised programmes giving teams hands-on knowledge in marketing, content, branding and business technology.",
  },
  {
    name: "Business Tech, Automation & AI",
    icon: "bot",
    description:
      "eCommerce optimisation, SaaS, AI and automation: scalable systems that streamline operations and drive growth.",
  },
];

/** Headline numbers shown in the proof row. */
export const STATS = [
  { value: "12+", label: "Years of experience" },
  { value: "1,200+", label: "Projects and clients served" },
] as const;
