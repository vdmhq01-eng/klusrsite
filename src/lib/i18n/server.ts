// Server-only module: het importeren van `next/headers` zorgt er al voor dat
// dit bestand niet in een client-bundle kan belanden (Next gooit dan een fout).
import { cookies, headers } from "next/headers";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  i18nEnabled,
  isLocale,
  type Locale,
} from "./config";
import { dictionaries, type Messages, type MessageKey } from "./dictionaries";
import { translate, type TVars } from "./interpolate";

/**
 * Bepaal de actieve locale op de server (Server Components / layout).
 *
 * Volgorde:
 *  1. Flag UIT → altijd DEFAULT_LOCALE ("nl"). Géén gedragswijziging voor NL.
 *  2. `x-locale`-header (door de middleware gezet op basis van de URL-prefix).
 *  3. `locale`-cookie (onthouden keuze).
 *  4. DEFAULT_LOCALE.
 *
 * Volledig deterministisch op basis van het request → de waarde is server- én
 * client-side gelijk (zie LocaleProvider), dus geen hydration-mismatch.
 */
export function getLocale(): Locale {
  if (!i18nEnabled()) return DEFAULT_LOCALE;

  try {
    const headerLocale = headers().get("x-locale");
    if (isLocale(headerLocale)) return headerLocale;
  } catch {
    // headers() kan buiten een request-scope falen — stil terugvallen.
  }

  try {
    const cookieLocale = cookies().get(LOCALE_COOKIE)?.value;
    if (isLocale(cookieLocale)) return cookieLocale;
  } catch {
    // cookies() kan buiten een request-scope falen — stil terugvallen.
  }

  return DEFAULT_LOCALE;
}

/** De volledige berichtenset voor de huidige locale. */
export function getMessages(): Messages {
  return dictionaries[getLocale()];
}

/**
 * Server-side vertaalfunctie. Leest de berichtenset één keer en vertaalt de
 * sleutel met optionele `{var}`-interpolatie.
 */
export function t(key: MessageKey, vars?: TVars): string {
  return translate(getMessages(), key, vars);
}
