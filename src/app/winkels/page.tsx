import type { Metadata } from "next";
import { TopicImage } from "@/components/shared/topic-image";
import Link from "next/link";
import { ArrowRight, Clock, MapPin } from "lucide-react";
import { stores } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Onze winkels",
  description:
    "KLUSR groeit door heel Oost-Nederland. Bezoek ons eerste filiaal in Nijverdal of ontdek waar binnenkort een KLUSR-winkel bij jou in de buurt opent.",
  openGraph: {
    title: "Onze winkels | KLUSR",
    description:
      "Bezoek ons eerste filiaal in Nijverdal of ontdek waar binnenkort een KLUSR-winkel opent.",
  },
};

/** Pick a representative opening line: prefer Saturday-ish weekday summary. */
function openingSummary(store: (typeof stores)[number]): string {
  const first = store.openingHours.find((h) => h.hours !== "Gesloten");
  return first ? `${first.day} v.a. ${first.hours.split(" - ")[0]}` : "Op afspraak";
}

export default function WinkelsPage() {
  return (
    <div className="flex flex-col gap-12 py-8 sm:gap-16">
      {/* Hero */}
      <section className="container-klusr">
        <p className="text-sm font-bold uppercase tracking-wide text-primary">
          Onze winkels
        </p>
        <h1 className="mt-2 max-w-3xl text-3xl font-black tracking-tight text-balance sm:text-4xl lg:text-5xl">
          KLUSR bij jou in de buurt
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
          We zijn begonnen in Nijverdal — ons eerste filiaal en het kloppende
          hart van KLUSR. De komende tijd openen we nieuwe winkels door heel
          Oost-Nederland. Kom langs voor verf op kleur, deskundig kleuradvies en
          alles voor jouw klus.
        </p>
      </section>

      {/* Map placeholder */}
      <section className="container-klusr">
        <div className="overflow-hidden rounded-2xl border border-border bg-klusr-black text-white">
          <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-5">
            {stores.map((store) => (
              <Link
                key={store.id}
                href={`/winkels/${store.slug}`}
                className="group relative flex flex-col gap-1 bg-klusr-black p-5 transition-colors hover:bg-white/5"
              >
                <span className="inline-flex items-center gap-1.5 text-sm font-bold">
                  <MapPin className="h-4 w-4 text-primary" />
                  {store.city}
                </span>
                <span className="text-xs text-white/60">
                  {store.isFlagship ? "Eerste filiaal" : "Binnenkort open"}
                </span>
              </Link>
            ))}
          </div>
          <p className="border-t border-white/10 px-5 py-3 text-center text-xs text-white/50">
            5 winkels in heel Oost-Nederland — en we blijven groeien.
          </p>
        </div>
      </section>

      {/* Store grid */}
      <section className="container-klusr">
        <h2 className="mb-5 text-xl font-extrabold tracking-tight sm:text-2xl">
          Alle filialen
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) => (
            <Link
              key={store.id}
              href={`/winkels/${store.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-card transition-shadow hover:shadow-card-hover"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <TopicImage seed={store.slug} keywords="hardware,store,shop" />
                <Badge
                  variant={store.isFlagship ? "default" : "action"}
                  className="absolute left-3 top-3"
                >
                  {store.isFlagship ? "Eerste filiaal" : "Binnenkort open"}
                </Badge>
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <h3 className="font-bold leading-tight group-hover:text-primary">
                  {store.name}
                </h3>
                <p className="inline-flex items-start gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    {store.address}, {store.postalCode} {store.city}
                  </span>
                </p>
                <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 shrink-0" />
                  {openingSummary(store)}
                </p>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-semibold text-primary">
                  Bekijk winkel
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-klusr">
        <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-card sm:p-10">
          <h2 className="text-2xl font-black sm:text-3xl">Plan je bezoek</h2>
          <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
            Kom langs in ons filiaal in Nijverdal voor verf op kleur, gratis
            kleuradvies van onze ex-schilders en het complete assortiment om
            direct mee te nemen.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/winkels/nijverdal">
                Bekijk Nijverdal
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/categorie/verf">Bekijk het assortiment</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
