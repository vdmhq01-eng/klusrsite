import type { PricingMode } from "@/lib/store/pricing-mode";

/**
 * Centrale prijslogica voor de twee prijsmodi.
 *
 * Drie prijspunten in de data:
 *  - `price`         = normale prijs (incl. btw, zonder account)
 *  - `kluspasPrice`  = KLUSRPAS-prijs (incl. btw, consumentenpas)
 *  - `compareAtPrice`= adviesprijs (optioneel; vaak afwezig in de feed)
 *
 * Particulier toont incl. btw; Zakelijk toont **excl. btw** met de **ProfPas**-
 * prijs = 10% korting op de normale prijs over de hele collectie.
 */

export const VAT_RATE = 0.21;
export const PROFPAS_DISCOUNT = 0.1;

/** Bedrag exclusief btw uit een incl.-btw-bedrag. */
export const exVat = (inclVat: number): number => inclVat / (1 + VAT_RATE);

/** Btw-deel van een incl.-btw-bedrag. */
export const vatPart = (inclVat: number): number => inclVat - exVat(inclVat);

/** Bruto prijs (incl. btw) die een zakelijke ProfPas-klant betaalt: 10% korting. */
export const profGrossPrice = (normalInclVat: number): number =>
  normalInclVat * (1 - PROFPAS_DISCOUNT);

export interface PriceInput {
  price: number;
  kluspasPrice?: number;
  compareAtPrice?: number;
}

export interface PriceView {
  /** Hoofdbedrag dat groot getoond wordt. */
  amount: number;
  /** Doorgestreepte referentie (hoger), of undefined. */
  reference?: number;
  /** Label bij de referentie ("Adviesprijs" / "Normaal"). */
  referenceLabel?: string;
  /** Pas-badge ("KLUSRPAS" / "ProfPas"), of undefined. */
  badge?: "KLUSRPAS" | "ProfPas";
  /** "incl. btw" of "excl. btw". */
  vatSuffix: "incl. btw" | "excl. btw";
  savings?: number;
  savingsPct?: number;
}

/** Bereken alles wat de UI nodig heeft om een prijs in een modus te tonen. */
export function priceView(input: PriceInput, mode: PricingMode): PriceView {
  const { price, kluspasPrice, compareAtPrice } = input;

  if (mode === "zakelijk") {
    const normalEx = exVat(price);
    const profEx = exVat(profGrossPrice(price));
    return {
      amount: profEx,
      reference: normalEx > profEx ? normalEx : undefined,
      referenceLabel: "Normaal",
      badge: "ProfPas",
      vatSuffix: "excl. btw",
      savings: normalEx - profEx,
      savingsPct: Math.round(PROFPAS_DISCOUNT * 100),
    };
  }

  // Particulier (incl. btw)
  const member = kluspasPrice !== undefined && kluspasPrice < price;
  const amount = member ? kluspasPrice! : price;
  // Referentie: een echte adviesprijs als die er is, anders de normale prijs
  // (zonder pas) — dat laatste was eerder ten onrechte als "Adviesprijs" gelabeld.
  const hasAdvies = compareAtPrice !== undefined && compareAtPrice > amount;
  const reference = hasAdvies ? compareAtPrice! : member ? price : undefined;

  return {
    amount,
    reference,
    referenceLabel: hasAdvies ? "Adviesprijs" : reference ? "Normaal" : undefined,
    badge: member ? "KLUSRPAS" : undefined,
    vatSuffix: "incl. btw",
    savings: reference ? reference - amount : undefined,
    savingsPct: reference ? Math.round(((reference - amount) / reference) * 100) : undefined,
  };
}

/** Effectieve stuksprijs die in de winkelwagen/checkout gerekend wordt. */
export function effectiveUnitPrice(
  input: { price: number; kluspasPrice: number },
  mode: PricingMode,
  kluspasActive = true,
): number {
  if (mode === "zakelijk") return profGrossPrice(input.price); // incl. btw, 10% korting
  return kluspasActive ? input.kluspasPrice : input.price;
}
