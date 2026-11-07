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
    description: "Brand strategy, positioning, visual identity, art direction and content.",
  },
  {
    name: "Product",
    icon: "layout-grid",
    description:
      "Product management and UX/UI design for apps, SaaS, online stores and AI tools, from discovery to launch.",
  },
  {
    name: "Marketing",
    icon: "trending-up",
    description:
      "Digital marketing, paid media, CRM, email and go-to-market plans, measured on leads and growth.",
  },
];

/** Headline numbers shown in the proof row. */
export const STATS = [
  { value: "12+", label: "Years of experience" },
  { value: "1,200+", label: "People trained and advised" },
  { value: "25+", label: "Businesses served" },
] as const;
