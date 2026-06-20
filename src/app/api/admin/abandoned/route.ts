import { NextResponse } from "next/server";
import { getAdminSession } from "@/auth";
import { listOrders } from "@/lib/store/orders";
import type { Order, OrderStatus } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * "Afgebroken checkout" = een order die is aangemaakt (betaling gestart) maar
 * nooit `paid` (of verder) is geworden. Dit zijn de klanten die in de betaalstap
 * afhaken. We tonen ze los van het normale orderoverzicht zodat de eigenaar ziet
 * waar de omzet blijft liggen.
 */
const ABANDONED_STATUSES: OrderStatus[] = [
  "open",
  "pending",
  "expired",
  "canceled",
  "failed",
];

const isAbandoned = (o: Order) => ABANDONED_STATUSES.includes(o.paymentStatus);

/** Deep-link naar de betaling in het Mollie-dashboard (om de oorzaak te bekijken). */
function mollieDashboardUrl(id?: string): string | undefined {
  return id ? `https://my.mollie.com/dashboard/payments/${id}` : undefined;
}

export interface AbandonedOrderRow {
  id: string;
  reference: string;
  createdAt: string;
  status: OrderStatus;
  isTest?: boolean;
  customerName: string;
  email: string;
  paymentMethod?: string;
  molliePaymentId?: string;
  /** Link naar de betaling in het Mollie-dashboard (indien een payment-id bekend is). */
  mollieDashboardUrl?: string;
  items: { title: string; quantity: number }[];
  total: number;
}

export interface AbandonedResponse {
  rows: AbandonedOrderRow[];
  /** Per-status aantallen over de volledige (niet-betaalde) set. */
  counts: Record<OrderStatus, number>;
  total: number;
  /** Totale waarde die "blijft liggen" (som van de totalen). */
  lostValue: number;
}

/**
 * Admin: lijst van afgebroken checkouts (niet-betaalde orders), nieuwste eerst.
 * Self-guarded met `getAdminSession()` → 401 voor niet-admins. Read-only.
 *
 * Anders dan /api/admin/orders filteren we test-orders hier NIET weg: orders die
 * in Mollie's TEST-modus zijn aangemaakt zijn juist een belangrijk signaal dat
 * de winkel nog niet "live" staat — precies wat de eigenaar moet zien.
 */
export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // listOrders() levert al nieuwste-eerst.
  const abandoned = (await listOrders()).filter(isAbandoned);

  const counts = {
    open: 0,
    pending: 0,
    paid: 0,
    authorized: 0,
    shipped: 0,
    delivered: 0,
    canceled: 0,
    failed: 0,
    expired: 0,
    refunded: 0,
  } as Record<OrderStatus, number>;

  let lostValue = 0;
  const rows: AbandonedOrderRow[] = abandoned.map((o) => {
    counts[o.paymentStatus] += 1;
    lostValue += o.total;
    return {
      id: o.id,
      reference: o.reference,
      createdAt: o.createdAt,
      status: o.paymentStatus,
      isTest: o.isTest,
      customerName: `${o.customer.firstName} ${o.customer.lastName}`.trim(),
      email: o.customer.email,
      paymentMethod: o.paymentMethod,
      molliePaymentId: o.molliePaymentId,
      mollieDashboardUrl: mollieDashboardUrl(o.molliePaymentId),
      items: o.items.map((i) => ({ title: i.title, quantity: i.quantity })),
      total: o.total,
    };
  });

  const response: AbandonedResponse = {
    rows,
    counts,
    total: rows.length,
    lostValue,
  };

  return NextResponse.json(response);
}
