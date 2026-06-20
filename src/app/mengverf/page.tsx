import type { Metadata } from "next";
import Link from "next/link";
import { Palette, Truck, Check, ArrowRight, Droplet } from "lucide-react";
import { Breadcrumb } from "@/components/plp/breadcrumb";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Mengverf — elke kleur exact gemengd | KLUSR",
  description:
    "Kies uit duizenden kleuren (Gamma, Sikkens, RAL, AkzoNobel) en wij mengen je verf professioneel op de exacte kleur. Klaar voor gebruik, met advies van ex-schilders.",
  alternates: { canonical: "/mengverf" },
};

const SWATCHES = [
  "#F4F1E8", "#C2402E", "#1F3A5F", "#5B7553", "#E0A500", "#7A4E2D",
  "#2E2E2E", "#8FA3AD", "#C99A2E", "#D8C7A8", "#3A6B6B", "#9A1B2F",
];

const STEPS = [
  {
    icon: Palette,
    title: "1. Kies je kleur",
    body: "Zoek in onze kleurkiezer uit duizenden kleuren, of geef je eigen RAL- of NCS-code door.",
  },
  {
    icon: Droplet,
    title: "2. Wij mengen",
    body: "Onze mengmachine doseert de exacte kleur in de juiste basis — professioneel en reproduceerbaar.",
  },
  {
    icon: Truck,
    title: "3. Klaar voor gebruik",
    body: "Thuisbezorgd door heel Nederland. Dezelfde kleur later weer nodig? Wij onthouden je recept.",
  },
];

const COLLECTIONS = [
  "Gamma", "Sikkens", "RAL Classic", "RAL Design", "AkzoNobel",
  "Flexa", "Histor", "Wijzonol", "Sigma", "Kleurenwaaier",
];

const USPS = [
  "Élke kleur mogelijk — ook jouw eigen tint",
  "Exacte kleurmatch, reproduceerbaar recept",
  "Professioneel gemengd in de juiste basis",
  "Advies van onze ex-schilders",
];

export default function MengverfPage() {
  return (
    <div className="flex flex-col gap-10 pb-14 sm:gap-14">
      <div className="container-klusr">
        <Breadcrumb items={[{ label: "Mengverf" }]} />
      </div>

      {/* Hero */}
      <section className="container-klusr">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <div className="grid gap-6 p-6 sm:p-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
                <Palette className="h-3.5 w-3.5" />
                Mengverf
              </span>
              <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                Elke kleur,{" "}
                <span className="text-primary">exact gemengd</span>
              </h1>
              <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
                Kies uit duizenden kleuren — Gamma, Sikkens, RAL en AkzoNobel. Wij
                mengen je verf professioneel op de exacte kleur, klaar voor gebruik.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/kleurkiezer">
                    <Palette className="h-5 w-5" />
                    Kies je kleur
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/categorie/verf">Bekijk verf</Link>
                </Button>
              </div>
            </div>

            {/* Swatch wall */}
            <div className="grid grid-cols-6 gap-2 sm:gap-3">
              {SWATCHES.map((hex, i) => (
                <span
                  key={i}
                  className="aspect-square rounded-lg border border-black/10 shadow-sm"
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* USP strip */}
      <section className="container-klusr">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {USPS.map((u) => (
            <li
              key={u}
              className="flex items-start gap-2 rounded-xl border border-border bg-card p-4 text-sm font-medium shadow-card"
            >
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-klusr-stock" strokeWidth={3} />
              {u}
            </li>
          ))}
        </ul>
      </section>

      {/* How it works */}
      <section className="container-klusr">
        <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          Zo werkt mengverf
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          In drie stappen van kleur naar kwast — met deskundig advies van onze ex-schilders.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-3 text-base font-bold">{title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Collections */}
      <section className="container-klusr">
        <div className="rounded-2xl border border-border bg-secondary/40 p-6 sm:p-8">
          <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
            Alle bekende kleurwaaiers
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            We mengen op basis van de grote merkenwaaiers én jouw eigen kleur.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {COLLECTIONS.map((c) => (
              <span
                key={c}
                className="rounded-full border border-border bg-card px-3.5 py-2 text-sm font-semibold"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="container-klusr">
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-border bg-gradient-to-br from-primary to-klusr-red-dark p-6 text-white sm:flex-row sm:items-center sm:p-8">
          <div>
            <h2 className="text-xl font-black sm:text-2xl">Klaar om te mengen?</h2>
            <p className="mt-1 text-sm text-white/90">
              Kies je kleur online en wij bezorgen je verf klaar voor gebruik.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link href="/kleurkiezer">
                Kies je kleur
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/categorie/verf">Bekijk verf</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
