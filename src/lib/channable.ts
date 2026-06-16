import type { Order } from "@/types";

/**
 * Channable integratie.
 *
 * Channable zit als middleware tussen de KLUSR-webshop en Tilroy:
 *   - PRODUCTDATA + VOORRAAD worden uit Channable gehaald (project items).
 *   - ORDERS worden in Channable "ingeschoten"; Channable stuurt ze door naar
 *     Tilroy voor verwerking/fulfilment.
 *
 * Auth: Bearer token (CHANNABLE_TOKEN), company-/project-scoped.
 * Docs: https://api.channable.com/v1/docs
 *
 * Alles degradeert netjes: zonder credentials draait de webshop in demo-modus
 * (orders worden lokaal gelogd, productdata komt uit de gecommitte snapshot).
 *
 * NB: de exacte endpoint-paden/schema's kunnen per Channable-account verschillen;
 * ze zijn daarom volledig override-baar via env (CHANNABLE_ITEMS_URL /
 * CHANNABLE_ORDERS_URL).
 */

const BASE = process.env.CHANNABLE_API_BASE || "https://api.channable.com/v1";
// Accept both CHANNABLE_TOKEN (bestaande conventie) en CHANNABLE_API_TOKEN (alias).
const TOKEN = process.env.CHANNABLE_TOKEN || process.env.CHANNABLE_API_TOKEN;
const COMPANY_ID = process.env.CHANNABLE_COMPANY_ID;
const PROJECT_ID = process.env.CHANNABLE_PROJECT_ID;

export function isChannableConfigured(): boolean {
  return Boolean(TOKEN && COMPANY_ID);
}

/** Volledige configuratie voor het inschieten van orders (token + company + project). */
export function isChannableOrdersConfigured(): boolean {
  return Boolean(TOKEN && COMPANY_ID && PROJECT_ID);
}

/**
 * Kill-switch voor het inschieten van orders. Default AAN. Zet
 * CHANNABLE_ORDERS_ENABLED=false (of 0) om order-push tijdelijk te stoppen
 * zonder de credentials te verwijderen — handig om de webshop te testen zonder
 * dat test-orders in Tilroy belanden.
 */
export function areOrdersEnabled(): boolean {
  const v = process.env.CHANNABLE_ORDERS_ENABLED;
  return v !== "false" && v !== "0";
}

function authHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${TOKEN}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

function itemsUrl(offset: number, limit: number): string {
  if (process.env.CHANNABLE_ITEMS_URL) {
    const u = new URL(process.env.CHANNABLE_ITEMS_URL);
    u.searchParams.set("offset", String(offset));
    u.searchParams.set("limit", String(limit));
    return u.toString();
  }
  return `${BASE}/companies/${COMPANY_ID}/projects/${PROJECT_ID}/items?offset=${offset}&limit=${limit}`;
}

function ordersUrl(): string {
  // Volledige override (accepteer CHANNABLE_ORDERS_URL én het alias CHANNABLE_ORDER_URL).
  const override = process.env.CHANNABLE_ORDERS_URL || process.env.CHANNABLE_ORDER_URL;
  if (override) return override;
  const scope = PROJECT_ID
    ? `companies/${COMPANY_ID}/projects/${PROJECT_ID}`
    : `companies/${COMPANY_ID}`;
  // Channable orders-endpoint eindigt op een slash:
  // https://api.channable.com/v1/companies/{companyId}/projects/{projectId}/orders/
  return `${BASE}/${scope}/orders/`;
}

/* --------------------------------------------------------------- products */

export interface ChannableItem {
  /** Channable/Tilroy artikel-id. */
  id: string;
  ean?: string;
  title: string;
  brand?: string;
  description?: string;
  price?: number;
  image?: string;
  category?: string;
  color?: string;
  size?: string;
  groupId?: string;
  /** Totale voorraad over alle vestigingen. */
  stock?: number;
  /** Voorraad per vestiging (shop-id → aantal). */
  stockByLocation?: Record<string, number>;
  /** Onbewerkte velden voor mapping-flexibiliteit. */
  raw?: Record<string, unknown>;
}

