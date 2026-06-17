"use client";

import Script from "next/script";
import { useEffect, useRef, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackEvent } from "@/lib/tracking";
import { trackVisit } from "@/lib/visitor-id";
import { useCart } from "@/lib/store/cart";

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || "GTM-TQSG438L";

/**
 * Leid een beknopt herkomst-label af uit de marketing-parameters in de URL en de
 * referrer. Volgorde: Google Ads (gclid/gad/utm cpc) → expliciete utm_source →
 * bekende zoekmachine in referrer → andere externe host → "Direct".
 */
function deriveSource(): { source: string; referrer: string } {
  if (typeof window === "undefined") return { source: "Direct", referrer: "" };
  const params = new URLSearchParams(window.location.search);
  const get = (k: string) => params.get(k)?.trim() || "";
  const utmSource = get("utm_source").toLowerCase();
  const utmMedium = get("utm_medium").toLowerCase();
  const hasAds =
    Boolean(get("gclid") || get("gad_source") || get("gad_campaignid")) ||
    (utmSource === "google" && /cpc|ppc|paid/.test(utmMedium));
  const referrer = typeof document !== "undefined" ? document.referrer || "" : "";

  let source = "Direct";
  if (hasAds) {
    source = "Google Ads";
  } else if (get("fbclid")) {
    source = "Facebook";
  } else if (utmSource) {
    source = utmMedium ? `${utmSource} / ${utmMedium}` : utmSource;
  } else if (referrer) {
    try {
      const host = new URL(referrer).host.toLowerCase();
      if (host && host !== window.location.host) {
        if (host.includes("google.")) source = "Google (organic)";
        else if (host.includes("bing.")) source = "Bing";
        else if (host.includes("duckduckgo.")) source = "DuckDuckGo";
        else if (host.includes("facebook.") || host.includes("fb.")) source = "Facebook";
        else if (host.includes("instagram.")) source = "Instagram";
        else source = host.replace(/^www\./, "");
      }
    } catch {
      /* onbruikbare referrer → blijft "Direct" */
    }
  }
  return { source, referrer };
}

/** Compacte winkelmand-momentopname (aantal stuks + brutowaarde kluspasPrijs). */
function cartSnapshot(): { count: number; value: number } | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const items = useCart.getState().items;
    if (!items.length) return undefined;
    let count = 0;
    let value = 0;
    for (const i of items) {
      count += i.quantity;
      value += i.kluspasPrice * i.quantity;
    }
    if (count <= 0) return undefined;
    return { count, value: Math.round(value * 100) / 100 };
  } catch {
    return undefined;
  }
}

/**
 * Injects the Google Tag Manager script. No-op when NEXT_PUBLIC_GTM_ID is unset
 * (the dataLayer still works for local debugging via trackEvent).
 */
export function GoogleTagManager() {
  if (!GTM_ID) return null;
  return (
    <>
      {/* lazyOnload: GTM laadt in browser-idle ná de pagina, scheelt fors in
          Total Blocking Time op mobiel. dataLayer-events queuen tot het laadt. */}
      <Script id="gtm-init" strategy="lazyOnload">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${GTM_ID}');`}
      </Script>
    </>
  );
}

export function GoogleTagManagerNoScript() {
  if (!GTM_ID) return null;
  return (
    <noscript>
      {/* eslint-disable-next-line @next/next/no-sync-scripts */}
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
        title="gtm"
      />
    </noscript>
  );
}

function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Alleen de éérste pageview van deze sessie krijgt de herkomst mee, zodat de
  // dagaggregatie en de live-bron stabiel blijven (één bron per bezoeker).
  const sentFirst = useRef(false);

  useEffect(() => {
    const query = searchParams.toString();
    const path = pathname + (query ? `?${query}` : "");
    trackEvent("page_view", {
      page_path: path,
      page_title: typeof document !== "undefined" ? document.title : undefined,
    });
    // Eigen server-analytics: paginaweergave + unieke bezoeker + live + mandje.
    const payload: Record<string, unknown> = { type: "pageview", path, cart: cartSnapshot() };
    if (!sentFirst.current) {
      sentFirst.current = true;
      const { source, referrer } = deriveSource();
      payload.source = source;
      if (referrer) payload.referrer = referrer;
    }
    trackVisit(payload);
  }, [pathname, searchParams]);

  // Houd de "live bezoekers" + huidige pagina vers met een heartbeat zolang het
  // tabblad open is. Stuur het actuele pad + winkelmand mee zodat de live-sessie
  // klopt (geen herkomst: die is al bij de eerste pageview vastgelegd).
  useEffect(() => {
    const beat = () =>
      trackVisit({
        type: "heartbeat",
        path: typeof window !== "undefined" ? window.location.pathname : undefined,
        cart: cartSnapshot(),
      });
    const id = setInterval(beat, 50_000);
    return () => clearInterval(id);
  }, []);

  return null;
}

/** Fires a page_view on every route change (GA4 SPA tracking). */
export function AnalyticsPageView() {
  return (
    <Suspense fallback={null}>
      <PageViewTracker />
    </Suspense>
  );
}
