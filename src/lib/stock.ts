import type { StoreStock } from "@/types";

/**
 * Voorraadlogica voor de webshop. Online verkopen we uitsluitend vanuit de
 * hoofdvestiging (Nijverdal), en pas vanaf een instelbare veiligheidsvoorraad.
 * Zakt de Nijverdal-voorraad onder die drempel, dan is het product niet
 * leverbaar (wordt als uitverkocht getoond en niet verkocht).
 */

/** Hoofdvestiging waaruit we online leveren. */
export const PRIMARY_STORE_ID = "nijverdal";

/** Standaard veiligheidsvoorraad: onder dit aantal verkopen we niet online. */
export const DEFAULT_SAFETY_STOCK = 2;

/** Voorraad van de hoofdvestiging (Nijverdal). */
export function primaryStock(stockByStore: StoreStock[] | undefined): number {
  if (!stockByStore?.length) return 0;
  return stockByStore.find((s) => s.storeId === PRIMARY_STORE_ID)?.quantity ?? 0;
}

/**
 * Online beschikbare voorraad: de Nijverdal-voorraad, of 0 zodra die onder de
 * veiligheidsvoorraad zakt (dan tonen/verkopen we het product niet online).
 */
export function onlineStock(
  stockByStore: StoreStock[] | undefined,
  safety: number = DEFAULT_SAFETY_STOCK,
): number {
  const qty = primaryStock(stockByStore);
  return qty >= safety ? qty : 0;
}

/** Is het product online leverbaar? (Nijverdal-voorraad ≥ veiligheidsvoorraad) */
export function inStockOnline(
  stockByStore: StoreStock[] | undefined,
  safety: number = DEFAULT_SAFETY_STOCK,
): boolean {
  return primaryStock(stockByStore) >= safety;
}
