import type { Order } from "@/types";

/**
 * Server-side GA4 `purchase` via de Measurement Protocol.
 *
 * Vanuit de Mollie-webhook gevuurd zodra een order voor het eerst betaald is, zodat
 * ELKE betaalde order in GA4 telt — en via de bestaande GA4↔Google Ads-koppeling
 * ook in Google Ads — ongeacht of de klant terugkeert naar /bedankt of cookies
 * accepteert. Vult zo het gat dat de client-side `purchase` (PurchaseTracker) laat
 * vallen bij afhakers, geblokkeerde scripts of geweigerde analytics-cookies.
 *
 * GA4 ontdubbelt aankopen op `transaction_id`; we sturen exact dezelfde
 * `order.reference` als de client, zodat een order nooit dubbel geteld wordt.
 *
 * Best-effort: deze functie gooit NOOIT en is een no-op zonder API-secret. Ze mag
 * de orderafhandeling/webhook onder geen beding raken.
 */

const MP_ENDPOINT = "https://www.google-analytics.com/mp/collect";

/**
 * Stabiele fallback-client-id afgeleid van de order-referentie. Wordt gebruikt
 * wanneer de client geen GA-client-id kon meesturen (geen cookie/consent), zodat
 * de omzet tóch geteld wordt. Deterministisch zodat webhook-retries dezelfde id
 * hergebruiken (geen losse "gebruikers"). Vorm "X.Y" zoals een GA-client-id.
 */
function fallbackClientId(seed: string): string {
  // Simpele, stabiele hash (FNV-achtig) → twee positieve getallen.
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  const a = (h >>> 0) % 1_000_000_000;
  // Tweede component uit een tweede pass zodat beide delen variëren.
  let h2 = 0x9e3779b1;
  for (let i = seed.length - 1; i >= 0; i--) {
    h2 ^= seed.charCodeAt(i);
    h2 = Math.imul(h2, 0x85ebca77);
  }
  const b = (h2 >>> 0) % 1_000_000_000;
  return `${a}.${b}`;
}

export async function sendGa4Purchase(order: Order): Promise<void> {
  try {
    const MEASUREMENT_ID = process.env.GA4_MEASUREMENT_ID || "G-M854M83RJW";
    const API_SECRET = process.env.GA4_MP_API_SECRET;

    // Zonder API-secret: no-op (alleen in dev loggen). Het secret maak je aan in
    // GA4 → Admin → Data Streams → Measurement Protocol API secrets.
    if (!API_SECRET) {
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.debug("[ga4-mp] GA4_MP_API_SECRET ontbreekt — purchase niet verstuurd");
      }
      return;
    }

    // Consent-gate (optioneel): alleen versturen met expliciete analytics-toestemming
    // wanneer GA4_MP_REQUIRE_CONSENT="1". Standaard uit → omzet wordt altijd geteld.
    if (process.env.GA4_MP_REQUIRE_CONSENT === "1" && order.ga?.consent !== true) {
      return;
    }

    const clientId = order.ga?.clientId || fallbackClientId(order.reference || order.id);

    // GEEN PII (geen naam/e-mail) in de payload. Vorm spiegelt de client-side
    // PurchaseTracker (item_id/item_name/item_brand/item_variant/price/quantity).
    const payload = {
      client_id: clientId,
      events: [
        {
          name: "purchase",
          params: {
            transaction_id: order.reference,
            currency: "EUR",
            value: order.total,
            shipping: order.shipping,
            items: order.items.map((i) => ({
              item_id: i.productId,
              item_name: i.title,
              item_brand: i.brand,
              item_variant: i.variantLabel,
              price: i.kluspasPrice,
              quantity: i.quantity,
            })),
            ...(order.ga?.sessionId ? { session_id: order.ga.sessionId } : {}),
            // Vereist door GA4 om de sessie als "engaged" te tellen.
            engagement_time_msec: 1,
          },
        },
      ],
    };

    // Timeout zodat een trage GA-call de webhook nooit ophoudt.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    try {
      await fetch(
        `${MP_ENDPOINT}?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        },
      );
    } finally {
      clearTimeout(timer);
    }
  } catch (err) {
    // Best-effort: nooit gooien. Alleen in dev loggen.
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.debug("[ga4-mp] purchase niet verstuurd:", err);
    }
  }
}
