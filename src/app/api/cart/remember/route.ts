import { NextResponse } from "next/server";
import { rememberCart, type PendingCartItem } from "@/lib/store/pending-cart";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Bewaar de winkelwagen van een (checkout-)klant voor de vergeet-herinnering. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    email?: string;
    name?: string;
    items?: PendingCartItem[];
    total?: number;
  };
  const email = String(body.email ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email) || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const items: PendingCartItem[] = body.items.slice(0, 30).map((i) => ({
    title: String(i.title ?? "").slice(0, 160),
    quantity: Math.max(1, Math.floor(Number(i.quantity) || 1)),
    price: Math.max(0, Number(i.price) || 0),
    image: i.image ? String(i.image).slice(0, 400) : undefined,
    slug: i.slug ? String(i.slug).slice(0, 160) : undefined,
  }));
  const total = Math.max(
    0,
    Number(body.total) || items.reduce((s, i) => s + i.price * i.quantity, 0),
  );

  await rememberCart({
    email,
    name: body.name ? String(body.name).slice(0, 120) : undefined,
    items,
    total,
  });
  return NextResponse.json({ ok: true });
}
