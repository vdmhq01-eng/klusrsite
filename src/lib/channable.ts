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
const TOKEN = process.env.CHANNABLE_TOKEN;
const COMPANY_ID = process.env.CHANNABLE_COMPANY_ID;
const PROJECT_ID = process.env.CHANNABLE_PROJECT_ID;

export function isChannableConfigured(): boolean {
  return Boolean(TOKEN && COMPANY_ID);
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
  if (process.env.CHANNABLE_ORDERS_URL) return process.env.CHANNABLE_ORDERS_URL;
  const scope = PROJECT_ID
    ? `companies/${COMPANY_ID}/projects/${PROJECT_ID}`
    : `companies/${COMPANY_ID}`;
  return `${BASE}/${scope}/orders`;
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
