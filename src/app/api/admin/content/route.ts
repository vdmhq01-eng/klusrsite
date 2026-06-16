import { NextResponse } from "next/server";
import { getAdminSession } from "@/auth";
import { saveProductContent, type ProductContentType } from "@/lib/store/product-content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TYPES: ProductContentType[] = ["description", "specifications", "faqs", "seo"];

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
