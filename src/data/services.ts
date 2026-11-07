/**
 * The three services, rendered as compact pills with a shared caption
 * line (PRD §6.01, design system "Service pills"). Each description is
 * one sentence, as 01-content.md asks.
 */
export type ServiceIcon = "layout-grid" | "trending-up" | "palette";

export interface Service {
  name: string;
  icon: ServiceIcon;
  description: string;
}

export const SERVICES: Service[] = [
  {
    name: "Brand",
    icon: "palette",
    description:
      "Positioning, identity and art direction, and the content that carries a brand across every touchpoint.",
  },
  {
    name: "Product",
    icon: "layout-grid",
    description:
      "Apps, SaaS, online stores and AI tools taken from problem to shipped and then run: discovery, UX/UI, build, automation and the roadmap.",
  },
  {
    name: "Marketing",
    icon: "trending-up",
    description:
      "Campaigns, paid media and go-to-market plans built on audience insight and performance data, tuned for measurable growth.",
  },
];

/** Headline numbers shown in the proof row. */
export const STATS = [
  { value: "12+", label: "Years of experience" },
  { value: "1,200+", label: "People and businesses trained and advised" },
] as const;
