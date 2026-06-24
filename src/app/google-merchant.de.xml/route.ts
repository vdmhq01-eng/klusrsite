import { merchantFeedResponse } from "@/lib/google-feed";

/**
 * Google Merchant-feed voor Duitsland (Duitstalig, EUR). Titels/omschrijvingen
 * uit de Duitse vertaal-overlay; links wijzen naar /de/product/... Koppel 'm in
 * Merchant Center aan land = Duitsland, taal = Duits. Vereist dat de i18n-laag
 * aanstaat (NEXT_PUBLIC_I18N_ENABLED=true) zodat de /de-pagina's renderen, en dat
 * je daadwerkelijk naar Duitsland verzendt (stel de DE-tarieven + btw in MC in).
 */

export const dynamic = "force-static";

export function GET() {
  return merchantFeedResponse({ locale: "de", country: "DE" });
}
