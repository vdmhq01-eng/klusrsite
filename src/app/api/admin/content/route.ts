import { NextResponse } from "next/server";
import { getAdminSession } from "@/auth";
import {
  getProductContent,
  saveProductContent,
  type ProductContentType,
} from "@/lib/store/product-content";
import { isKvEnabled } from "@/lib/store/kv";
import { products } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TYPES: ProductContentType[] = ["description", "specifications", "faqs", "seo"];

/**
 * Admin-diagnose: laat zien of er gepubliceerde AI-content in de store (KV) staat
 * voor een product. Handig om "voltooid maar niet zichtbaar" te herleiden:
 * staat de FAQ wél in KV maar niet op de pagina → caching/ISR; staat 'ie niet in
 * KV → de generatie heeft niets bewaard.
 *
 * Gebruik: /api/admin/content?slug=<product-slug>  (of ?productId=<id>)
 */
export async function GET(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug")?.trim() || "";
  let productId = url.searchParams.get("productId")?.trim() || "";
  if (!productId && slug) {
    const match = products.find((p) => p.slug === slug);
    if (match) productId = match.id;
  }
  if (!productId) {
    return NextResponse.json(
      { error: "Geef ?slug=<product-slug> of ?productId=<id> mee." },
      { status: 400 },
    );
  }

  const stored = await getProductContent(productId);
  const summary: Record<string, { present: boolean; length: number; updatedAt?: string }> = {};
  for (const t of TYPES) {
    const c = stored?.[t];
    summary[t] = {
      present: Boolean(c?.content?.trim()),
      length: c?.content?.trim().length ?? 0,
      updatedAt: c?.updatedAt,
    };
  }

  return NextResponse.json({
    kvEnabled: isKvEnabled(),
    productId,
    slug: slug || null,
    stored: summary,
    faqPreview: stored?.faqs?.content?.slice(0, 240) ?? null,
  });
}

/** Admin: publiceer (bewaar) goedgekeurde AI-content voor een product. */
export async function POST(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let data: Record<string, unknown>;
  try {
    data = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid-json" }, { status: 400 });
  }

  const productId = typeof data.productId === "string" ? data.productId : "";
  const type = data.type as ProductContentType;
  const content = typeof data.content === "string" ? data.content : "";
  if (!productId || !TYPES.includes(type) || !content.trim()) {
    return NextResponse.json({ ok: false, error: "invalid-input" }, { status: 400 });
  }

  await saveProductContent(productId, type, content);
  return NextResponse.json({ ok: true });
}
