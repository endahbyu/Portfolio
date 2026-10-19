// Placeholder projects for the Work gallery. Replace with real case studies (and `image`) later.
export type Project = {
  slug: string;
  title: string;
  category: string;
  year: string;
  image?: string;
};

export const projects: Project[] = [
  { slug: "kopi-kita", title: "Kopi Kita", category: "Mobile App", year: "2026" },
  { slug: "pasar-pagi", title: "Pasar Pagi", category: "E-commerce", year: "2026" },
  { slug: "nusa-health", title: "Nusa Health", category: "Product Design", year: "2025" },
  { slug: "ruang-belajar", title: "Ruang Belajar", category: "Web App", year: "2025" },
  { slug: "laju", title: "Laju", category: "Design System", year: "2025" },
  { slug: "teduh", title: "Teduh", category: "Branding", year: "2024" },
  { slug: "jejak", title: "Jejak", category: "Dashboard", year: "2024" },
  { slug: "sore", title: "Sore", category: "Exploration", year: "2024" },
];
