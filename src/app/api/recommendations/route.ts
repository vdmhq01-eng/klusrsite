import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { products, getProductById } from "@/lib/data/products";
import { listOrdersByEmail } from "@/lib/store/orders";
import type { Product } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Persoonlijke aanbevelingen op basis van sitegebruik (bekeken producten,
 * meegestuurd vanaf de client) + bestelhistorie (van de ingelogde klant).
 */
export async function POST(req: Request) {
  let body: { ids?: unknown };
  try {
    body = (await req.json()) as { ids?: unknown };
  } catch {
    body = {};
  }
  const viewedIds = Array.isArray(body.ids)
    ? body.ids.filter((x): x is string => typeof x === "string").slice(0, 30)
    : [];

  // Bestelhistorie van de ingelogde klant erbij betrekken.
  const session = await auth();
  const email = session?.user?.email ?? undefined;
  const orderedIds: string[] = [];
  if (email) {
    try {
      const orders = await listOrdersByEmail(email);
      for (const o of orders) for (const it of o.items) if (it.productId) orderedIds.push(it.productId);
    } catch {
      /* geen historie beschikbaar */
    }
  }

  const seedIds = [...new Set([...viewedIds, ...orderedIds])];
  const seed = seedIds
    .map((id) => getProductById(id))
    .filter((p): p is Product => Boolean(p));

  if (seed.length === 0) {
    return NextResponse.json({ recentlyViewed: [], forYou: [] });
  }

  // Voorkeuren afleiden uit categorieën en merken.
  const catCount = new Map<string, number>();
  const brandCount = new Map<string, number>();
  for (const p of seed) {
    catCount.set(p.category, (catCount.get(p.category) || 0) + 1);
    if (p.brand) brandCount.set(p.brand, (brandCount.get(p.brand) || 0) + 1);
  }
  const topCats = new Set([...catCount.entries()].sort((a, b) => b[1] - a[1]).map(([c]) => c));
  const seedSet = new Set(seedIds);

  // Score: voorkeurscategorie + merk-boost + rating + bestseller.
  const forYou = products
    .filter((p) => !seedSet.has(p.id) && topCats.has(p.category))
    .map((p) => {
      let score = (catCount.get(p.category) || 0) * 2 + (p.rating || 0);
      if (p.brand && brandCount.has(p.brand)) score += 3;
      if (p.badges?.includes("BESTSELLER")) score += 1;
      return { p, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map((s) => s.p);

  const recentlyViewed = viewedIds
    .map((id) => getProductById(id))
    .filter((p): p is Product => Boolean(p))
    .slice(0, 12);

  return NextResponse.json({ recentlyViewed, forYou });
}
