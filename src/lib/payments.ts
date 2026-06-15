import createMollieClient, { type MollieClient } from "@mollie/api-client";

/**
 * Mollie payments helper. When MOLLIE_API_KEY is missing the app runs in demo
 * mode: payments are simulated as immediately paid so the full checkout →
 * thank-you flow is testable without credentials.
 */

const API_KEY = process.env.MOLLIE_API_KEY;
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.klus-r.nl").replace(/\/$/, "");

let client: MollieClient | null = null;

export function isMollieConfigured(): boolean {
  return Boolean(API_KEY);
}

function getClient(): MollieClient | null {
  if (!isMollieConfigured()) return null;
  if (!client) client = createMollieClient({ apiKey: API_KEY! });
  return client;
}

/** Map our internal method ids to Mollie method ids. */
const methodMap: Record<string, string | undefined> = {
  ideal: "ideal",
  bancontact: "bancontact",
  creditcard: "creditcard",
  klarna: "klarnapaylater",
};

export interface CreatePaymentInput {
  orderId: string;
  reference: string;
  amount: number;
  method?: string;
  description?: string;
  /** Basis-URL voor redirect/webhook (uit de request-origin); valt terug op SITE_URL. */
  baseUrl?: string;
}

export interface CreatePaymentResult {
  checkoutUrl: string;
  molliePaymentId?: string;
  demo: boolean;
}

export async function createPayment(
  input: CreatePaymentInput,
): Promise<CreatePaymentResult> {
  const mollie = getClient();
  const value = input.amount.toFixed(2);
  const base = (input.baseUrl || SITE_URL).replace(/\/$/, "");

  // Demo mode — no real redirect; go straight to the thank-you page.
  if (!mollie) {
    return {
      checkoutUrl: `${base}/bedankt?order=${input.orderId}&demo=1`,
      demo: true,
    };
  }

  const payment = await mollie.payments.create({
    amount: { currency: "EUR", value },
    description: input.description ?? `KLUSR bestelling ${input.reference}`,
    redirectUrl: `${base}/bedankt?order=${input.orderId}`,
    webhookUrl: process.env.MOLLIE_WEBHOOK_URL || `${base}/api/checkout/webhook`,
    metadata: { orderId: input.orderId, reference: input.reference },
    ...(input.method && methodMap[input.method]
      ? { method: methodMap[input.method] as never }
      : {}),
  });

  return {
    checkoutUrl: payment.getCheckoutUrl() ?? `${base}/bedankt?order=${input.orderId}`,
    molliePaymentId: payment.id,
    demo: false,
  };
}

/** Fetch a Mollie payment's status (used by the webhook). */
export async function getPaymentStatus(
  paymentId: string,
): Promise<{ status: string; orderId?: string } | null> {
  const mollie = getClient();
  if (!mollie) return null;
  const payment = await mollie.payments.get(paymentId);
  return {
    status: payment.status,
    orderId: (payment.metadata as { orderId?: string } | null)?.orderId,
  };
}

/** Translate a Mollie status to our internal OrderStatus. */
export function mapMollieStatus(status: string) {
  switch (status) {
    case "paid":
      return "paid" as const;
    case "authorized":
      return "authorized" as const;
    case "pending":
    case "open":
      return "pending" as const;
    case "canceled":
      return "canceled" as const;
    case "expired":
      return "expired" as const;
    case "failed":
      return "failed" as const;
    default:
      return "open" as const;
  }
}
