import type { Metadata } from "next";
import Link from "next/link";
import { Heart, GraduationCap, Users, ArrowRight, MapPin } from "lucide-react";
import { Breadcrumb } from "@/components/plp/breadcrumb";
import { Button } from "@/components/ui/button";
import { COMPANY } from "@/components/shared/legal-page";

export const metadata: Metadata = {
  title: "Werken bij KLUSR — vacatures & solliciteren",
  description:
    "Word onderdeel van KLUSR. Bekijk onze vacatures voor winkel, mengspecialisten en e-commerce, en solliciteer direct.",
  alternates: { canonical: "/werken-bij" },
};

const PERKS = [
  { icon: GraduationCap, title: "Leren van het vak", body: "Opleiding en kennis van ervaren (ex-)schilders en productspecialisten." },
  { icon: Heart, title: "Personeelskorting", body: "Aantrekkelijke korting op het hele assortiment, plus je eigen KLUSRPAS." },
  { icon: Users, title: "Hecht team", body: "Korte lijnen, een informele sfeer en ruimte om door te groeien." },
];

const VACANCIES = [
  {
    title: "Verkoopmedewerker (winkel)",
    location: "Diverse winkels",
    type: "Fulltime / parttime",
    body: "Jij helpt klussers aan het juiste advies en de juiste producten op de winkelvloer.",
  },
  {
    title: "Mengspecialist verf",
    location: "Nijverdal",
    type: "Fulltime",
    body: "Jij draait onze mengmachine en zorgt voor een exacte kleurmatch, elke keer weer.",
  },
  {
    title: "E-commerce medewerker",
    location: "Hoofdkantoor / hybride",
    type: "Fulltime",
    body: "Jij houdt de webshop scherp: content, assortiment en een soepele klantbeleving online.",
  },
];

export default function WerkenBijPage() {
  return (
    <div className="flex flex-col gap-12 pb-16 sm:gap-16">
      <div className="container-klusr">
        <Breadcrumb items={[{ label: "Werken bij KLUSR" }]} />
      </div>

      {/* Hero */}
      <section className="container-klusr">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
            Werken bij KLUSR
          </span>
          <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            Bouw mee aan de beste klusspecialist
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Bij KLUSR draait alles om vakmanschap en de klant écht verder helpen. Hou jij van
            aanpakken, advies geven en samen resultaat boeken? Dan zoeken we jou.
          </p>
        </div>
      </section>

      {/* Perks */}
      <section className="container-klusr">
        <div className="grid gap-4 sm:grid-cols-3">
          {PERKS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-6 w-6" />
              </span>
              <h2 className="mt-4 text-base font-bold">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Vacancies */}
      <section className="container-klusr">
        <h2 className="text-2xl font-extrabold tracking-tight">Openstaande vacatures</h2>
        <div className="mt-4 space-y-3">
          {VACANCIES.map((v) => (
            <div
              key={v.title}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-card sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h3 className="text-base font-bold">{v.title}</h3>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {v.location}
                  </span>
                  <span>· {v.type}</span>
                </p>
                <p className="mt-2 max-w-xl text-sm text-muted-foreground">{v.body}</p>
              </div>
              <Button asChild className="shrink-0">
                <a
                  href={`mailto:${COMPANY.email}?subject=${encodeURIComponent(
                    `Sollicitatie: ${v.title}`,
                  )}`}
                >
                  Solliciteer
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Open application */}
      <section className="container-klusr">
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-border bg-secondary/40 p-6 sm:flex-row sm:items-center sm:p-8">
          <div>
            <h2 className="text-lg font-bold">Geen passende vacature?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Stuur ons een open sollicitatie — we maken graag kennis.
            </p>
          </div>
          <Button asChild size="lg" variant="outline">
            <a href={`mailto:${COMPANY.email}?subject=Open%20sollicitatie`}>
              Open sollicitatie
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}
