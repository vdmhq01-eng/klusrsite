"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useLocale } from "./locale-provider";
import { type Locale } from "@/lib/i18n/config";
import {
  COUNTRY_COOKIE,
  COUNTRY_SUGGEST_COOKIE,
  isShippingCountry,
} from "@/lib/shipping";

/** Lees een cookie client-side; null als afwezig. */
function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : null;
}

function writeCookie(name: string, value: string, maxAgeSec: number) {
  document.cookie = `${name}=${value}; path=/; max-age=${maxAgeSec}; samesite=lax`;
}

/** ISO-landcode → vlag-emoji (regional indicator symbols). */
function flagEmoji(code: string): string {
  return code
    .toUpperCase()
    .replace(/[A-Z]/g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

/** Korte, zelfstandige vertalingen voor het bannertje (los van de UI-catalogus). */
const COPY: Record<
  Locale,
  { text: (country: string) => string; confirm: string; dismiss: string }
> = {
  nl: {
    text: (c) =>
      `We bezorgen naar ${c}. Verzendkosten en betaalmethoden zijn hierop afgestemd.`,
    confirm: "Klopt",
    dismiss: "Sluiten",
  },
  en: {
    text: (c) =>
      `We ship to ${c}. Shipping costs and payment methods are set accordingly.`,
    confirm: "Correct",
    dismiss: "Close",
  },
  fr: {
    text: (c) =>
      `Nous livrons vers ${c}. Les frais de livraison et moyens de paiement sont adaptés.`,
    confirm: "C’est exact",
    dismiss: "Fermer",
  },
  de: {
    text: (c) =>
      `Wir liefern nach ${c}. Versandkosten und Zahlarten sind entsprechend angepasst.`,
    confirm: "Stimmt",
    dismiss: "Schließen",
  },
  pl: {
    text: (c) =>
      `Wysyłamy do ${c}. Koszty wysyłki i metody płatności są odpowiednio dopasowane.`,
    confirm: "Zgadza się",
    dismiss: "Zamknij",
  },
};

/**
 * Niet-opdringerig bezorgland-voorstel (H&M-stijl). De middleware zet op basis
 * van het IP-land een `country-suggest`-cookie wanneer een bezoeker uit een
 * ander verzendland dan NL komt. Deze banner leest die cookie en laat de klant
 * het bevestigen of wegklikken — NOOIT een harde redirect. De checkout gebruikt
 * hetzelfde voorstel al als slimme standaard, dus verzendkosten en
 * betaalmethoden kloppen sowieso.
 */
export function CountrySuggestBanner() {
  const locale = useLocale();
  const [country, setCountry] = useState<string | null>(null);

  useEffect(() => {
    // Toon alleen als er een geo-voorstel is én nog geen bevestigde keuze.
    if (readCookie(COUNTRY_COOKIE)) return;
    const suggested = readCookie(COUNTRY_SUGGEST_COOKIE);
    if (suggested && isShippingCountry(suggested)) {
      setCountry(suggested.toUpperCase());
    }
  }, []);

  if (!country) return null;
  const cc = country;
  const copy = COPY[locale] ?? COPY.nl;

  let name = cc;
  try {
    name = new Intl.DisplayNames([locale], { type: "region" }).of(cc) ?? cc;
  } catch {
    // Intl niet beschikbaar → val terug op de landcode.
  }
  const label = `${flagEmoji(cc)} ${name}`;

  function confirm() {
    // Bevestig het land → onthoud 1 jaar, stop het voorstel.
    writeCookie(COUNTRY_COOKIE, cc, 60 * 60 * 24 * 365);
    writeCookie(COUNTRY_SUGGEST_COOKIE, "", 0);
    setCountry(null);
  }

  function dismiss() {
    // Wegklikken = expliciet bij NL blijven; stopt het voorstel.
    writeCookie(COUNTRY_COOKIE, "NL", 60 * 60 * 24 * 365);
    writeCookie(COUNTRY_SUGGEST_COOKIE, "", 0);
    setCountry(null);
  }

  return (
    <div className="border-b border-border bg-secondary/60">
      <div className="container-klusr flex items-center justify-between gap-3 py-2 text-sm">
        <p className="min-w-0">{copy.text(label)}</p>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={confirm}
            className="rounded-md bg-primary px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-primary/90"
          >
            {copy.confirm}
          </button>
          <button
            type="button"
            onClick={dismiss}
            aria-label={copy.dismiss}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
