/**
 * Verzendlanden + tarieven (PostNL). Server- én client-safe (geen side effects).
 *
 * Alleen EU-landen (geen douane) — Zwitserland, VK, Noorwegen e.d. zijn bewust
 * weggelaten i.v.m. douane. **Gratis verzending alleen voor NL en BE.**
 *
 * LET OP: de bedragen hieronder zijn realistische schattingen op basis van de
 * PostNL-zonestructuur. Vul ze in vanaf het officiële tariefblad
 * "Landenoverzicht zakelijke tarieven (bus)pakjes 2026" — pas alleen `price`
 * (en evt. `freeOver`) aan; de rest van de webshop pakt het automatisch op.
 */

export interface CountryShipping {
  code: string;
  name: string;
  /** Verzendkosten (incl. btw). */
  price: number;
  /** Gratis vanaf dit subtotaal (alleen NL en BE). */
  freeOver?: number;
}

const FREE_THRESHOLD = 50;

export const SHIPPING_COUNTRIES: CountryShipping[] = [
  // Gratis vanaf €50
  { code: "NL", name: "Nederland", price: 4.95, freeOver: FREE_THRESHOLD },
  { code: "BE", name: "België", price: 6.95, freeOver: FREE_THRESHOLD },
  // Buurlanden
  { code: "DE", name: "Duitsland", price: 8.95 },
  { code: "LU", name: "Luxemburg", price: 8.95 },
  { code: "FR", name: "Frankrijk", price: 9.95 },
  // Overige EU
  { code: "AT", name: "Oostenrijk", price: 12.95 },
  { code: "DK", name: "Denemarken", price: 12.95 },
  { code: "PL", name: "Polen", price: 12.95 },
  { code: "CZ", name: "Tsjechië", price: 12.95 },
  { code: "IT", name: "Italië", price: 13.95 },
  { code: "ES", name: "Spanje", price: 13.95 },
  { code: "IE", name: "Ierland", price: 13.95 },
  { code: "SK", name: "Slowakije", price: 13.95 },
  { code: "HU", name: "Hongarije", price: 13.95 },
  { code: "SI", name: "Slovenië", price: 13.95 },
  { code: "SE", name: "Zweden", price: 13.95 },
  { code: "PT", name: "Portugal", price: 14.95 },
  { code: "HR", name: "Kroatië", price: 14.95 },
  { code: "RO", name: "Roemenië", price: 14.95 },
  { code: "BG", name: "Bulgarije", price: 14.95 },
  { code: "FI", name: "Finland", price: 14.95 },
  { code: "EE", name: "Estland", price: 14.95 },
  { code: "LV", name: "Letland", price: 14.95 },
  { code: "LT", name: "Litouwen", price: 14.95 },
  { code: "GR", name: "Griekenland", price: 15.95 },
  { code: "CY", name: "Cyprus", price: 16.95 },
  { code: "MT", name: "Malta", price: 16.95 },
];

export const SHIPPING_COUNTRY_MAP: Record<string, CountryShipping> = Object.fromEntries(
  SHIPPING_COUNTRIES.map((c) => [c.code, c]),
);

export const DEFAULT_COUNTRY = "NL";

/** Verzendkosten (incl. btw) voor een land; gratis alleen NL/BE boven de drempel. */
export function shippingForCountry(grossSubtotal: number, code: string = DEFAULT_COUNTRY): number {
  const c = SHIPPING_COUNTRY_MAP[code] ?? SHIPPING_COUNTRY_MAP[DEFAULT_COUNTRY];
  if (grossSubtotal <= 0) return 0;
  if (c.freeOver != null && grossSubtotal >= c.freeOver) return 0;
  return c.price;
}

/** Heeft dit land gratis verzending (boven de drempel)? — alleen NL/BE. */
export function hasFreeShipping(code: string): boolean {
  return SHIPPING_COUNTRY_MAP[code]?.freeOver != null;
}
