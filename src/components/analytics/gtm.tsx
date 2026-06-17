"use client";

import Script from "next/script";
import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackEvent } from "@/lib/tracking";
import { trackVisit } from "@/lib/visitor-id";

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || "GTM-TQSG438L";

/**
 * Injects the Google Tag Manager script. No-op when NEXT_PUBLIC_GTM_ID is unset
 * (the dataLayer still works for local debugging via trackEvent).
 */
export function GoogleTagManager() {
  if (!GTM_ID) return null;
  return (
    <>
      <Script id="gtm-init" strategy="afterInteractive">
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

  useEffect(() => {
    const query = searchParams.toString();
    const path = pathname + (query ? `?${query}` : "");
    trackEvent("page_view", {
      page_path: path,
      page_title: typeof document !== "undefined" ? document.title : undefined,
    });
    // Eigen server-analytics: paginaweergave + unieke bezoeker + live.
    trackVisit({ type: "pageview", path });
  }, [pathname, searchParams]);

  // Houd de "live bezoekers" + huidige pagina vers met een heartbeat zolang het
  // tabblad open is. Stuur het actuele pad mee zodat de live-sessie klopt.
  useEffect(() => {
    const beat = () =>
      trackVisit({
        type: "heartbeat",
        path: typeof window !== "undefined" ? window.location.pathname : undefined,
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
