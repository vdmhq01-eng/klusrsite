import type { Metadata } from "next";
import { products } from "@/lib/data";
import { KleurkiezerClient } from "@/components/color/kleurkiezer-client";

export const metadata: Metadata = {
  title: "Kleurkiezer — meng je verf op kleur",
  description:
    "Kies uit onze kleurcollecties of meng je eigen kleur en bekijk direct hoe deze op je muur staat. KLUSR mengt je verf exact op de gekozen kleur.",
  openGraph: {
    title: "Kleurkiezer — meng je verf op kleur | KLUSR",
    description:
      "Kies of meng je eigen kleur en bekijk het resultaat. Wij mengen je verf exact op de gekozen kleur.",
  },
};

export default function KleurkiezerPage() {
  const colorProducts = products.filter((p) => p.colorMatchable === true);

  return <KleurkiezerClient colorProducts={colorProducts} />;
}