/** Normaliseer een ruw Channable-item naar onze ChannableItem. */
function normalizeItem(raw: Record<string, unknown>): ChannableItem {
  const f = (raw.data ?? raw) as Record<string, unknown>;
  const num = (v: unknown) =>
    typeof v === "number" ? v : v != null ? parseFloat(String(v).replace(",", ".")) : undefined;
  return {
    id: String(f.id ?? f.gtin ?? f.ean ?? ""),
    ean: f.ean ? String(f.ean) : f.gtin ? String(f.gtin) : undefined,
    title: String(f.title ?? f.name ?? ""),
    brand: f.brand ? String(f.brand) : undefined,
    description: f.description ? String(f.description) : undefined,
    price: num(f.price),
    image: f.image_link ? String(f.image_link) : f.image ? String(f.image) : undefined,
    category: f.product_type ? String(f.product_type) : f.category ? String(f.category) : undefined,
    color: f.color ? String(f.color) : undefined,
    size: f.size ? String(f.size) : undefined,
    groupId: f.item_group_id ? String(f.item_group_id) : undefined,
    stock: num(f.stock ?? f.quantity ?? f.availability_quantity),
    raw: f,
  };
}

/**
 * Haal álle project-items (productdata + voorraad) op uit Channable, gepagineerd.
 * Retourneert een lege lijst wanneer Channable niet is geconfigureerd.
 */
export async function fetchChannableItems(
  { pageSize = 1000, maxItems = 20000 } = {},
): Promise<ChannableItem[]> {
  if (!isChannableConfigured()) return [];

  const out: ChannableItem[] = [];
  let offset = 0;

  while (out.length < maxItems) {
    const res = await fetch(itemsUrl(offset, pageSize), { headers: authHeaders() });
    if (!res.ok) {
      console.error("[channable] items fetch failed", res.status, await res.text());
      break;
    }
    const body = await res.json();
    // Channable kan { items: [...] } of een kale array teruggeven.
    const rows: Record<string, unknown>[] = Array.isArray(body)
      ? body
      : (body.items ?? body.data ?? body.results ?? []);
    if (!rows.length) break;
    out.push(...rows.map(normalizeItem));
    if (rows.length < pageSize) break;
    offset += pageSize;
  }
  return out;
}

/* ----------------------------------------------------------------- orders */

export interface ChannableOrderResult {
  ok: boolean;
  demo: boolean;
  channableOrderId?: string;
  error?: string;
}

/** Strip onze interne prefix om het kale Tilroy/Channable artikel-id te krijgen. */
function tilroyId(variantId: string): string {
  return variantId.replace(/^tilroy-/, "");
}

/**
 * "Schiet" een betaalde order in Channable; Channable routeert hem naar Tilroy.
 * In demo-modus (geen credentials) wordt de order alleen gelogd.
 */
