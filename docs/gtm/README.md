# KLUSR — Google Tag Manager

Importeerbaar GTM-containerbestand: [`klusr-gtm-container.json`](./klusr-gtm-container.json).

## IDs

| | |
| --- | --- |
| GTM-container | **GTM-TQSG438L** (`NEXT_PUBLIC_GTM_ID`, default in de code) |
| GA4 Measurement ID | **G-M854M83RJW** (stream: klus-r / www.klus-r.nl) |
| Google Ads account | **773-903-6525** |
| Google Ads conversie-ID | **AW-18243904404** |

## Wat zit erin

- **GA4 — Google tag** (`G-M854M83RJW`) op alle pagina's.
- **GA4-event-tags** gekoppeld aan de dataLayer-events die de webshop al pusht
  (zie `src/lib/tracking.ts`), met **Send Ecommerce data → Data Layer**:
  `view_item`, `view_item_list`, `select_item`, `add_to_cart`,
  `remove_from_cart`, `view_cart`, `begin_checkout`, `add_shipping_info`,
  `add_payment_info`, `purchase`, `search`, `sign_up`.
- **Custom Event-triggers** per event.
- **Google Ads — Google tag** (`AW-18243904404`) op alle pagina's (remarketing),
  een **Conversion Linker** (`gclidw`) en een **purchase-conversietag** (`awct`)
  — vul nog het conversielabel in, zie hieronder.
- **Consent Mode v2**: GA4-tags hebben `analytics_storage`, de Conversion Linker
  `ad_storage` als vereiste. De site zet de defaults op `denied` en stuurt een
  consent-update zodra de bezoeker in de cookiebanner kiest
  (`src/components/analytics/consent-init.tsx` + `cookie-consent.tsx`).

## Importeren

1. Tag Manager → **Admin → Import Container**.
2. Kies `klusr-gtm-container.json`, selecteer **Default Workspace**.
3. Kies **Merge → Overwrite** (of Rename) en bevestig.
4. Controleer in **Preview** of de events binnenkomen (zet de cookiebanner op
   *Alles accepteren*).
5. **Submit/Publish**.

> Bij import neemt GTM je eigen account/container over; de `publicId`
> `GTM-TQSG438L` in het bestand is enkel ter referentie.

## Nog afmaken

- **Google Ads conversielabel**: de purchase-conversietag staat klaar met
  conversie-ID `AW-18243904404`, maar je moet nog het **conversielabel** invullen
  (Google Ads → Doelen → Conversies → je aankoop-conversie). Vervang in de tag
  *"Google Ads — Conversie: purchase"* de waarde `PLAK_HIER_HET_CONVERSIELABEL`.
  Voeg desgewenst extra conversies toe op andere events (bv. `sign_up`).
- **GA4 ↔ Google Ads koppelen** (GA4 Admin → Product links → Google Ads).
- **Consent overview (BETA)** in GTM mag je gerust aanzetten — puur een overzicht
  van de consent-instellingen per tag.
- **Google Tag Gateway / server-side**: zie hieronder.

## Server-side / Google Tag Gateway (Vercel)

Tag Gateway serveert de container first-party via je eigen domein
(`www.klus-r.nl`) i.p.v. `googletagmanager.com`, wat meetverlies door
adblockers/ITP beperkt. De automatische setup werkt via een ondersteund CDN;
Vercel is dat niet out-of-the-box, dus gebruik de **handmatige** methode: een
first-party proxy (rewrites) die het meetpad doorzet naar de Google-gateway.
Lever het door Google gegenereerde **measurement path** aan, dan zet ik de
Vercel-rewrites klaar.
