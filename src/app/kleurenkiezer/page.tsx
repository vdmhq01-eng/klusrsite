import type { Metadata } from "next";
import { products } from "@/lib/data";
import { KleurenkiezerFunnel } from "@/components/color/kleurenkiezer-funnel";

export const metadata: Metadata = {
  title: "Kleurenkiezer — kies eerst je kleur, dan je verf",
  description:
    "In drie simpele stappen naar de juiste verf: kies je kleur, kies je klus en wij mengen de verf exact op kleur. Voor 19:00 besteld, morgen in huis.",
  alternates: { canonical: "/kleurenkiezer" },
  openGraph: {
    title: "Kleurenkiezer — eerst je kleur, dan je verf | KLUSR",
    description:
      "Kies je kleur, kies je klus en bestel verf die wij exact op jouw kleur mengen.",
  },
};

export default function KleurenkiezerPage() {
  const colorProducts = products.filter((p) => p.colorMatchable === true);

  return <KleurenkiezerFunnel colorProducts={colorProducts} />;
}
