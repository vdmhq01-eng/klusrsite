import createMollieClient, { type MollieClient } from "@mollie/api-client";
import type { PaymentMethodInfo } from "@/types";

/**
 * Mollie payments helper. When MOLLIE_API_KEY is missing the app runs in demo
 * mode: payments are simulated as immediately paid so the full checkout →
 * thank-you flow is testable without credentials.
 */

/**
 * Maak de Mollie-sleutel robuust. Vangt twee veelgemaakte fouten op:
 *  - een per ongeluk dubbel geplakte sleutel (live_x…live_x…), en
 *  - omringende spaties/tekst.
 * We pakken de éérste geldige test_/live_-sleutel (prefix + 30 alfanumerieke
 * tekens). Zo voorkomen we de "Invalid Authorization header"-fout.
 */
function normalizeMollieKey(raw?: string): string | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  const m = trimmed.match(/(?:test|live)_[A-Za-z0-9]{30}/);
  if (m && m[0] !== trimmed) {
    console.warn("[mollie] MOLLIE_API_KEY is opgeschoond (dubbele/verkeerd geplakte waarde gedetecteerd).");
  }
  return m ? m[0] : trimmed;
}

const API_KEY = normalizeMollieKey(process.env.MOLLIE_API_KEY);
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.klus-r.nl").replace(/\/$/, "");

let client: MollieClient | null = null;

export function isMollieConfigured(): boolean {
  return Boolean(API_KEY);
}

/**
 * De opgeschoonde Mollie-sleutel. Gebruikt door routes die rechtstreeks met de
 * Mollie-API praten (bijv. de Apple Pay merchant-sessie), zodat ze exact dezelfde
 * normalisatie krijgen als deze helper en de "Invalid Authorization header"-fout
 * voorkomen wordt. Geeft undefined wanneer er geen sleutel is geconfigureerd.
 */
export function getMollieApiKey(): string | undefined {
  return API_KEY;
}

function getClient(): MollieClient | null {
  if (!isMollieConfigured()) return null;
  if (!client) client = createMollieClient({ apiKey: API_KEY! });
  return client;
}

/**
 * Aliassen voor enkele interne method-ids → Mollie. De checkout stuurt sinds de
 * dynamische methodenlijst meestal al een echte Mollie-id mee; onbekende ids
 * laten we dus ongewijzigd door (passthrough).
 */
const methodMap: Record<string, string> = {
  ideal: "ideal",
  bancontact: "bancontact",
  creditcard: "creditcard",
  klarna: "klarna",
};

function toMollieMethod(method?: string): string | undefined {
  if (!method) return undefined;
  return methodMap[method] ?? method;
}

export interface CreatePaymentInput {
  orderId: string;
  reference: string;
  amount: number;
  method?: string;
  description?: string;
  /** Basis-URL voor redirect/webhook (uit de request-origin); valt terug op SITE_URL. */
  baseUrl?: string;
  /** Mollie Components card-token (creditcard ingebed op onze eigen pagina). */
  cardToken?: string;
  /** Apple Pay payment-token (JSON-string) uit de native Apple Pay-sheet. */
  applePayToken?: string;
  /** iDEAL-bank (issuer-id) — vooraf gekozen op onze eigen checkout. */
  issuer?: string;
  /** Factuuradres — vereist voor Klarna e.d. (pay-later). */
  billingAddress?: Record<string, unknown>;
  /** Order-regels — vereist voor Klarna e.d.; moeten exact optellen tot `amount`. */
  lines?: unknown[];
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

  const mollieMethod = toMollieMethod(input.method);
  const params: Record<string, unknown> = {
    amount: { currency: "EUR", value },
    description: input.description ?? `KLUSR bestelling ${input.reference}`,
    redirectUrl: `${base}/bedankt?order=${input.orderId}`,
    webhookUrl: process.env.MOLLIE_WEBHOOK_URL || `${base}/api/checkout/webhook`,
    metadata: { orderId: input.orderId, reference: input.reference },
    ...(mollieMethod ? { method: mollieMethod } : {}),
  };
  // iDEAL: vooraf gekozen bank meesturen → klant gaat direct naar de juiste bank.
  if (mollieMethod === "ideal" && input.issuer) params.issuer = input.issuer;
  // Mollie Components: card-token meegeven bij een ingebedde creditcard-betaling.
  if (input.cardToken) params.cardToken = input.cardToken;
  // Apple Pay Direct: de payment-token uit de native sheet meegeven → Mollie
  // verwerkt de betaling direct zonder gehoste redirect (method "applepay").
  if (input.applePayToken) params.applePayPaymentToken = input.applePayToken;
  // Factuuradres + order-regels (Klarna e.d.).
  if (input.billingAddress) params.billingAddress = input.billingAddress;
  if (input.lines && input.lines.length) params.lines = input.lines;
  const payment = await mollie.payments.create(params as never);

  return {
    checkoutUrl: payment.getCheckoutUrl() ?? `${base}/bedankt?order=${input.orderId}`,
    molliePaymentId: payment.id,
    demo: false,
  };
}

