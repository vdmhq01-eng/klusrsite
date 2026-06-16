import Script from "next/script";

/**
 * Google Consent Mode v2 — default state.
 *
 * Draait vóór GTM (beforeInteractive): alle marketing-/analytics-opslag staat
 * standaard op `denied` totdat de bezoeker via de cookiebanner kiest. Een
 * eerder opgeslagen keuze wordt meteen hersteld, zodat consent al klopt vóór de
 * GTM-container laadt. Dit is wat Google verwacht voor Consent Mode v2.
 */
export function ConsentDefault() {
  return (
    <Script id="consent-default" strategy="beforeInteractive">
      {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('consent','default',{
          ad_storage:'denied',
          ad_user_data:'denied',
          ad_personalization:'denied',
          analytics_storage:'denied',
          personalization_storage:'denied',
          functionality_storage:'granted',
          security_storage:'granted',
          wait_for_update:500
        });
        gtag('set','ads_data_redaction', true);
        gtag('set','url_passthrough', true);
        try {
          var c = JSON.parse(localStorage.getItem('klusr-consent') || 'null');
          if (c) {
            gtag('consent','update',{
              analytics_storage: c.analytics ? 'granted' : 'denied',
              ad_storage: c.marketing ? 'granted' : 'denied',
              ad_user_data: c.marketing ? 'granted' : 'denied',
              ad_personalization: c.marketing ? 'granted' : 'denied',
              personalization_storage: c.marketing ? 'granted' : 'denied'
            });
          }
        } catch (e) {}
      `}
    </Script>
  );
}
