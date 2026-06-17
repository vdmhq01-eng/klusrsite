// Server-only: importeert `getLocale` (next/headers) en de vertaal-overlays.
// Mag NIET vanuit een client-component geïmporteerd worden — gebruik hiervoor de
// gewone accessors in `products.ts` (die blijven NL/bron). De import van
// next/headers (via getLocale) dwingt server-only gebruik al af.
import type { Product } from "@/types";
import { getLocale } from "@/lib/i18n/server";
import { i18nEnabled, type Locale } from "@/lib/i18n/config";
import {
  getProduct,
  getProductById,
  getProductsByCategory,
  getProductsBySubCategory,
} from "./products";

import enOverlay from "./i18n/products.en.json";
import frOverlay from "./i18n/products.fr.json";
import deOverlay from "./i18n/products.de.json";

/** Vorm van één vertaalde productentry in een overlay-bestand. */
type Overlay = Record<
  string,
  { title?: string; description?: string; highlights?: string[] }
>;

const OVERLAYS: Partial<Record<Locale, Overlay>> = {
  en: enOverlay as Overlay,
  fr: frOverlay as Overlay,
  de: deOverlay as Overlay,
};

/**
 * Pas de vertaal-overlay van de huidige locale toe op één product. Valt veilig
 * terug op de Nederlandse bron wanneer: i18n uitstaat, de locale NL is, of er
 * (nog) geen vertaling voor dit product bestaat. Zo blijft de site met de
 * feature-flag UIT byte-identiek en breekt niets vóórdat de batch heeft gedraaid.
 */
export function localizeProduct(product: Product | undefined): Product | undefined {
  if (!product || !i18nEnabled()) return product;
  const locale = getLocale();
  const overlay = OVERLAYS[locale];
  if (!overlay) return product;
  const tr = overlay[product.id];
  if (!tr) return product;
  return {
    ...product,
    title: tr.title || product.title,
    description: tr.description || product.description,
    highlights: tr.highlights?.length ? tr.highlights : product.highlights,
  };
}

/** Lokaliseer een lijst producten (bv. zoekresultaten of een categorie). */
export function localizeProducts(list: Product[]): Product[] {
  if (!i18nEnabled() || getLocale() === "nl") return list;
  return list.map((p) => localizeProduct(p) as Product);
}

/* Gelokaliseerde tegenhangers van de accessors in products.ts. Server-only. */

export function getLocalizedProduct(slug: string): Product | undefined {
  return localizeProduct(getProduct(slug));
}

export function getLocalizedProductById(id: string): Product | undefined {
  return localizeProduct(getProductById(id));
}

export function getLocalizedProductsByCategory(categorySlug: string): Product[] {
  return localizeProducts(getProductsByCategory(categorySlug));
}

export function getLocalizedProductsBySubCategory(sub: string): Product[] {
  return localizeProducts(getProductsBySubCategory(sub));
}
