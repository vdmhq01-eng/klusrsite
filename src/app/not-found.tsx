import type { Metadata } from "next";
import Link from "next/link";
import { Home, LifeBuoy, Palette, Wrench, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotFoundSearch } from "@/components/shared/not-found-search";

export const metadata: Metadata = {
  title: "Pagina niet gevonden (404)",
  description:
    "Deze pagina bestaat niet (meer). Zoek hieronder verder of ga terug naar de KLUSR-homepagina — grote kans dat we vinden wat je zoekt.",
  // 404 geeft al een 404-status (niet indexeerbaar); expliciet noindex voor de zekerheid.
  robots: { index: false, follow: true },
};

const popular = [
  { href: "/categorie/verf", label: "Verf", icon: Palette },
  { href: "/kleurenkiezer", label: "Kleurenkiezer", icon: Sparkles },
  { href: "/categorie/gereedschap", label: "Gereedschap", icon: Wrench },
  { href: "/advies", label: "Klusadvies", icon: LifeBuoy },
];

export default function NotFound() {
  return (
    <div className="container-klusr flex flex-col items-center py-16 text-center sm:py-24">
      <p className="text-7xl font-black leading-none tracking-tight text-primary sm:text-8xl">404</p>
      <h1 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">
        Deze pagina konden we niet vinden
      </h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        De pagina is verplaatst of bestaat niet meer. Zoek hieronder verder — grote kans dat we
        vinden wat je zoekt.
      </p>

      <NotFoundSearch />

      <p className="mt-8 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Populair bij KLUSR
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        {popular.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
          >
            <Icon className="h-4 w-4 text-primary" />
            {label}
          </Link>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild size="lg">
          <Link href="/">
            <Home className="h-4 w-4" />
            Naar de homepagina
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/klantenservice">
            <LifeBuoy className="h-4 w-4" />
            Klantenservice
          </Link>
        </Button>
      </div>
    </div>
  );
}
