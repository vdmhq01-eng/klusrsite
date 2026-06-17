/**
 * Conservatieve heuristiek: past een order/winkelwagen (waarschijnlijk) in een
 * brievenbuspakje? (max ±38 × 26,5 × 3,2 cm, ≤ 2 kg.)
 *
 * Er staan geen afmetingen/gewicht in de feed, dus we whitelisten alleen
 * duidelijk platte, lichte artikelen (schuurpapier, tape …) en sluiten verf,
 * blikken, rollers, kwasten enz. uit. Liever te voorzichtig dan een te groot
 * label: in de admin kan de medewerker de keuze altijd overrulen.
 */

const ELIGIBLE =
  /schuurpapier|schuurstrook|schuurvel|schuurlinnen|schuurgaas|schuurspons|schilderstape|afplaktape|plakband|\btape\b|maskeerpapier|stofdoek|microvezeldoek/i;

const INELIGIBLE =
  /\bml\b|liter|\b\d+\s?l\b|\brol\b|roller|kwast|emmer|blik|\bverf\b|beits|\blak\b|primer|grondverf|plamuur|spaan|kuip|pot|bus\b/i;

export interface BrievenbusItem {
  title: string;
  variantLabel?: string;
  quantity: number;
  selectedColor?: unknown;
}

/** Past dit losse artikel (waarschijnlijk) in een brievenbuspakje? */
export function isBrievenbusItem(it: BrievenbusItem): boolean {
  if (it.selectedColor) return false; // op kleur gemengde verf
  const hay = `${it.title} ${it.variantLabel ?? ""}`.toLowerCase();
  if (INELIGIBLE.test(hay)) return false;
  return ELIGIBLE.test(hay);
}

/** Komt de hele order/winkelwagen in aanmerking voor een brievenbuspakje? */
export function isBrievenbusOrder(items: BrievenbusItem[]): boolean {
  if (!items.length) return false;
  const totalQty = items.reduce((s, i) => s + (i.quantity || 1), 0);
  if (totalQty > 6) return false; // te veel stuks → waarschijnlijk te dik
  return items.every(isBrievenbusItem);
}
