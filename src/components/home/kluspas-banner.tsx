import Link from "next/link";
import { Check, CreditCard, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const benefits = [
  "Altijd de scherpste KLUSRPAS-prijs",
  "Exclusieve acties en voorrang bij uitverkoop",
  "Gratis kleuradvies in de winkel",
  "Spaar voor klustegoed",
];

export function KluspasBanner() {
  return (
    <section className="container-klusr">
      <div className="overflow-hidden rounded-2xl bg-klusr-black text-white">
        <div className="grid items-center gap-6 p-6 sm:p-10 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-bold">
              <CreditCard className="h-3.5 w-3.5" />
              KLUSPAS
            </span>
            <h2 className="mt-4 text-2xl font-black sm:text-3xl">
              Word lid en betaal altijd de laagste prijs
            </h2>
            <p className="mt-2 text-white/70">
              Met de gratis KLUSRPAS profiteer je direct van KLUSRPAS-prijzen op het hele
              assortiment en mis je geen enkele actie.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/kluspas">
                  Vraag je KLUSRPAS aan
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {benefits.map((b) => (
              <li
                key={b}
                className="flex items-start gap-2 rounded-lg bg-white/5 p-3 text-sm"
              >
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-klusr-stock" strokeWidth={3} />
                {b}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
