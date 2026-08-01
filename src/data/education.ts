/**
 * Study, bundled into four themes. Source: prd/01-content.md, where the
 * grouping was already decided.
 */
export interface Study {
  qualification: string;
  institution: string;
  dates: string;
  logoFile?: string;
}

export interface StudyGroup {
  title: string;
  entries: Study[];
}

export const EDUCATION: StudyGroup[] = [
  {
    title: "Marketing & Product",
    entries: [
      {
        qualification: "Professional Certificate in Digital Marketing",
        institution: "University of Maryland (EdX)",
        dates: "Completed Jun 2025",
        logoFile: "um.png",
      },
      {
        qualification: "Professional Certificate in Product Management",
        institution: "University of Maryland (EdX)",
        dates: "Completed Dec 2025",
        logoFile: "um.png",
      },
      {
        qualification: "Digital Marketing",
        institution: "Shaw Academy, Meta, Google, LinkedIn and others",
        dates: "2019 – 2023",
        logoFile: "shaw.png",
      },
    ],
  },
  {
    title: "Design & Creative",
    entries: [
      {
        qualification: "UX/UI & Design",
        institution: "Interaction Design Foundation, UXCEL",
        dates: "2023 – 2024",
        logoFile: "idf.jpg",
      },
      {
        qualification: "Graphic Design Specialisation",
        institution: "CalArts (Coursera)",
        dates: "2016 – 2017",
        logoFile: "calarts.png",
      },
      {
        qualification: "Film & Photography Studies",
        institution: "Lights Film School, Photography Institute",
        dates: "2017 – 2018",
        logoFile: "PI.png",
      },
    ],
  },
  {
    title: "Tech, Cloud & Security",
    entries: [
      {
        qualification: "Cloud Computing & AI",
        institution: "Google Cloud, Codecademy",
        dates: "2024 – 2025",
        logoFile: "google-cloud.jpg",
      },
      {
        qualification: "AI & Cybersecurity Technology Certifications",
        institution: "Google, Codecademy, CISCO Networking Academy",
        dates: "2025 – Ongoing",
        logoFile: "cisco.png",
      },
      {
        qualification: "Full-Stack Web Development",
        institution: "App Brewery",
        dates: "2026 – Current",
        logoFile: "lablogo.png",
      },
    ],
  },
  {
    title: "Business",
    entries: [
      {
        qualification: "Tourism Management",
        institution: "Oxbridge Academy",
        dates: "2022 – 2023",
        logoFile: "oxbridge.png",
      },
    ],
  },
];
