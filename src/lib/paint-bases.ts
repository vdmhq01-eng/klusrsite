import type { PaintBaseSelection, SelectedColor, StoreStock } from "@/types";

/**
 * Verf-basislogica (mengsysteem).
 *
 * Een gemengde kleur wordt aangemaakt in een tinting-basis. Lichte/pastelkleuren
 * gaan in een witte basis; hoe donkerder/verzadigder de kleur, hoe transparanter
 * de basis (meer kleurpigment nodig). Dit beïnvloedt:
 *   - de BASIS (wit / medium / deep)
 *   - de PRIJS (deep basis = duurder: meer colorant + transparante basis)
 *   - de VOORRAAD (elke basis is een eigen blik met eigen voorraad)
 *
 * Deze logica spiegelt het mengsysteem van de portal-kleurkiezer.
 */

export interface PaintBase {
  id: "wit" | "medium" | "deep";
  label: string;
  short: string;
  description: string;
  /** Per-unit surcharge (EUR) bovenop de variantprijs. */
  surcharge: number;
  /** Voorraadfactor t.o.v. de basisvoorraad van het product. */
  stockFactor: number;
}

export const paintBases: Record<PaintBase["id"], PaintBase> = {
  wit: {
    id: "wit",
    label: "Basis Wit (W)",
    short: "Wit",
    description: "Voor witte, lichte en pastelkleuren.",
    surcharge: 0,
    stockFactor: 1,
  },
  medium: {
    id: "medium",
    label: "Basis Medium (M)",
    short: "Medium",
    description: "Voor heldere en middentinten.",
    surcharge: 2.0,
    stockFactor: 0.6,
  },
  deep: {
    id: "deep",
    label: "Basis Deep (D)",
    short: "Deep",
    description: "Voor diepe en donkere kleuren — meer pigment nodig.",
    surcharge: 4.5,
    stockFactor: 0.35,
  },
};

/** Relatieve luminantie (0 = zwart, 1 = wit). */
export function luminance(hex: string): number {
  const c = hex.replace("#", "");
  if (c.length < 6) return 1;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

/** Kies de juiste basis op basis van de helderheid van de kleur. */
export function baseForColor(hex: string): PaintBase {
  const lum = luminance(hex);
  if (lum > 0.62) return paintBases.wit;
  if (lum > 0.34) return paintBases.medium;
  return paintBases.deep;
}

/** Compacte selectie die we op het cart line item bewaren. */
export function toBaseSelection(base: PaintBase): PaintBaseSelection {
  return { id: base.id, label: base.label, surcharge: base.surcharge };
}

/** Verrijk een gekozen kleur met de afgeleide basis. */
export function withBase(color: SelectedColor): SelectedColor {
  const base = baseForColor(color.hex);
  return { ...color, base: toBaseSelection(base) };
}

/** Prijs per stuk inclusief basistoeslag. */
export function priceWithBase(unitPrice: number, base?: PaintBaseSelection | null): number {
  return Math.round((unitPrice + (base?.surcharge ?? 0)) * 100) / 100;
}

/** Voorraad per winkel voor de gekozen basis (eigen blik = eigen voorraad). */
export function baseStockByStore(
  productStock: StoreStock[],
  baseId: PaintBase["id"] = "wit",
): StoreStock[] {
  const factor = paintBases[baseId].stockFactor;
  return productStock.map((s) => ({
    storeId: s.storeId,
    quantity: Math.max(0, Math.floor(s.quantity * factor)),
  }));
}
