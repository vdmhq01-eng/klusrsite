import { merchantFeedResponse } from "@/lib/google-feed";

/**
 * Google Merchant Center productfeed (RSS 2.0) — Nederlandse hoofdfeed.
 *
 * Statisch gegenereerd bij de build, dus direct bruikbaar als geplande ophaal-URL
 * in Merchant Center. De meertalige varianten staan op /google-merchant.<land>.xml
 * (zie src/lib/google-feed.ts voor de gedeelde builder).
 */

export const dynamic = "force-static";

export function GET() {
  return merchantFeedResponse({ locale: "nl", country: "NL" });
}
