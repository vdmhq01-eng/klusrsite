import { merchantFeedResponse } from "@/lib/google-feed";

/**
 * Google Merchant-feed voor Frankrijk (Franstalig, EUR). Titels/omschrijvingen
 * uit de Franse vertaal-overlay; links wijzen naar /fr/product/... Koppel 'm in
 * Merchant Center aan land = Frankrijk, taal = Frans. Vereist dat de i18n-laag
 * aanstaat (NEXT_PUBLIC_I18N_ENABLED=true) zodat de /fr-pagina's renderen, en dat
 * je daadwerkelijk naar Frankrijk verzendt (stel de FR-tarieven + btw in MC in).
 */

export const dynamic = "force-static";

export function GET() {
  return merchantFeedResponse({ locale: "fr", country: "FR" });
}
