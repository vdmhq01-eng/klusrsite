"use client";

import { useRouter, usePathname } from "next/navigation";
import { Check, Globe } from "lucide-react";
import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_COOKIE,
  LOCALE_LABELS,
  LOCALE_SHORT_LABELS,
  i18nEnabled,
  localePrefix,
  type Locale,
} from "@/lib/i18n/config";
import { useLocale } from "./locale-provider";
import { cn } from "@/lib/utils";

/**
 * Verwijder een bestaande locale-prefix van een pad → het "kale" NL-pad.
 * "/en/categorie/verf" => "/categorie/verf"; "/de" => "/".
 */
function stripLocalePrefix(pathname: string): string {
  for (const locale of LOCALES) {
    if (locale === DEFAULT_LOCALE) continue;
    if (pathname === `/${locale}`) return "/";
    if (pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(`/${locale}`.length);
    }
  }
  return pathname || "/";
}

/** Bouw het doel-pad voor een locale vanaf het huidige pad. */
export function localizedPath(pathname: string, target: Locale): string {
  const base = stripLocalePrefix(pathname);
  const prefix = localePrefix(target);
  if (base === "/") return prefix || "/";
  return `${prefix}${base}`;
}

/** Zet de locale-cookie (1 jaar) zodat de keuze onthouden wordt. */
function persistLocale(locale: Locale) {
  // Niet HttpOnly: bewust client-leesbaar; de server leest 'm ook (getLocale).
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

/**
 * Compacte taalschakelaar (knoppen). Navigeert naar hetzelfde pad met de nieuwe
 * prefix en onthoudt de keuze in een cookie. Rendert NIETS als de feature-flag
 * uit staat — dus geen visuele wijziging voor de huidige NL-site.
 *
 * `variant`: "dark" (default) voor donkere achtergronden (topbar, footer),
 * "light" voor lichte achtergronden (mobiel menu). `afterSwitch` wordt na een
 * keuze aangeroepen — handig om bv. het mobiele menu te sluiten.
 */
export function LanguageSwitcher({
  className,
  variant = "dark",
  afterSwitch,
}: {
  className?: string;
  variant?: "dark" | "light";
  afterSwitch?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const current = useLocale();

  if (!i18nEnabled()) return null;

  function switchTo(target: Locale) {
    if (target === current) {
      afterSwitch?.();
      return;
    }
    persistLocale(target);
    router.push(localizedPath(pathname || "/", target));
    router.refresh();
    afterSwitch?.();
  }

  const dark = variant === "dark";

  return (
    <div
      className={cn("flex items-center gap-1.5", className)}
      role="group"
      aria-label={LOCALE_LABELS[current]}
    >
      <Globe
        className={cn(
          "h-4 w-4 shrink-0",
          dark ? "text-white/50" : "text-muted-foreground",
        )}
        aria-hidden="true"
      />
      <div className="flex flex-wrap items-center gap-1">
        {LOCALES.map((locale) => {
          const active = locale === current;
          return (
            <button
              key={locale}
              type="button"
              onClick={() => switchTo(locale)}
              aria-current={active ? "true" : undefined}
              title={LOCALE_LABELS[locale]}
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold transition-colors",
                active
                  ? dark
                    ? "bg-white/15 text-white"
                    : "bg-primary/10 text-primary"
                  : dark
                    ? "text-white/60 hover:bg-white/10 hover:text-white"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              {active && <Check className="h-3 w-3" aria-hidden="true" />}
              {LOCALE_SHORT_LABELS[locale]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
