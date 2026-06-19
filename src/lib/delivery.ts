/**
 * Bezorglogica ("bezorgklok") — puur, testbaar en client-veilig.
 *
 * Bepaalt WANNEER een bestelling geleverd wordt op basis van het bestelmoment.
 * De functie werkt met een meegegeven `now` (default `new Date()`) zodat 'ie
 * deterministisch te testen is en geen verborgen tijd-afhankelijkheid heeft.
 *
 * Alle berekeningen gebeuren in de LOKALE tijd van de bezoeker (NL-publiek):
 * we lezen/zetten uitsluitend via de lokale `getHours()/getDate()/setHours()`
 * etc., dus er is geen externe timezone-library nodig.
 *
 * Regels (bevestigd door de eigenaar):
 *  - Cutoff = 19:00.
 *  - Besteld vóór 19:00 → effectieve besteldag = vandaag; ná 19:00 → morgen.
 *  - Levering = effectieve besteldag + 1 dag.
 *  - PostNL bezorgt NIET op zondag (0) en maandag (1). Valt de leverdatum op
 *    zo/ma, dan rolt 'ie door naar de eerstvolgende bezorgdag (dinsdag).
 *    Bezorgdagen zijn dus dinsdag t/m zaterdag.
 *
 * Controle-voorbeelden (kloppen met "orders van zondag worden dinsdag geleverd"):
 *  - ma 14:00 → di ("morgen")
 *  - ma 20:00 → wo ("overmorgen")
 *  - vr 14:00 → za ("morgen")
 *  - vr 20:00 → di
 *  - za (elk tijdstip) → di
 *  - zo (elk tijdstip) → di
 */

/** Cutoff-uur (lokale tijd). Vóór dit hele uur telt als "vóór 19:00". */
export const CUTOFF_HOUR = 19;

/** Dagen waarop PostNL NIET bezorgt: zondag (0) en maandag (1). */
const NON_DELIVERY_DAYS = new Set([0, 1]);

export type DeliveryLabel = "tomorrow" | "dayAfter" | "weekday";

export interface DeliveryInfo {
  /** De (lokale) datum waarop bezorgd wordt, op middernacht genormaliseerd. */
  deliveryDate: Date;
  /** Was er besteld vóór de cutoff van 19:00? */
  beforeCutoff: boolean;
  /**
   * Hoe de UI de dag mag presenteren:
   *  - "tomorrow"  → leverdatum is exact vandaag + 1
   *  - "dayAfter"  → leverdatum is exact vandaag + 2
   *  - "weekday"   → anders; gebruik `deliveryDate` met
   *                  `Intl.DateTimeFormat(locale, { weekday: "long" })`.
   */
  label: DeliveryLabel;
  /**
   * Milliseconden tot de eerstvolgende 19:00 (voor de live aftelling). Alleen
   * zinvol als `beforeCutoff` true is; ná de cutoff is dit 0.
   */
  msUntilCutoff: number;
}

/** Geeft een kopie van `d` op lokale middernacht (00:00:00.000). */
function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/** Geeft een nieuwe datum = `d` + `days` hele dagen (lokale tijd). */
function addDays(d: Date, days: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
}

/**
 * Bereken de bezorginformatie voor een bestelling geplaatst op `now`.
 *
 * @param now Het bestelmoment (default: het huidige moment).
 */
export function deliveryInfo(now: Date = new Date()): DeliveryInfo {
  const beforeCutoff = now.getHours() < CUTOFF_HOUR;

  // Effectieve besteldag: vóór 19:00 telt vandaag mee, anders pas morgen.
  const orderDay = beforeCutoff ? startOfDay(now) : addDays(startOfDay(now), 1);

  // Eerste poging: levering = effectieve besteldag + 1 dag.
  let deliveryDate = addDays(orderDay, 1);

  // Rol door naar de eerstvolgende bezorgdag (di–za) als het op zo/ma valt.
  while (NON_DELIVERY_DAYS.has(deliveryDate.getDay())) {
    deliveryDate = addDays(deliveryDate, 1);
  }

  // Label bepalen t.o.v. "vandaag" (lokale middernacht).
  const today = startOfDay(now);
  const dayDiff = Math.round(
    (deliveryDate.getTime() - today.getTime()) / 86_400_000,
  );
  let label: DeliveryLabel;
  if (dayDiff === 1) label = "tomorrow";
  else if (dayDiff === 2) label = "dayAfter";
  else label = "weekday";

  // ms tot de eerstvolgende 19:00 (alleen relevant vóór de cutoff).
  let msUntilCutoff = 0;
  if (beforeCutoff) {
    const cutoff = startOfDay(now);
    cutoff.setHours(CUTOFF_HOUR, 0, 0, 0);
    msUntilCutoff = Math.max(0, cutoff.getTime() - now.getTime());
  }

  return { deliveryDate, beforeCutoff, label, msUntilCutoff };
}
