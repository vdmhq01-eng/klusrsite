import { NextResponse } from "next/server";
import { listPendingCarts, markReminded } from "@/lib/store/pending-cart";
import { sendAbandonedCart } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CRON_SECRET = process.env.CRON_SECRET;
const MIN_AGE_MS = 60 * 60 * 1000; // 1 uur inactief
const MAX_AGE_MS = 48 * 60 * 60 * 1000; // niet ouder dan 48 uur

/**
 * Stuurt "winkelwagen-vergeten" herinneringen. Bedoeld als Vercel Cron-route
 * (zie vercel.json). Eén herinnering per winkelwagen.
 */
export async function GET(req: Request) {
  // Vercel Cron stuurt "Authorization: Bearer <CRON_SECRET>" mee als CRON_SECRET
  // is gezet. Zo niet, dan staat de route open (zet CRON_SECRET om te beveiligen).
  if (CRON_SECRET) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const now = Date.now();
  const carts = await listPendingCarts();
  let sent = 0;
  for (const cart of carts) {
    if (cart.reminded) continue;
    const age = now - new Date(cart.updatedAt).getTime();
    if (age < MIN_AGE_MS || age > MAX_AGE_MS) continue;
    const res = await sendAbandonedCart({
      email: cart.email,
      name: cart.name,
      items: cart.items,
      total: cart.total,
    });
    await markReminded(cart.email);
    if (res.ok) sent++;
  }

  return NextResponse.json({ ok: true, checked: carts.length, sent });
}
