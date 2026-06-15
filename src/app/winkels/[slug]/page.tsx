import type { Metadata } from "next";
import { TopicImage } from "@/components/shared/topic-image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  ChevronRight,
  Clock,
  Mail,
  MapPin,
  Palette,
  PackageCheck,
  Phone,
  Star,
  Users,
} from "lucide-react";
import { stores, getStore } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface StorePageProps {
  params: { slug: string };
}

const services = [
  {
    icon: Palette,
    title: "Verf op kleur gemengd",
    description: "Iedere kleur die je wenst, vakkundig op maat gemengd.",
  },
  {
    icon: Star,
    title: "Gratis kleuradvies",
    description: "Persoonlijk advies van onze ervaren kleurspecialisten.",
  },
  {
    icon: PackageCheck,
    title: "Online bestelling afhalen",
    description: "Bestel online en haal je klus snel op in de winkel.",
  },
  {
    icon: Users,
    title: "Advies van ex-schilders",
    description: "Praktische tips van mensen die het vak echt kennen.",
  },
];

export function generateStaticParams() {
  return stores.map((store) => ({ slug: store.slug }));
}

export function generateMetadata({ params }: StorePageProps): Metadata {
  const store = getStore(params.slug);
  if (!store) {
    return { title: "Winkel niet gevonden" };
  }
  return {
    title: `${store.name} — ${store.city}`,
    description: `Bezoek ${store.name} aan de ${store.address} in ${store.city}. Verf op kleur, gratis kleuradvies en alles voor jouw klus. Bekijk openingstijden en contactgegevens.`,
    openGraph: {
      title: `${store.name} | KLUSR`,
      description: `Bezoek ${store.name} in ${store.city}. Verf op kleur, kleuradvies en alles voor jouw klus.`,
      images: [{ url: store.image }],
    },
  };
}

export default function StorePage({ params }: StorePageProps) {
  const store = getStore(params.slug);
  if (!store) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: store.name,
    image: store.image,
    telephone: store.phone,
    email: store.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: store.address,
      postalCode: store.postalCode,
      addressLocality: store.city,
      addressCountry: "NL",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: store.lat,
      longitude: store.lng,
    },
    openingHoursSpecification: store.openingHours
      .filter((h) => h.hours !== "Gesloten")
      .map((h) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: h.day,
        opens: h.hours.split(" - ")[0],
        closes: h.hours.split(" - ")[1],
      })),
  };

  return (
    <div className="py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container-klusr">
        {/* Breadcrumb */}
        <nav
          aria-label="Kruimelpad"
          className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground"
        >
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          <Link href="/winkels" className="hover:text-primary">
            Winkels
          </Link>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          <span className="text-foreground">{store.city}</span>
        </nav>

        {/* Hero image */}
        <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-2xl sm:aspect-[21/9]">
          <TopicImage seed={store.slug} keywords="hardware,store,shop" />
          <div className="absolute inset-0 bg-gradient-to-t from-klusr-black/70 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 text-white sm:p-8">
            <Badge
              variant={store.isFlagship ? "default" : "action"}
              className="mb-3"
            >
              {store.isFlagship ? "Eerste filiaal" : "Binnenkort open"}
            </Badge>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              {store.name}
            </h1>
            {store.opening && (
              <p className="mt-1 text-sm font-medium text-white/80">
                {store.opening}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="container-klusr mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
        {/* Main content */}
        <div className="flex flex-col gap-10">
          {store.isFlagship && (
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
              <div className="flex items-start gap-3">
                <Star
                  className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                  fill="currentColor"
                />
                <div>
                  <h2 className="font-bold">Ons allereerste filiaal</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {store.city} is waar KLUSR begon. Hier vind je het complete
                    assortiment, de meng-installatie voor verf op kleur en het
                    grootste team kleurspecialisten.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Wat kun je hier */}
          <section>
            <h2 className="mb-5 text-xl font-extrabold tracking-tight sm:text-2xl">
              Wat kun je hier
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {services.map((service) => (
                <div
                  key={service.title}
                  className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 shadow-card"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <service.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-semibold">{service.title}</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {service.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Opening hours */}
          <section>
            <h2 className="mb-5 inline-flex items-center gap-2 text-xl font-extrabold tracking-tight sm:text-2xl">
              <Clock className="h-5 w-5 text-primary" />
              Openingstijden
            </h2>
            <div className="overflow-hidden rounded-lg border border-border bg-card shadow-card">
              <table className="w-full text-sm">
                <tbody>
                  {store.openingHours.map((entry, index) => {
                    const closed = entry.hours === "Gesloten";
                    return (
                      <tr
                        key={entry.day}
                        className={index > 0 ? "border-t border-border" : ""}
                      >
                        <th
                          scope="row"
                          className="px-4 py-3 text-left font-medium text-foreground"
                        >
                          {entry.day}
                        </th>
                        <td
                          className={
                            "px-4 py-3 text-right " +
                            (closed
                              ? "text-muted-foreground"
                              : "font-medium text-foreground")
                          }
                        >
                          {entry.hours}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Sidebar: contact */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-lg font-bold">Contact & adres</h2>
            <address className="mt-4 flex flex-col gap-4 not-italic text-sm">
              <span className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <span>
                  {store.address}
                  <br />
                  {store.postalCode} {store.city}
                </span>
              </span>
              <a
                href={`tel:${store.phone.replace(/[\s-]/g, "")}`}
                className="flex items-center gap-3 hover:text-primary"
              >
                <Phone className="h-5 w-5 shrink-0 text-primary" />
                {store.phone}
              </a>
              <a
                href={`mailto:${store.email}`}
                className="flex items-center gap-3 break-all hover:text-primary"
              >
                <Mail className="h-5 w-5 shrink-0 text-primary" />
                {store.email}
              </a>
            </address>
            <Button asChild size="lg" className="mt-6 w-full">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${store.lat},${store.lng}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Plan je route
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </aside>
      </div>

      {/* Footer links */}
      <div className="container-klusr mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-8">
        <Link
          href="/winkels"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          <ChevronRight className="h-4 w-4 rotate-180" />
          Terug naar alle winkels
        </Link>
        <Button asChild variant="outline">
          <Link href="/categorie/verf">Bekijk het assortiment</Link>
        </Button>
      </div>
    </div>
  );
}
