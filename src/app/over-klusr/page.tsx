import type { Metadata } from "next";
import Link from "next/link";
import { Paintbrush, Sparkles, ShieldCheck, MapPin, ArrowRight } from "lucide-react";
import { Breadcrumb } from "@/components/plp/breadcrumb";
import { Button } from "@/components/ui/button";
import { stores } from "@/lib/data/stores";

export const metadata: Metadata = {
  title: "Over KLUSR — de beste verf en alles voor de klus",
  description:
    "KLUSR is dé klusspecialist met advies van ex-schilders, professionele kwaliteit en de scherpste KLUSRPAS-prijs. Lees ons verhaal.",
  alternates: { canonical: "/over-klusr" },
};

const VALUES = [
  {
    icon: Sparkles,
    title: "Advies van ex-schilders",
    body: "Onze mensen hebben zelf jarenlang met de kwast gestaan. Dat advies krijg jij er gratis bij.",
  },
  {
    icon: Paintbrush,
    title: "Elke kleur, exact gemengd",
    body: "Duizenden kleuren uit alle bekende waaiers — professioneel op kleur gemengd, klaar voor gebruik.",
  },
  {
    icon: ShieldCheck,
    title: "Professionele kwaliteit",
    body: "Topmerken, scherp geprijsd, en met de gratis KLUSRPAS altijd het meeste voordeel op je hele klus.",
  },
];

export default function OverKlusrPage() {
  return (
    <div className="flex flex-col gap-12 pb-16 sm:gap-16">
      <div className="container-klusr">
        <Breadcrumb items={[{ label: "Over KLUSR" }]} />
      </div>

      {/* Hero */}
      <section className="container-klusr">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
            Over KLUSR
          </span>
          <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            De beste verf en alles wat je <span className="text-primary">nú</span> nodig hebt voor
            de klus
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            KLUSR is ontstaan uit een simpele frustratie: te vaak liep je de bouwmarkt uit met de
            verkeerde verf en zonder goed advies. Dat kan beter. Bij KLUSR krijg je
            professionele kwaliteit, de scherpste prijs én advies van mensen die het vak echt
            kennen — ex-schilders.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="container-klusr">
        <div className="grid gap-4 sm:grid-cols-3">
          {VALUES.map(({ icon: Icon, title, body }) => (
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

      {/* Story */}
      <section className="container-klusr">
        <div className="grid gap-8 rounded-2xl border border-border bg-card p-6 shadow-card sm:p-10 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">Ons verhaal</h2>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                Wat begon als één winkel met een mengmachine en een hoop kennis, groeide uit tot
                een keten van klusspecialisten in Overijssel en daarbuiten. De rode draad bleef
                hetzelfde: het beste advies en de juiste materialen, voor zowel de doe-het-zelver
                als de vakman.
              </p>
              <p>
                Vandaag combineren we die winkelervaring met een complete webshop. Online de
                scherpste KLUSRPAS-prijs en je kleur exact gemengd, in de winkel het persoonlijke
                advies. Het beste van twee werelden.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 self-center">
            {["#C90000", "#1F3A5F", "#E0A500", "#5B7553", "#F4F1E8", "#2E2E2E"].map((hex) => (
              <span
                key={hex}
                className="aspect-square rounded-xl border border-black/10 shadow-sm"
                style={{ backgroundColor: hex }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Stores */}
      <section className="container-klusr">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-extrabold tracking-tight">Onze winkels</h2>
          <Button asChild variant="outline">
            <Link href="/winkels">
              Alle winkels
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {stores.map((s) => (
            <Link
              key={s.id}
              href={`/winkels/${s.slug}`}
              className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                <MapPin className="h-5 w-5" />
              </span>
              <span className="font-semibold">{s.city}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-klusr">
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-gradient-to-br from-primary to-klusr-red-dark p-6 text-white sm:flex-row sm:items-center sm:p-8">
          <div>
            <h2 className="text-xl font-black sm:text-2xl">Aan de slag?</h2>
            <p className="mt-1 text-sm text-white/90">
              Vraag gratis je KLUSRPAS aan en pak meteen voordeel.
            </p>
          </div>
          <Button asChild size="lg" variant="secondary">
            <Link href="/kluspas">Meer over KLUSRPAS</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
