import { NextResponse } from "next/server";
import { getAdminSession } from "@/auth";
import { getProductById } from "@/lib/data/products";
import { newsletterEmail } from "@/lib/email/templates";
import type { Product } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Resolve een lijst product-id's naar producten (in opgegeven volgorde). */
function resolveProducts(ids: unknown): Product[] {
  if (!Array.isArray(ids)) return [];
  const out: Product[] = [];
  for (const id of ids) {
    if (typeof id !== "string") continue;
    const p = getProductById(id);
    if (p) out.push(p);
  }
  return out;
}

/**
 * Admin: render de nieuwsbrief-HTML voor een live preview (iframe srcDoc).
 * Body: { subject, preheader, intro, productIds }.
 */
export async function POST(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: {
    subject?: string;
    preheader?: string;
    intro?: string;
    productIds?: unknown;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }

  const products = resolveProducts(body.productIds);
  const { html } = newsletterEmail({
    subject: (body.subject || "KLUSR Nieuwsbrief").trim(),
    preheader: (body.preheader || "").trim(),
    intro: body.intro || "",
    products,
  });

  return NextResponse.json({ html });
}
