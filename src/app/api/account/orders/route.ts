import { NextResponse } from "next/server";
import { getSession } from "@/auth";
import { listOrdersByEmail } from "@/lib/store/orders";
import type { CartItem } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Bestelhistorie van de ingelogde klant (op het e-mailadres van de sessie),
 * plus handige afgeleiden zoals de laatst gekochte kleur en recente artikelen
 * — zodat de klant snel kan herbestellen.
 */
export async function GET() {
  const session = await getSession();
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const orders = await listOrdersByEmail(email);

  // Laatst gekochte kleur: uit de meest recente order met een gekozen kleur.
  let lastColor: NonNullable<CartItem["selectedColor"]> | undefined;
  for (const o of orders) {
    const withColor = o.items.find((i) => i.selectedColor);
    if (withColor?.selectedColor) {
      lastColor = withColor.selectedColor;
      break;
    }
  }

  // Recent gekochte artikelen (uniek op product), handig voor herbestellen.
  const seen = new Set<string>();
  const recentItems = orders
    .flatMap((o) => o.items)
    .filter((i) => (seen.has(i.productId) ? false : (seen.add(i.productId), true)))
    .slice(0, 6);

  const stats = {
    orderCount: orders.length,
    totalSpent: orders.reduce((s, o) => s + o.total, 0),
    totalSaved: orders.reduce((s, o) => s + (o.kluspasSavings || 0), 0),
    openCount: orders.filter(
      (o) => !["delivered", "canceled", "failed", "expired"].includes(o.paymentStatus),
    ).length,
  };

  return NextResponse.json({ orders, lastColor, recentItems, stats });
}
