import { NextResponse } from "next/server";
import { getPaymentStatus, mapMollieStatus } from "@/lib/payments";
import { getOrder, getOrderByMollieId, updateOrderStatus } from "@/lib/store/orders";
import { fulfillPaidOrder, sendOrderConfirmationEmail } from "@/lib/order-fulfillment";
import { sendPushToAdmins } from "@/lib/push";
import { formatPrice } from "@/lib/utils";

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
      (status.orderId ? await getOrder(status.orderId) : undefined) ??
      (await getOrderByMollieId(paymentId));
    if (order) {
      const mapped = mapMollieStatus(status.status);
      // Terugbetaling herkennen: een (deels) gerefunde betaling.
      const refunded = (status.amountRefunded ?? 0) > 0;
      const fullyRefunded =
        refunded && status.amount != null && (status.amountRefunded ?? 0) >= status.amount - 0.005;
      const finalStatus = fullyRefunded ? "refunded" : mapped;
      const isTest = status.mode === "test" ? true : undefined;
      await updateOrderStatus(order.id, finalStatus, {
        isTest,
        refundedAmount: refunded ? status.amountRefunded : undefined,
      });
      // Alleen bij een échte, niet-terugbetaalde, niet-test betaling: fulfilen + mailen.
      if (!refunded && !isTest && (mapped === "paid" || mapped === "authorized")) {
        const paidOrder = { ...order, paymentStatus: mapped };
        await fulfillPaidOrder(paidOrder);
        // Send the branded confirmation once (claim guards against retries).
        await sendOrderConfirmationEmail(paidOrder);
        // Beheerders een push sturen over de nieuwe bestelling. Best-effort en
        // afgeschermd (gooit nooit) zodat het de webhook-respons niet raakt.
        void sendPushToAdmins({
          title: "Nieuwe bestelling",
          body: `${order.reference} · ${formatPrice(order.total)}`,
          url: "/admin",
        });
      }
    }

    // Always return 200 so Mollie stops retrying.
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/checkout/webhook]", err);
    // Still return 200 to avoid infinite Mollie retries on transient errors.
    return NextResponse.json({ ok: true });
  }
}
