import { NextResponse } from "next/server";
import { getPaymentStatus, mapMollieStatus } from "@/lib/payments";
import { getOrder, getOrderByMollieId, updateOrderStatus } from "@/lib/store/orders";

export const runtime = "nodejs";

/**
 * Mollie webhook. Mollie POSTs `id=<paymentId>` (form-encoded) whenever a
 * payment's status changes. We re-fetch the payment (never trust the body)
 * and update the corresponding order.
 */
export async function POST(req: Request) {
  try {
    let paymentId: string | undefined;

    const contentType = req.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const body = await req.json();
      paymentId = body.id;
    } else {
      const form = await req.formData();
      paymentId = form.get("id")?.toString();
    }

    if (!paymentId) {
      return NextResponse.json({ error: "Geen payment id" }, { status: 400 });
    }

    const status = await getPaymentStatus(paymentId);
    if (!status) {
      // Mollie not configured (demo) — nothing to verify.
      return NextResponse.json({ ok: true, demo: true });
    }

    // Prefer the orderId from Mollie metadata, fall back to the payment-id index.
    const order =
      (status.orderId ? getOrder(status.orderId) : undefined) ??
      getOrderByMollieId(paymentId);
    if (order) {
      updateOrderStatus(order.id, mapMollieStatus(status.status));
    }

    // Always return 200 so Mollie stops retrying.
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/checkout/webhook]", err);
    // Still return 200 to avoid infinite Mollie retries on transient errors.
    return NextResponse.json({ ok: true });
  }
}
