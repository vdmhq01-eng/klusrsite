import { NextResponse } from "next/server";
import { z } from "zod";
import { createOrder, setMolliePaymentId, updateOrderStatus } from "@/lib/store/orders";
import { createPayment } from "@/lib/payments";
import { triggerCartReminder } from "@/lib/mailchimp";
import { fulfillPaidOrder, sendOrderConfirmationEmail } from "@/lib/order-fulfillment";

export const runtime = "nodejs";

const cartItemSchema = z.object({
  key: z.string(),
  productId: z.string(),
  variantId: z.string(),
  title: z.string(),
  brand: z.string(),
  image: z.string(),
  variantLabel: z.string(),
  slug: z.string(),
  quantity: z.number().int().positive(),
  price: z.number(),
  kluspasPrice: z.number(),
  selectedColor: z
    .object({
      name: z.string(),
      code: z.string(),
      hex: z.string(),
      collection: z.string().optional(),
    })
    .optional(),
});

const bodySchema = z.object({
  customer: z.object({
    email: z.string().email(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    street: z.string().min(1),
    postalCode: z.string().min(1),
    city: z.string().min(1),
    phone: z.string().optional(),
  }),
  items: z.array(cartItemSchema).min(1),
  subtotal: z.number(),
  shipping: z.number(),
  total: z.number(),
  kluspasSavings: z.number(),
  method: z.string().optional(),
  cardToken: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Ongeldige bestelgegevens", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;

    // 1. Persist the order (status "open").
    const order = createOrder({
      customer: data.customer,
      items: data.items,
      subtotal: data.subtotal,
      shipping: data.shipping,
      total: data.total,
      kluspasSavings: data.kluspasSavings,
      paymentMethod: data.method,
    });

    // 2. Create the Mollie payment (or a simulated one in demo mode).
    const origin =
      req.headers.get("origin") ||
      (() => {
        try {
          return new URL(req.url).origin;
        } catch {
          return undefined;
        }
      })();

    const payment = await createPayment({
      orderId: order.id,
      reference: order.reference,
      amount: data.total,
      method: data.method,
      baseUrl: origin,
      cardToken: data.cardToken,
    });

    if (payment.molliePaymentId) {
      setMolliePaymentId(order.id, payment.molliePaymentId);
    }

    // In demo mode there is no webhook, so mark as paid and fulfil right away.
    if (payment.demo) {
      updateOrderStatus(order.id, "paid");
      const paidOrder = { ...order, paymentStatus: "paid" as const };
      // Push the paid order to Channable → Tilroy (demo-safe).
      void fulfillPaidOrder(paidOrder).catch(() => {});
      // Send the branded order confirmation (Resend; no-op without a key).
      void sendOrderConfirmationEmail(paidOrder).catch(() => {});
    }

    // 3. Fire-and-forget abandoned-cart safety net (Mailchimp, demo-safe).
    void triggerCartReminder(data.customer.email).catch(() => {});

    return NextResponse.json({
      orderId: order.id,
      reference: order.reference,
      checkoutUrl: payment.checkoutUrl,
      demo: payment.demo,
    });
  } catch (err) {
    console.error("[api/checkout/create-payment]", err);
    // Toon de echte (Mollie) reden zodat fouten te diagnosticeren zijn.
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Betaling aanmaken mislukt: ${detail}` },
      { status: 500 },
    );
  }
}
