import { NextResponse } from "next/server";
import {
  getProductById,
  getAccessorySuggestions,
  getBestsellers,
} from "@/lib/data/products";
import type { Product } from "@/types";

export const runtime = "nodejs";

/**
 * Lightweight product lookups for client components, so they don't bundle the
 * full catalogus. Supports:
 *   /api/products?ids=a,b,c            → those products (order preserved)
 *   /api/products?list=accessory&...   → accessory suggestions
 *   /api/products?list=bestsellers     → bestsellers
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ids = searchParams.get("ids");
  const list = searchParams.get("list");
  const limit = Math.min(24, Number(searchParams.get("limit")) || 8);
  const exclude = (searchParams.get("exclude") ?? "").split(",").filter(Boolean);

  let products: Product[] = [];

  if (ids) {
    products = ids
      .split(",")
      .map((id) => getProductById(id))
      .filter((p): p is Product => Boolean(p));
  } else if (list === "accessory") {
    products = getAccessorySuggestions(limit, exclude);
  } else if (list === "bestsellers") {
    products = getBestsellers(limit).filter((p) => !exclude.includes(p.id));
  }

  return NextResponse.json({ products });
}
