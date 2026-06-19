import { NextResponse } from "next/server";
import { getAdminSession } from "@/auth";
import { products, getSubCategory } from "@/lib/data/products";
import { stores } from "@/lib/data/stores";
import { getCategoryTitle } from "@/lib/data/categories";
import type { Product } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Drempel waaronder een product als "bijna op" geldt (totale voorraad ≤ 5). */
const LOW_STOCK_THRESHOLD = 5;

type StockStatus = "uitverkocht" | "bijna-op" | "op-voorraad";

interface StockStoreLine {
  storeId: string;
  qty: number;
}

interface StockRow {
  id: string;
  title: string;
  brand: string;
  category: string;
  /** Nette categorie-titel (productsoort). */
  categoryTitle: string;
  subCategory?: string;
  /** Nette subcategorie-titel, indien aanwezig. */
  subCategoryTitle?: string;
  image?: string;
  totalStock: number;
  status: StockStatus;
  perStore: StockStoreLine[];
}

interface StockResponse {
  rows: StockRow[];
  brands: string[];
  categories: { slug: string; title: string }[];
  stores: { id: string; name: string }[];
  threshold: number;
  counts: { total: number; uitverkocht: number; bijnaOp: number; opVoorraad: number };
}

/**
 * Totale voorraad = som van de voorraad-per-winkel over álle varianten. Elke
 * variant draagt zijn eigen `stockByStore`; het product-niveau `stockByStore`
 * spiegelt in de feed niet betrouwbaar de som (soms alleen de eerste variant),
 * dus we tellen op variantniveau om dubbeltellen/onderrapportage te vermijden.
 */
function perStoreStock(p: Product): Map<string, number> {
  const acc = new Map<string, number>();
  const variants = p.variants?.length ? p.variants : [];
  if (variants.length) {
    for (const v of variants) {
      for (const s of v.stockByStore ?? []) {
        acc.set(s.storeId, (acc.get(s.storeId) ?? 0) + (s.quantity ?? 0));
      }
    }
  } else {
    // Vangnet: producten zonder varianten → product-niveau voorraad.
    for (const s of p.stockByStore ?? []) {
      acc.set(s.storeId, (acc.get(s.storeId) ?? 0) + (s.quantity ?? 0));
    }
  }
  return acc;
}

function statusOf(total: number): StockStatus {
  if (total <= 0) return "uitverkocht";
  if (total <= LOW_STOCK_THRESHOLD) return "bijna-op";
  return "op-voorraad";
}

/**
 * Admin: compacte voorraadlijst over de VOLLEDIGE catalogus (~2533 producten).
 * Self-guarded met `getAdminSession()` → 401 voor niet-admins. Read-only.
 */
export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const brandSet = new Set<string>();
  const categorySet = new Map<string, string>();
  let uitverkocht = 0;
  let bijnaOp = 0;
  let opVoorraad = 0;

  const rows: StockRow[] = products.map((p) => {
    const per = perStoreStock(p);
    // Houd de winkelvolgorde van stores.ts aan voor een stabiele weergave.
    const perStore: StockStoreLine[] = stores.map((s) => ({
      storeId: s.id,
      qty: per.get(s.id) ?? 0,
    }));
    const totalStock = perStore.reduce((sum, s) => sum + s.qty, 0);
    const status = statusOf(totalStock);

    if (status === "uitverkocht") uitverkocht++;
    else if (status === "bijna-op") bijnaOp++;
    else opVoorraad++;

    if (p.brand) brandSet.add(p.brand);
    if (p.category && !categorySet.has(p.category)) {
      categorySet.set(p.category, getCategoryTitle(p.category));
    }

    const sub = p.subCategory
      ? getSubCategory(p.category, p.subCategory)
      : undefined;

    return {
      id: p.id,
      title: p.title,
      brand: p.brand,
      category: p.category,
      categoryTitle: getCategoryTitle(p.category),
      subCategory: p.subCategory,
      subCategoryTitle: sub?.title,
      image: p.images?.[0],
      totalStock,
      status,
      perStore,
    };
  });

  const response: StockResponse = {
    rows,
    brands: [...brandSet].sort((a, b) => a.localeCompare(b, "nl")),
    categories: [...categorySet.entries()]
      .map(([slug, title]) => ({ slug, title }))
      .sort((a, b) => a.title.localeCompare(b.title, "nl")),
    stores: stores.map((s) => ({ id: s.id, name: s.city })),
    threshold: LOW_STOCK_THRESHOLD,
    counts: { total: rows.length, uitverkocht, bijnaOp, opVoorraad },
  };

  return NextResponse.json(response);
}
