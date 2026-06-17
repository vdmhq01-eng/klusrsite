/**
 * KLUSR i18n — kernconfiguratie (locales, default, feature flag).
 *
 * Lichtgewicht eigen i18n: GEEN next-intl, GEEN app/[locale]-herstructurering.
 * Alles is puur additief. Met de feature-flag UIT gedraagt de site zich exact
 * zoals nu (Nederlands), want `i18nEnabled()` is dan `false` en alle i18n-code
 * valt terug op de default-locale "nl".
 */

/** Alle ondersteunde locales. Nederlands is de bron en de default. */
export const LOCALES = ["nl", "en", "fr", "de"] as const;

export type Locale = (typeof LOCALES)[number];

/** Default-locale: geen URL-prefix, bron van waarheid voor de teksten. */
export const DEFAULT_LOCALE: Locale = "nl";

/** Type-guard: is een willekeurige string een ondersteunde locale? */
export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" && (LOCALES as readonly string[]).includes(value)
  );
}

/** Labels voor de taalschakelaar (in de eigen taal geschreven). */
export const LOCALE_LABELS: Record<Locale, string> = {
  nl: "Nederlands",
  en: "English",
  fr: "Français",
  de: "Deutsch",
};

/** Korte labels (bv. voor compacte schakelaars / mobiel). */
export const LOCALE_SHORT_LABELS: Record<Locale, string> = {
  nl: "NL",
  en: "EN",
  fr: "FR",
  de: "DE",
};

/**
 * URL-prefix voor een locale. De default-locale (nl) krijgt GEEN prefix, zodat
 * bestaande NL-urls onveranderd blijven. Voorbeeld: localePrefix("en") => "/en".
 */
export function localePrefix(locale: Locale): string {
  return locale === DEFAULT_LOCALE ? "" : `/${locale}`;
}

/** Naam van de cookie waarin de gekozen locale wordt onthouden. */
export const LOCALE_COOKIE = "locale";

/** Cookie die een (slim) taalvoorstel bevat, gelezen door de client-banner. */
export const LOCALE_SUGGEST_COOKIE = "locale-suggest";

/**
 * Is de meertalige laag ingeschakeld? Leest `NEXT_PUBLIC_I18N_ENABLED`.
 * Geaccepteerde "aan"-waarden: "1" of "true" (case-insensitive). Alles anders
 * (incl. ontbreken) is UIT. Werkt zowel server- als client-side omdat het een
 * NEXT_PUBLIC_-variabele is.
 */
export function i18nEnabled(): boolean {
  const raw = process.env.NEXT_PUBLIC_I18N_ENABLED;
  if (!raw) return false;
  const v = raw.trim().toLowerCase();
  return v === "1" || v === "true";
}
