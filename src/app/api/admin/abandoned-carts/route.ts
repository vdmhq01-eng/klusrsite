import { NextResponse } from "next/server";
import { getAdminSession } from "@/auth";
import { listPendingCarts } from "@/lib/store/pending-cart";
import { listOrders } from "@/lib/store/orders";
import type { Order, OrderStatus } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * "Verlaten winkelwagen" = iemand had producten in het mandje en vulde op de
 * checkout een e-mailadres in, maar maakte (nog) geen betaling aan. We bewaren
 * deze snapshots in de pending-cart store (zie src/lib/store/pending-cart.ts),
 * die via de bestaande, fire-and-forget beacon op de checkout wordt gevuld.
 *
 * Bij een betaalde bestelling wordt de pending-cart al opgeruimd
 * (clearPendingCart in order-fulfillment). Voor de zekerheid filteren we hier
 * NOG een keer alle carts weg waarvan het e-mailadres later tóch een betaalde
 * order werd — zo tonen we alleen écht verlaten mandjes.
 */
const PAID_STATUSES: OrderStatus[] = ["paid", "authorized", "shipped", "delivered"];
const isPaid = (o: Order) => PAID_STATUSES.includes(o.paymentStatus);

export interface AbandonedCartRow {
  email: string;
  name?: string;
  items: { title: string; quantity: number; price: number }[];
  total: number;
  updatedAt: string;
  /** True als er al een herinnering ("winkelwagen-vergeten" mail) is verstuurd. */
  reminded: boolean;
}

export interface AbandonedCartsResponse {
  rows: AbandonedCartRow[];
  total: number;
  /** Totale waarde van de verlaten mandjes. */
  value: number;
}

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const [carts, orders] = await Promise.all([listPendingCarts(), listOrders()]);

  // E-mails die ooit tot een betaalde order leidden → niet langer "verlaten".
  const paidEmails = new Set(
    orders.filter(isPaid).map((o) => o.customer.email.trim().toLowerCase()),
  );

  const rows: AbandonedCartRow[] = carts
    .filter((c) => !paidEmails.has(c.email.trim().toLowerCase()))
    .map((c) => ({
      email: c.email,
      name: c.name,
      items: c.items.map((i) => ({
        title: i.title,
        quantity: i.quantity,
        price: i.price,
      })),
      total: c.total,
      updatedAt: c.updatedAt,
      reminded: c.reminded,
    }))
    // Nieuwste eerst.
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));

  const response: AbandonedCartsResponse = {
    rows,
    total: rows.length,
    value: rows.reduce((s, r) => s + r.total, 0),
  };

  return NextResponse.json(response);
}
