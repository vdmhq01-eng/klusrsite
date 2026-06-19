import { NextResponse } from "next/server";
import { getAdminSession } from "@/auth";
import { getActieProducts, getBestsellers, resolveImageUrl } from "@/lib/data/products";
import { generateNewsletterDraft } from "@/lib/ai/newsletter";
import type { Product } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Compacte productvorm voor de admin-UI (incl. eerste afbeelding). */
function toCard(p: Product) {
  const first = p.images?.[0];
  return {
    id: p.id,
    title: p.title,
    brand: p.brand,
    slug: p.slug,
    image: first ? resolveImageUrl(first) : "",
    price: p.price,
    kluspasPrice: p.kluspasPrice,
    compareAtPrice: p.compareAtPrice ?? null,
  };
}

/** Kies de uit te lichten producten: eerst acties, aangevuld met bestsellers. */
function pickFeatured(count: number): Product[] {
  const target = Math.min(Math.max(count, 1), 12);
  const seen = new Set<string>();
  const out: Product[] = [];
  const push = (list: Product[]) => {
    for (const p of list) {
      if (out.length >= target) break;
      if (seen.has(p.id)) continue;
      seen.add(p.id);
      out.push(p);
    }
  };
  push(getActieProducts(target));
  if (out.length < target) push(getBestsellers(target * 2));
  return out.slice(0, target);
}

/**
 * Admin: genereer een nieuwsbrief-concept (AI of mock) met uitgelichte producten.
 * Body (optioneel): { count?, theme? }.
 */
export async function POST(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { count?: number; theme?: string } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    /* lege body is prima — gebruik standaardwaarden */
  }

  const count = typeof body.count === "number" && body.count > 0 ? Math.floor(body.count) : 6;
  const theme = typeof body.theme === "string" ? body.theme.slice(0, 120) : undefined;

  const featured = pickFeatured(count);
  const draft = await generateNewsletterDraft(featured, { theme });

  return NextResponse.json({
    subject: draft.subject,
    preheader: draft.preheader,
    intro: draft.intro,
    products: featured.map(toCard),
    source: draft.source,
  });
}
