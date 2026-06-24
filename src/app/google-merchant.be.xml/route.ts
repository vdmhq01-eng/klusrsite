import { merchantFeedResponse } from "@/lib/google-feed";

/**
 * Google Merchant-feed voor België (Nederlandstalig, EUR). Zelfde catalogus als
 * de NL-feed, maar met Belgische verzending. Koppel 'm in Merchant Center aan
 * land = België, taal = Nederlands. Controleer je BE-verzendtarieven en btw daar.
 */

export const dynamic = "force-static";

export function GET() {
  return merchantFeedResponse({ locale: "nl", country: "BE" });
}
