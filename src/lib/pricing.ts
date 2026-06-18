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
/** KLUSRPAS (particulier): vaste 5% korting op de normale prijs over de hele collectie. */
export const KLUSPAS_DISCOUNT = 0.05;

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
  /** Hoofdbedrag dat groot getoond wordt (de KLUSR-/ProfPas-prijs). */
  amount: number;
  /** Doorgestreepte referentie = uitsluitend de adviesprijs (RRP), of undefined. */
  reference?: number;
  /** Label bij de referentie (altijd "Adviesprijs" als die er is). */
  referenceLabel?: string;
  /** Pas-badge ("KLUSRPAS" / "ProfPas"), of undefined. */
  badge?: "KLUSRPAS" | "ProfPas";
  /** "incl. btw" of "excl. btw". */
  vatSuffix: "incl. btw" | "excl. btw";
  /** Normale prijs (zonder account/als gast) — getoond náást de KLUSR-prijs. */
  normalPrice?: number;
  /** Besparing van de KLUSR-/ProfPas-prijs t.o.v. de normale prijs. */
  savings?: number;
  savingsPct?: number;
  /** True wanneer de besparing t.o.v. de adviesprijs is (commerciële framing). */
  savingsVsAdvies?: boolean;
}

/** Bereken alles wat de UI nodig heeft om een prijs in een modus te tonen. */
export function priceView(input: PriceInput, mode: PricingMode): PriceView {
  const { price, kluspasPrice, compareAtPrice } = input;

  if (mode === "zakelijk") {
    const normalEx = exVat(price);
    const profEx = exVat(profGrossPrice(price));
    return {
      amount: profEx,
      normalPrice: normalEx,
      reference: normalEx > profEx ? normalEx : undefined,
      referenceLabel: "Normaal",
      badge: "ProfPas",
      vatSuffix: "excl. btw",
      savings: normalEx - profEx,
      savingsPct: Math.round(PROFPAS_DISCOUNT * 100),
    };
  }

  // Particulier (incl. btw). Drie tiers:
  //  - Adviesprijs (compareAtPrice)  → doorgestreepte referentie (RRP)
  //  - Normale prijs (price)         → wat een gast/zonder account betaalt
  //  - KLUSRPAS-prijs (kluspasPrice) → normale prijs − vaste 5% (geregistreerd)
  const member = kluspasPrice !== undefined && kluspasPrice < price;
  const amount = member ? kluspasPrice! : price;
  // Doorstrepen = uitsluitend de adviesprijs (RRP), nooit de normale prijs. De
  // adviesprijs blijft als context staan, maar wordt NIET als besparing benoemd.
  const hasAdvies = compareAtPrice !== undefined && compareAtPrice > price;

  // De benoemde besparing is altijd de vaste KLUSRPAS-korting (5%) t.o.v. de
  // normale prijs — consistent met "5% korting op de hele collectie".
  const savingsAmt = member && price > amount ? price - amount : 0;

  return {
    amount,
    reference: hasAdvies ? compareAtPrice! : undefined,
    referenceLabel: hasAdvies ? "Adviesprijs" : undefined,
    badge: member ? "KLUSRPAS" : undefined,
    vatSuffix: "incl. btw",
    // Toon de normale prijs apart wanneer de KLUSRPAS-prijs lager is.
    normalPrice: member ? price : undefined,
    savings: savingsAmt > 0 ? savingsAmt : undefined,
    // Vast 5% (de korting-rate), niet uit afgeronde centen herleid — zo leest het
    // ook op kleine bedragen netjes als "5%".
    savingsPct: savingsAmt > 0 ? Math.round(KLUSPAS_DISCOUNT * 100) : undefined,
    // Besparing is t.o.v. de normale prijs (KLUSRPAS), niet de adviesprijs.
    savingsVsAdvies: undefined,
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
