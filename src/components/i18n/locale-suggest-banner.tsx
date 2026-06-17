"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { X } from "lucide-react";
import {
  LOCALE_LABELS,
  LOCALE_SUGGEST_COOKIE,
  i18nEnabled,
  isLocale,
  type Locale,
} from "@/lib/i18n/config";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { translate } from "@/lib/i18n/interpolate";
import { localizedPath } from "./language-switcher";

/** Lees een cookie client-side; null als afwezig. */
function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : null;
}

/** Verwijder de suggest-cookie (verloopt direct). */
function clearSuggestCookie() {
  document.cookie = `${LOCALE_SUGGEST_COOKIE}=; path=/; max-age=0; samesite=lax`;
}

/**
 * Slim, niet-opdringerig taalvoorstel. De middleware zet (op basis van geo +
 * accept-language) een `locale-suggest`-cookie wanneer een bezoeker mogelijk
 * een andere taal wil dan NL. Deze banner leest die cookie en biedt de switch
 * aan — NOOIT een harde redirect. Dismiss wist de cookie.
 *
 * Rendert niets als de flag uit staat → geen wijziging voor de huidige site.
 */
export function LocaleSuggestBanner() {
  const pathname = usePathname();
  const [suggested, setSuggested] = useState<Locale | null>(null);

  // Pas na mount lezen (cookie is client-side) → geen SSR/hydration-mismatch:
  // server rendert altijd niets, client vult eventueel aan.
  useEffect(() => {
    if (!i18nEnabled()) return;
    const value = readCookie(LOCALE_SUGGEST_COOKIE);
    if (isLocale(value)) setSuggested(value);
  }, []);

  if (!i18nEnabled() || !suggested) return null;

  const messages = dictionaries[suggested];
  const text = translate(messages, "lang.continueIn", {
    language: LOCALE_LABELS[suggested],
  });
  const dismissLabel = translate(messages, "lang.dismiss");
  const target = localizedPath(pathname || "/", suggested);

  function dismiss() {
    clearSuggestCookie();
    setSuggested(null);
  }

  return (
    <div className="border-b border-border bg-secondary/60">
      <div className="container-klusr flex items-center justify-between gap-3 py-2 text-sm">
        <Link
          href={target}
          onClick={() => clearSuggestCookie()}
          className="font-semibold text-primary hover:underline"
        >
          {text}
        </Link>
        <button
          type="button"
          onClick={dismiss}
          aria-label={dismissLabel}
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
