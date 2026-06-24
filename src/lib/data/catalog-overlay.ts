import type { Product } from "@/types";

/**
 * KLUSR catalogus-overlay: door de beheerder ingestelde prijs-/zichtbaarheids-
 * overrides en eigen (custom/dropship) producten, bovenop de Tilroy-feed.
 *
 * Net als `price-overrides.generated.json` wordt dit bij de build vastgelegd in
 * `catalog-overrides.generated.json` + `custom-products.generated.json` (zie
 * scripts/build-catalog-overrides.mjs) en hier synchroon toegepast — de webshop
 * blijft statisch/ISR. Met lege bestanden is dit een no-op (geen gedragswijziging).
 */

export interface ProductOverride {
  price?: number;
  kluspasPrice?: number;
  compareAtPrice?: number;
  /** false = verbergen in de webshop. */
  active?: boolean;
}

export interface CatalogOverrides {
  products?: Record<string, ProductOverride>;
  variants?: Record<string, ProductOverride>;
}

const num = (v: unknown): number | undefined =>
  typeof v === "number" && isFinite(v) && v >= 0 ? Math.round(v * 100) / 100 : undefined;

function applyOverride<T extends { price: number; kluspasPrice: number; compareAtPrice?: number }>(
  item: T,
  o?: ProductOverride,
): T {
  if (!o) return item;
  const price = num(o.price);
  const kluspasPrice = num(o.kluspasPrice);
  const compareAtPrice = num(o.compareAtPrice);
  return {
    ...item,
    ...(price != null ? { price } : {}),
    ...(kluspasPrice != null ? { kluspasPrice } : {}),
    ...(compareAtPrice != null ? { compareAtPrice } : {}),
  };
}

/**
 * Pas de beheer-overlay toe op de basiscatalogus: prijs-/pas-/adviesprijs-
 * overrides per product en per variant, verberg gedeactiveerde producten en voeg
 * eigen producten toe. Puur en fail-safe.
 */
export function applyCatalogOverlay(
  base: Product[],
  overrides: CatalogOverrides,
  custom: Product[],
): Product[] {
  const pov = overrides.products ?? {};
  const vov = overrides.variants ?? {};
  const hasVarOverrides = Object.keys(vov).length > 0;

  const merged: Product[] = [];
  for (const p of base) {
    const po = pov[p.id];
    if (po?.active === false) continue; // verborgen

    let next = p;
    if (hasVarOverrides) {
      next = { ...next, variants: next.variants.map((v) => applyOverride(v, vov[v.id])) };
    }
    if (po) {
      next = applyOverride(next, po);
    }
    merged.push(next);
  }

  // Eigen producten achteraan (alleen geldige records).
  const customValid = (custom ?? []).filter(
    (p) => p && p.id && p.slug && Array.isArray(p.variants),
  );
  return [...merged, ...customValid];
}
