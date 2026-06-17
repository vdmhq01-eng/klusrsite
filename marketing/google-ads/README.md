# KLUSR — Google Ads (Search) importbestanden

Kant-en-klare campagnes om te importeren via **Google Ads Editor**. Alles is
Nederlandstalig, opgebouwd rond de KLUSR-catalogus en gevalideerd op Google's
tekenlimieten (kop ≤ 30, beschrijving ≤ 90, pad ≤ 15 tekens).

Gegenereerd met `node scripts/gen-google-ads.mjs` — pas de bron aan en draai
opnieuw om te wijzigen.

## Wat zit erin

| Bestand | Inhoud |
| --- | --- |
| `klusr-search-campaigns.csv` | 5 campagnes · 17 advertentiegroepen · 154 zoekwoorden (phrase + exact) · 17 responsieve zoekadvertenties |
| `negative-keywords.csv` | Campagne-uitsluitingszoekwoorden (bespaart budget op niet-koopintentie) |

**Campagnes**
1. **Verf — Generiek** — Muurverf, Binnenmuurverf, Buitenmuurverf, Plafondverf
2. **Lak & Beits** — Lak, Beits, Grondverf & Primer
3. **Vloer & Beton** — Vloerverf, Betonverf, Garageverf, Trapverf
4. **Merken** — Sikkens, Histor, Flexa, Wijzonol
5. **Kleurenkiezer & Mengverf** — Verf op kleur mengen, RAL-kleuren

## Importeren (Google Ads Editor)

1. Open **Google Ads Editor** en kies het juiste account.
2. **Account → Import → Import from file…** en kies `klusr-search-campaigns.csv`.
3. Controleer het voorstel (campagnes, groepen, zoekwoorden, advertenties) en
   klik **Keep / Process**. Daarna **Post / Push** om naar Google te sturen.
4. Uitsluitingszoekwoorden: ga naar **Keywords, Negative**, kies
   **Make multiple changes → Add/update multiple negative keywords**, en plak de
   inhoud van `negative-keywords.csv` (kolommen *Campaign*, *Keyword*, *Match Type*).
   De tekstkolom heet bewust **Keyword** — zo vult Ads Editor de zoekwoordtekst
   correct in (een kolom *Negative Keyword* laat de tekst leeg).

> Tip: importeer eerst in een **concept/draft** of op een testaccount als je het
> resultaat eerst wilt bekijken.

## Belangrijk — vóór je live gaat

- **Status = Paused.** Alle campagnes staan op *Paused* zodat er niets uitgeeft
  bij import. Zet ze pas aan na controle.
- **Budget & bod zijn placeholders** (€ 15,00/dag, € 0,60 max. CPC, *Manual CPC*).
  Pas aan naar je eigen budget/strategie (bv. *Maximize conversions* zodra je
  conversies meet).
- **Conversietracking eerst.** Koppel Google Ads-conversies / GA4 (de site heeft
  al GTM) vóór je optimaliseert op conversies.
- **Doelgroep/locatie/taal** stel je per campagne in (Nederland, Nederlands) —
  Editor neemt accountstandaarden over; controleer dit.
- **Final URLs** wijzen naar bestaande pagina's (`/categorie/verf/…`,
  `/kleurenkiezer`). Controleer dat ze 200 geven en pas eventueel sitelinks toe.
- **Merkcampagnes**: bieden op merknamen die je verkoopt is toegestaan; gebruik
  geen merknamen in de advertentieteksten als de merkrichtlijnen dat verbieden.
- Voeg vóór livegang nog **extensies** toe (sitelinks, highlights, gestructureerde
  snippets, locatie/telefoon) — die zitten niet in dit basispakket.

## Aanpassen

Alles staat in `scripts/gen-google-ads.mjs`: campagnes, advertentiegroepen,
zoekwoorden, koppen/beschrijvingen, budgetten en uitsluitingen. Wijzig daar en
draai `node scripts/gen-google-ads.mjs` opnieuw — het script faalt als een kop of
beschrijving te lang is, zodat de export altijd importeerbaar blijft.
