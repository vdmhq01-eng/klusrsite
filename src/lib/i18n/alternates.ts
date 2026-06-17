import { DEFAULT_LOCALE, LOCALES, localePrefix, type Locale } from "./config";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.klus-r.nl"
).replace(/\/$/, "");

/**
 * Verwijder een eventuele locale-prefix uit een pad, zodat we het "kale"
 * (NL-)pad overhouden om de alternatieven uit te bouwen.
 * Bv. "/en/categorie/verf" => "/categorie/verf"; "/" blijft "/".
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

/** Bouw een absolute URL voor een pad onder een bepaalde locale. */
function urlFor(locale: Locale, basePath: string): string {
  const prefix = localePrefix(locale);
  // Vermijd dubbele slash voor de root.
  const path = basePath === "/" ? "" : basePath;
  const full = `${SITE_URL}${prefix}${path}`;
  return full === SITE_URL ? `${SITE_URL}/` : full;
}

export type Alternates = {
  canonical: string;
  languages: Record<string, string>;
};

/**
 * Geef voor een (mogelijk geprefixt) pad de canonical + hreflang-alternatieven
 * terug als absolute URL's. `x-default` wijst naar de default-locale (NL).
 *
 * Bedoeld om in de root-layout-metadata gezet te worden, MAAR alléén wanneer de
 * feature-flag aan staat (zie layout.tsx). Met de flag uit blijft de metadata
 * ongewijzigd.
 */
export function getAlternates(pathname: string): Alternates {
  const basePath = stripLocalePrefix(pathname);

  const languages: Record<string, string> = {};
  for (const locale of LOCALES) {
    languages[locale] = urlFor(locale, basePath);
  }
  languages["x-default"] = urlFor(DEFAULT_LOCALE, basePath);

  return {
    canonical: urlFor(DEFAULT_LOCALE, basePath),
    languages,
  };
}
