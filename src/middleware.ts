import { NextResponse, type NextRequest } from "next/server";
import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_COOKIE,
  LOCALE_SUGGEST_COOKIE,
  i18nEnabled,
  type Locale,
} from "@/lib/i18n/config";
import {
  COUNTRY_COOKIE,
  COUNTRY_SUGGEST_COOKIE,
  DEFAULT_COUNTRY,
  isShippingCountry,
} from "@/lib/shipping";

/** Niet-default locales die als URL-prefix kunnen voorkomen. */
const PREFIX_LOCALES = LOCALES.filter(
  (l): l is Exclude<Locale, "nl"> => l !== DEFAULT_LOCALE,
);

/**
 * Geef de locale terug als het pad ermee begint (bv. "/en" of "/en/...").
 * Anders null.
 */
function localeFromPath(pathname: string): Locale | null {
  for (const locale of PREFIX_LOCALES) {
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
      return locale;
    }
  }
  return null;
}

/**
 * Slim taalvoorstel op basis van land (Vercel geo) + accept-language.
 * BEWUST conservatief; bij twijfel → NL (default). Geeft de voorgestelde locale
 * terug (kan gelijk zijn aan NL).
 */
function suggestLocale(
  country: string | undefined,
  acceptLanguage: string | null,
): Locale {
  const c = (country || "").toUpperCase();

  // Landgebaseerd (sterkste signaal).
  if (c === "FR") return "fr";
  if (c === "DE" || c === "AT") return "de";
  if (c === "GB" || c === "US" || c === "IE") return "en";
  if (c === "NL") return "nl";
  // BE: NL is de default, maar er is ook een FR-optie. Voorstel = NL.
  if (c === "BE") return "nl";

  // Geen/onbekend land → accept-language als zwak signaal.
  const al = (acceptLanguage || "").toLowerCase();
  const primary = al.split(",")[0]?.trim() ?? "";
  if (primary.startsWith("fr")) return "fr";
  if (primary.startsWith("de")) return "de";
  if (primary.startsWith("en")) return "en";

  return DEFAULT_LOCALE;
}

export function middleware(request: NextRequest): NextResponse {
  // Met de flag UIT doet de middleware NIETS → NL gedraagt zich exact als nu.
  if (!i18nEnabled()) return NextResponse.next();

  try {
    const { nextUrl } = request;
    const pathname = nextUrl.pathname;
    const prefixLocale = localeFromPath(pathname);

    // Slim bezorgland-voorstel op basis van geo (Vercel IP-land). Alleen als er
    // nog geen bevestigde landkeuze is én het gedetecteerde land een verzendland
    // ≠ NL is. De banner + checkout lezen deze (kortlevende) cookie. Nooit een
    // redirect — puur een voorstel.
    const applyCountrySuggest = (resp: NextResponse) => {
      if (request.cookies.has(COUNTRY_COOKIE)) return;
      const geo = (request.geo?.country || "").toUpperCase();
      if (geo && geo !== DEFAULT_COUNTRY && isShippingCountry(geo)) {
        resp.cookies.set(COUNTRY_SUGGEST_COOKIE, geo, {
          path: "/",
          maxAge: 60 * 60 * 24, // 1 dag — kortlevend
          sameSite: "lax",
        });
      }
    };

    if (prefixLocale) {
      // Geprefixt pad (EN/FR/DE): render dezelfde route zonder prefix en geef
      // de locale door via een request-header die de server leest.
      const strippedPath = pathname.slice(`/${prefixLocale}`.length) || "/";
      const rewriteUrl = nextUrl.clone();
      rewriteUrl.pathname = strippedPath;

      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-locale", prefixLocale);

      const response = NextResponse.rewrite(rewriteUrl, {
        request: { headers: requestHeaders },
      });
      // Onthoud de (impliciet) gekozen locale.
      response.cookies.set(LOCALE_COOKIE, prefixLocale, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
      });
      applyCountrySuggest(response);
      return response;
    }

    // Niet-geprefixt pad → NL. Zet de header zodat de server expliciet "nl" ziet.
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-locale", DEFAULT_LOCALE);
    const response = NextResponse.next({
      request: { headers: requestHeaders },
    });

    // Slim taalvoorstel — alleen als er nog GEEN keuze (cookie) is. Nooit
    // redirecten; we zetten enkel een korte cookie die de client-banner leest.
    const hasLocaleCookie = request.cookies.has(LOCALE_COOKIE);
    if (!hasLocaleCookie) {
      const suggested = suggestLocale(
        request.geo?.country,
        request.headers.get("accept-language"),
      );
      if (suggested !== DEFAULT_LOCALE) {
        response.cookies.set(LOCALE_SUGGEST_COOKIE, suggested, {
          path: "/",
          maxAge: 60 * 60 * 24, // 1 dag — kortlevend
          sameSite: "lax",
        });
      }
    }

    applyCountrySuggest(response);
    return response;
  } catch {
    // Wat er ook misgaat: NOOIT een 500. Val terug op normaal doorlaten.
    return NextResponse.next();
  }
}

export const config = {
  /**
   * Sluit Next-internals, API-routes, en bestanden-met-extensie uit. Hierdoor
   * raakt de middleware alleen "pagina"-navigaties — en draait sowieso niet als
   * de flag uit staat (zie de vroege return).
   */
  matcher: [
    "/((?!_next/static|_next/image|api|favicon.ico|robots.txt|sitemap.xml|.*\\.[^/]+$).*)",
  ],
};