export async function pushChannableOrder(order: Order): Promise<ChannableOrderResult> {
  const payload = {
    external_id: order.reference,
    source: "klusr-webshop",
    status: order.paymentStatus,
    currency: "EUR",
    placed_at: order.createdAt,
    customer: {
      email: order.customer.email,
      first_name: order.customer.firstName,
      last_name: order.customer.lastName,
      phone: order.customer.phone,
    },
    shipping_address: {
      first_name: order.customer.firstName,
      last_name: order.customer.lastName,
      street: order.customer.street,
      postal_code: order.customer.postalCode,
      city: order.customer.city,
      country: "NL",
    },
    payment: {
      method: order.paymentMethod,
      mollie_payment_id: order.molliePaymentId,
      status: order.paymentStatus,
    },
    totals: {
      subtotal: order.subtotal,
      shipping: order.shipping,
      total: order.total,
    },
    lines: order.items.map((i) => ({
      id: tilroyId(i.variantId),
      sku: i.variantId,
      title: i.title,
      brand: i.brand,
      quantity: i.quantity,
      unit_price: i.kluspasPrice,
      // Op-kleur-gemengde verf: kleur + basis voor Tilroy.
      ...(i.selectedColor
        ? {
            color_code: i.selectedColor.code,
            color_name: i.selectedColor.name,
            paint_base: i.selectedColor.base?.label,
          }
        : {}),
    })),
  };

  if (!isChannableConfigured()) {
    console.info("[channable] demo mode — order would be pushed:", order.reference);
    return { ok: true, demo: true };
  }

  if (!areOrdersEnabled()) {
    console.info(
      "[channable] order push disabled (CHANNABLE_ORDERS_ENABLED=false):",
      order.reference,
    );
    return { ok: true, demo: true };
  }

  try {
    const res = await fetch(ordersUrl(), {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error("[channable] order push failed", res.status, text);
      return { ok: false, demo: false, error: `${res.status}: ${text.slice(0, 200)}` };
    }
    const body = await res.json().catch(() => ({}));
    return {
      ok: true,
      demo: false,
      channableOrderId: body.id ? String(body.id) : undefined,
    };
  } catch (err) {
    console.error("[channable] order push error", err);
    return { ok: false, demo: false, error: err instanceof Error ? err.message : "unknown" };
  }
}

/* ------------------------------------------------------------ test-order */

export interface SendTestOrderInput {
  /** Optionele overrides voor het test-orderregel-item. */
  sku?: string;
  title?: string;
  price?: number;
  quantity?: number;
  /** Optioneel e-mailadres voor de neppe testklant. */
  email?: string;
}

export interface SendTestOrderResult {
  ok: boolean;
  /** HTTP-status van de Channable-respons (0 wanneer er geen call is gedaan). */
  status: number;
  /** True wanneer de CHANNABLE_* secrets aanwezig zijn. */
  configured: boolean;
  /** Mensvriendelijke melding (NL) voor de admin-UI. */
  message: string;
  /** Ruwe Channable-respons (geparsed JSON of platte tekst), indien beschikbaar. */
  response?: unknown;
}

const NOT_CONFIGURED_MESSAGE =
  "Stel eerst de CHANNABLE_* secrets in (CHANNABLE_API_TOKEN, CHANNABLE_COMPANY_ID, CHANNABLE_PROJECT_ID).";

/**
 * Stuur een duidelijk gemarkeerde TEST-order naar de Channable Orders-API.
 *
 * Endpoint (override-baar via CHANNABLE_ORDER_URL / CHANNABLE_ORDERS_URL):
 *   POST https://api.channable.com/v1/companies/{companyId}/projects/{projectId}/orders/
 *   Header: Authorization: Bearer <CHANNABLE_TOKEN | CHANNABLE_API_TOKEN>
 *
 * Robuust: 10s timeout (AbortController), gooit NOOIT naar de caller en geeft
 * altijd een gestructureerd resultaat terug. Zonder credentials wordt er geen
 * call gedaan en krijg je een nette "stel secrets in"-melding.
 *
 * NB: het exacte order-schema kan per Channable-account verschillen. De payload
 * hieronder staat daarom als één duidelijk becommentarieerd object dat je
 * makkelijk kunt aanpassen; het endpoint is volledig override-baar via env.
 */
export async function sendTestOrder(
  input: SendTestOrderInput = {},
): Promise<SendTestOrderResult> {
  if (!isChannableOrdersConfigured()) {
    return { ok: false, status: 0, configured: false, message: NOT_CONFIGURED_MESSAGE };
  }

  const now = new Date();
  const reference = `KLUSR-TEST-${now.getTime()}`;
  const line = {
    sku: input.sku ?? "KLUSR-TEST-SKU",
    title: input.title ?? "KLUSR Testproduct",
    quantity: input.quantity ?? 1,
    unit_price: input.price ?? 9.99,
  };

  // --- TEST-order payload (pas dit object aan op jouw Channable-schema) -------
  // Bewust gemarkeerd als test: neppe klant "KLUSR Test", test_ref en is_test.
  const payload = {
    external_id: reference,
    source: "klusr-webshop",
    // Markeer als test waar de API dat toelaat (genegeerd als onbekend veld).
    is_test: true,
    test: true,
    status: "paid",
    currency: "EUR",
    placed_at: now.toISOString(),
    customer: {
      email: input.email ?? "test@klus-r.nl",
      first_name: "KLUSR",
      last_name: "Test",
      phone: "0600000000",
    },
    shipping_address: {
      first_name: "KLUSR",
      last_name: "Test",
      street: "Teststraat 1",
      postal_code: "1234 AB",
      city: "Teststad",
      country: "NL",
    },
    payment: {
      method: "test",
      status: "paid",
    },
    totals: {
      subtotal: line.unit_price * line.quantity,
      shipping: 0,
      total: line.unit_price * line.quantity,
    },
    lines: [line],
  };
  // ---------------------------------------------------------------------------

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(ordersUrl(), {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    // Parse als JSON, val terug op platte tekst.
    const text = await res.text();
    let parsed: unknown = text;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      /* houd platte tekst aan */
    }

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        configured: true,
        message: `Channable gaf een fout terug (HTTP ${res.status}). Controleer de credentials en het order-schema.`,
        response: parsed,
      };
    }

    return {
      ok: true,
      status: res.status,
      configured: true,
      message: `Testorder verstuurd naar Channable (referentie ${reference}).`,
      response: parsed,
    };
  } catch (err) {
    const aborted = err instanceof Error && err.name === "AbortError";
    return {
      ok: false,
      status: 0,
      configured: true,
      message: aborted
        ? "Channable reageerde niet binnen 10 seconden (timeout)."
        : `Versturen naar Channable mislukt: ${err instanceof Error ? err.message : "onbekende fout"}.`,
    };
  } finally {
    clearTimeout(timeout);
  }
}