/** Fetch a Mollie payment's status (used by the webhook). */
export async function getPaymentStatus(
  paymentId: string,
): Promise<{
  status: string;
  orderId?: string;
  mode?: string;
  amount?: number;
  amountRefunded?: number;
} | null> {
  const mollie = getClient();
  if (!mollie) return null;
  const payment = await mollie.payments.get(paymentId);
  const toNum = (m: { value?: string } | null | undefined) =>
    m?.value != null ? Number(m.value) : undefined;
  return {
    status: payment.status,
    orderId: (payment.metadata as { orderId?: string } | null)?.orderId,
    mode: (payment as { mode?: string }).mode,
    amount: toNum(payment.amount as { value?: string } | undefined),
    amountRefunded: toNum(
      (payment as { amountRefunded?: { value?: string } }).amountRefunded,
    ),
  };
}

/** Officieel Mollie-logo (CDN) per method-id — als fallback wanneer de live
 * methodenlijst (nog) geen image meegeeft. */
const mollieIcon = (id: string) =>
  `https://www.mollie.com/external/icons/payment-methods/${id}.svg`;

/** Statische fallback-lijst (demo / Mollie onbereikbaar) met officiële logo's. */
/** Statische terugval (demo / methodenroute onbereikbaar). Landbewust: NL toont
 *  iDEAL, BE toont Bancontact. Apple Pay & Google Pay altijd erbij. */
function fallbackMethods(country?: string): PaymentMethodInfo[] {
  const rest: PaymentMethodInfo[] = [
    { id: "creditcard", label: "Creditcard", image: mollieIcon("creditcard") },
    { id: "applepay", label: "Apple Pay", image: mollieIcon("applepay") },
    { id: "googlepay", label: "Google Pay", image: mollieIcon("googlepay") },
    { id: "klarna", label: "Achteraf betalen met Klarna", image: mollieIcon("klarna") },
  ];
  return country === "BE"
    ? [{ id: "bancontact", label: "Bancontact", image: mollieIcon("bancontact") }, ...rest]
    : [{ id: "ideal", label: "iDEAL", image: mollieIcon("ideal") }, ...rest];
}

export interface PaymentMethodsResult {
  /** True wanneer de lijst live uit Mollie komt (anders fallback). */
  configured: boolean;
  methods: PaymentMethodInfo[];
}

type RawMollieMethod = {
  id: string;
  description?: string;
  image?: { svg?: string };
  issuers?: { id: string; name: string; image?: { svg?: string } }[] | null;
};

/**
 * Haal de in Mollie geactiveerde betaalmethoden op, inclusief officiële logo's
 * en (voor iDEAL) de banklijst. Filtert op bedrag zodat methoden met een
 * minimum/maximum (zoals Klarna) alleen verschijnen wanneer ze écht kunnen.
 * Valt terug op een statische lijst zonder credentials of bij een fout.
 */
export async function listPaymentMethods(
  amount?: number,
  country?: string,
): Promise<PaymentMethodsResult> {
  const cc = country ? country.toUpperCase().slice(0, 2) : undefined;
  const mollie = getClient();
  if (!mollie) return { configured: false, methods: fallbackMethods(cc) };
  try {
    const params: Record<string, unknown> = {
      include: "issuers",
      // Wallets (Apple Pay / Google Pay) komen alléén mee met includeWallets.
      includeWallets: "applepay,googlepay",
    };
    if (amount && amount > 0) {
      params.amount = { currency: "EUR", value: amount.toFixed(2) };
    }
    // Land meegeven zodat Mollie de juiste (bv. Belgische) methoden teruggeeft.
    if (cc) params.billingCountry = cc;
    const list = (await mollie.methods.list(params as never)) as unknown as RawMollieMethod[];
    const methods: PaymentMethodInfo[] = list.map((m) => ({
      id: m.id,
      label: m.description ?? m.id,
      image: m.image?.svg ?? mollieIcon(m.id),
      issuers: Array.isArray(m.issuers) && m.issuers.length
        ? m.issuers.map((i) => ({ id: i.id, name: i.name, image: i.image?.svg }))
        : undefined,
    }));
    return { configured: true, methods: methods.length ? methods : fallbackMethods(cc) };
  } catch (err) {
    console.error("[mollie] methods list failed", err);
    return { configured: false, methods: fallbackMethods(cc) };
  }
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

export interface MollieCheckResult {
  ok: boolean;
  configured: boolean;
  status: number;
  message: string;
  /** Geactiveerde betaalmethoden (id's), indien beschikbaar. */
  methods?: string[];
  error?: string;
}

/**
 * Controleer of de Mollie-koppeling werkt: valideert de API-sleutel en haalt de
 * geactiveerde betaalmethoden op (mollie.methods.list). Maakt geen betaling aan.
 */
export async function checkMollie(): Promise<MollieCheckResult> {
  const mollie = getClient();
  if (!mollie) {
    return {
      ok: false,
      configured: false,
      status: 0,
      message: "Mollie is niet geconfigureerd — zet MOLLIE_API_KEY in de omgeving.",
    };
  }
  try {
    const methods = await mollie.methods.list();
    const ids = methods.map((m) => m.id);
    return {
      ok: true,
      configured: true,
      status: 200,
      message: ids.length
        ? `Mollie werkt. Actieve betaalmethoden: ${ids.join(", ")}.`
        : "Mollie-sleutel werkt, maar er zijn nog géén betaalmethoden geactiveerd. Zet ze aan in je Mollie-dashboard.",
      methods: ids,
    };
  } catch (err) {
    return {
      ok: false,
      configured: true,
      status: 0,
      message: "De Mollie-sleutel werkt niet of het profiel is nog niet geactiveerd.",
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
