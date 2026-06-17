import type { Metadata } from "next";
import Link from "next/link";
import { Home, LifeBuoy, Palette, Wrench, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotFoundSearch } from "@/components/shared/not-found-search";
import { t } from "@/lib/i18n/server";
import type { MessageKey } from "@/lib/i18n/dictionaries";

export const metadata: Metadata = {
  title: "Pagina niet gevonden (404)",
  description:
    "Deze pagina bestaat niet (meer). Zoek hieronder verder of ga terug naar de KLUSR-homepagina — grote kans dat we vinden wat je zoekt.",
  // 404 geeft al een 404-status (niet indexeerbaar); expliciet noindex voor de zekerheid.
  robots: { index: false, follow: true },
};

const popular: { href: string; labelKey: MessageKey; icon: typeof Palette }[] = [
  { href: "/categorie/verf", labelKey: "notFound.popular.paint", icon: Palette },
  { href: "/kleurenkiezer", labelKey: "notFound.popular.colorPicker", icon: Sparkles },
  { href: "/categorie/gereedschap", labelKey: "notFound.popular.tools", icon: Wrench },
  { href: "/advies", labelKey: "notFound.popular.advice", icon: LifeBuoy },
];

export default function NotFound() {
  return (
    <div className="container-klusr flex flex-col items-center py-16 text-center sm:py-24">
      <p className="text-7xl font-black leading-none tracking-tight text-primary sm:text-8xl">{t("notFound.code")}</p>
      <h1 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">
        {t("notFound.title")}
      </h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        {t("notFound.text")}
      </p>

      <NotFoundSearch />

      <p className="mt-8 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {t("notFound.popular")}
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        {popular.map(({ href, labelKey, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
          >
            <Icon className="h-4 w-4 text-primary" />
            {t(labelKey)}
          </Link>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild size="lg">
          <Link href="/">
            <Home className="h-4 w-4" />
            {t("notFound.toHome")}
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/klantenservice">
            <LifeBuoy className="h-4 w-4" />
            {t("notFound.customerService")}
          </Link>
        </Button>
      </div>
    </div>
  );
}
