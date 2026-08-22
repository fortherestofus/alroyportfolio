/**
 * The four services, rendered as compact pills with a shared caption
 * line (PRD §6.01, design system "Service pills"). Each description is
 * one sentence, as 01-content.md asks.
 */
export type ServiceIcon = "layout-grid" | "bot" | "trending-up" | "palette";

export interface Service {
  name: string;
  icon: ServiceIcon;
  description: string;
}

export const SERVICES: Service[] = [
  {
    name: "Product Development",
    icon: "layout-grid",
    description:
      "Apps and SaaS taken from problem to shipped product: discovery, UX/UI, build and the roadmap that follows.",
  },
  {
    name: "Business Tech Solutions",
    icon: "bot",
    description:
      "Automation, AI and eCommerce systems that cut manual work, streamline operations and scale with the business.",
  },
  {
    name: "Marketing & Strategy",
    icon: "trending-up",
    description:
      "Campaigns and go-to-market plans built on audience insight and performance data, tuned for measurable growth.",
  },
  {
    name: "Branding",
    icon: "palette",
    description:
      "Product and corporate identity: positioning, visual systems and the content that carries them across every touchpoint.",
  },
];

/** Headline numbers shown in the proof row. */
export const STATS = [
  { value: "12+", label: "Years of experience" },
  { value: "1,200+", label: "Projects and clients served" },
] as const;
