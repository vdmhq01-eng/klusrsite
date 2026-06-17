import type { Order } from "@/types";

/**
 * Channable integratie — Order Connection API v1.
 *
 * BELANGRIJK over het ordermodel (zo werkt Channable écht):
 *   - Channable ONTVANGT orders van marketplaces (bol.com, Amazon, …) en
 *     routeert ze naar je backoffice (Tilroy). Je leest ze uit via GET /orders.
 *   - Er is GÉÉN generiek "order aanmaken"-endpoint. Je kunt dus géén
 *     willekeurige webshop-order in Channable "inschieten". De enige manier om
 *     via de API een order te laten ontstaan is de Sandbox-only **test-order**
 *     (POST /orders/test/{order_config_id}), die Channable voor je fabriceert.
 *   - De schrijf-acties op bestaande orders zijn: shipment (verzending +
 *     tracking terugkoppelen), cancellation, return-status en manual updates.
 *
 * Gevolg voor KLUSR: onze eigen webshop-orders gaan NIET via Channable naar
 * Tilroy — dat is een aparte Tilroy-koppeling. Wat we hier wél doen:
 *   1. fetchChannableItems()  — productdata + voorraad ophalen (project items).
 *   2. fetchChannableOrders() — marketplace-orders ontvangen.
 *   3. pushShipment()         — PostNL-tracking terugkoppelen aan de marketplace.
 *   4. sendTestOrder()        — Sandbox test-order aanmaken om de koppeling te testen.
 *
 * Auth: Bearer token, company-/project-scoped. Docs: https://api.channable.com/v1/docs
 * Alles degradeert netjes: zonder credentials draait de webshop in demo-modus.
 */

const BASE = process.env.CHANNABLE_API_BASE || "https://api.channable.com/v1";
// Accept both CHANNABLE_TOKEN (bestaande conventie) en CHANNABLE_API_TOKEN (alias).
const TOKEN = process.env.CHANNABLE_TOKEN || process.env.CHANNABLE_API_TOKEN;
const COMPANY_ID = process.env.CHANNABLE_COMPANY_ID;
const PROJECT_ID = process.env.CHANNABLE_PROJECT_ID;
// Order Config ID van je Channable order-connectie (nodig voor test-orders;
// te vinden in Channable onder Connections → de order-connectie → URL/instellingen).
const ORDER_CONFIG_ID = process.env.CHANNABLE_ORDER_CONFIG_ID;

export function isChannableConfigured(): boolean {
  return Boolean(TOKEN && COMPANY_ID);
}

/** Token + company + project — nodig voor het lezen/bijwerken van orders. */
export function isChannableOrdersConfigured(): boolean {
  return Boolean(TOKEN && COMPANY_ID && PROJECT_ID);
}

/** Volledig genoeg om een Sandbox test-order te kunnen aanmaken. */
export function isTestOrderConfigured(): boolean {
  return Boolean(TOKEN && COMPANY_ID && PROJECT_ID && ORDER_CONFIG_ID);
}

function authHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${TOKEN}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

/** Basis-URL voor alle order-endpoints (company-/project-scoped). */
function ordersBase(): string {
  return `${BASE}/companies/${COMPANY_ID}/projects/${PROJECT_ID}/orders`;
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

/* ------------------------------------------------------- inkomende orders */

/**
 * Lees marketplace-orders uit Channable (GET /orders). Dit is de juiste,
 * inkomende richting: Channable verzamelt orders van de marketplaces en wij
 * halen ze hier op. Retourneert de ruwe order-objecten (raw) zodat de admin ze
 * kan tonen/verwerken. Lege lijst zonder credentials.
 */
export async function fetchChannableOrders(
  { status, limit = 100 }: { status?: string; limit?: number } = {},
): Promise<Record<string, unknown>[]> {
  if (!isChannableOrdersConfigured()) return [];
  try {
    const u = new URL(ordersBase());
    if (status) u.searchParams.set("status", status);
    if (limit) u.searchParams.set("limit", String(limit));
    const res = await fetch(u.toString(), {
      headers: authHeaders(),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      console.error("[channable] orders fetch failed", res.status, await res.text());
      return [];
    }
    const body = await res.json();
    return Array.isArray(body) ? body : (body.orders ?? body.data ?? body.results ?? []);
  } catch (err) {
    console.error("[channable] orders fetch error", err);
    return [];
  }
}

/* --------------------------------------------------------- verzending */

export interface ShipmentInput {
  /** Track & trace-code (bv. de PostNL-barcode). */
  trackingCode: string;
  /** Gestandaardiseerde Channable transporter-code (bv. "POSTNL"). */
  transporter?: string;
  /** Optioneel: alleen deze orderregels markeren als verzonden (anders de hele order). */
  orderItemIds?: number[];
}

export interface ShipmentResult {
  ok: boolean;
  status: number;
  configured: boolean;
  message: string;
  response?: unknown;
}

/**
 * Koppel een verzending/tracking terug aan een Channable-order. Channable
 * propageert dit naar de betreffende marketplace.
 *
 * POST /v1/companies/{companyId}/projects/{projectId}/orders/{orderId}/shipment
 * Body: { tracking_code, transporter, order_item_ids? }
 */
export async function pushShipment(
  orderId: string,
  input: ShipmentInput,
): Promise<ShipmentResult> {
  if (!isChannableOrdersConfigured()) {
    return {
      ok: false,
      status: 0,
      configured: false,
      message: "Channable is niet (volledig) geconfigureerd voor orders.",
    };
  }
  const payload: Record<string, unknown> = {
    tracking_code: input.trackingCode,
    transporter: input.transporter ?? "POSTNL",
  };
  if (input.orderItemIds?.length) payload.order_item_ids = input.orderItemIds;

  try {
    const res = await fetch(`${ordersBase()}/${encodeURIComponent(orderId)}/shipment`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    });
    const text = await res.text();
    let parsed: unknown = text;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      /* houd platte tekst aan */
    }
    return {
      ok: res.ok,
      status: res.status,
      configured: true,
      message: res.ok
        ? `Verzending teruggekoppeld aan Channable (tracking ${input.trackingCode}).`
        : `Channable gaf een fout (HTTP ${res.status}) bij het terugkoppelen van de verzending.`,
      response: parsed,
    };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      configured: true,
      message: `Verzending terugkoppelen mislukt: ${err instanceof Error ? err.message : "onbekende fout"}.`,
    };
  }
}

/* ----------------------------------------------------- webshop-fulfilment */

export interface ChannableOrderResult {
  ok: boolean;
  demo: boolean;
  channableOrderId?: string;
  error?: string;
}

/**
 * No-op (bewust): Channable kent géén endpoint om een eigen webshop-order in te
 * schieten — orders ontstaan in Channable alléén vanuit marketplaces. Onze
 * webshop-orders blijven dus in de webshop-orderstore en gaan via een aparte
 * Tilroy-koppeling de backoffice in (nog niet geïmplementeerd).
 *
 * We laten deze functie bestaan zodat de bestaande fulfilment-flow niet breekt;
 * hij rapporteert "demo" (geen push) i.p.v. een misleidende fout.
 */
export async function pushChannableOrder(order: Order): Promise<ChannableOrderResult> {
  console.info(
    "[channable] webshop-order wordt niet naar Channable gepusht (Channable is inbound-only voor orders):",
    order.reference,
  );
  return { ok: true, demo: true };
}

/* ------------------------------------------------------------ test-order */

export interface SendTestOrderInput {
  /** Channable artikel-id (item_id) dat in je project bestaat. Verplicht. */
  itemId?: string;
  /** Landcode voor de test-order (default NL). */
  country?: string;
}

export interface SendTestOrderResult {
  ok: boolean;
  /** HTTP-status van de Channable-respons (0 wanneer er geen call is gedaan). */
  status: number;
  /** True wanneer de CHANNABLE_* secrets (incl. ORDER_CONFIG_ID) aanwezig zijn. */
  configured: boolean;
  /** Mensvriendelijke melding (NL) voor de admin-UI. */
  message: string;
  /** Ruwe Channable-respons (geparsed JSON of platte tekst), indien beschikbaar. */
  response?: unknown;
}

/**
 * Maak een Sandbox **test-order** aan via Channable. Channable fabriceert dan
 * zelf een order voor het opgegeven artikel, zodat je de volledige
 * order-afhandeling (incl. doorzetten naar Tilroy) kunt testen.
 *
 * POST /v1/companies/{companyId}/projects/{projectId}/orders/test/{orderConfigId}
 * Body: { country, item_id }
 *
 * LET OP: dit werkt alléén op een Channable **Sandbox**-project en vereist een
 * geldig CHANNABLE_ORDER_CONFIG_ID (de Order Config van je order-connectie) plus
 * een item_id dat in dat project bestaat.
 */
export async function sendTestOrder(
  input: SendTestOrderInput = {},
): Promise<SendTestOrderResult> {
  if (!isChannableOrdersConfigured()) {
    return {
      ok: false,
      status: 0,
      configured: false,
      message:
        "Stel eerst de CHANNABLE_* secrets in (CHANNABLE_API_TOKEN, CHANNABLE_COMPANY_ID, CHANNABLE_PROJECT_ID).",
    };
  }
  if (!ORDER_CONFIG_ID) {
    return {
      ok: false,
      status: 0,
      configured: false,
      message:
        "Zet CHANNABLE_ORDER_CONFIG_ID in de omgeving — dit is de Order Config-ID van je Channable order-connectie. De test-order werkt alleen op een Sandbox-project.",
    };
  }
  const itemId = input.itemId?.trim();
  if (!itemId) {
    return {
      ok: false,
      status: 0,
      configured: true,
      message: "Vul een artikel-id (item_id) in dat in je Channable-project bestaat.",
    };
  }

  const payload = { country: (input.country || "NL").toUpperCase(), item_id: itemId };
  const url = `${ordersBase()}/test/${encodeURIComponent(ORDER_CONFIG_ID)}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
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
        message:
          res.status === 404
            ? "Channable kent dit order-config-id niet (404). Controleer CHANNABLE_ORDER_CONFIG_ID en of dit een Sandbox-project is."
            : res.status === 401 || res.status === 403
              ? "Geen toegang (401/403). Controleer het token en of het bij dit company-/project-id hoort."
              : `Channable gaf een fout (HTTP ${res.status}) op de test-order.`,
        response: parsed,
      };
    }

    return {
      ok: true,
      status: res.status,
      configured: true,
      message: `Test-order aangemaakt in Channable voor artikel ${itemId}. Channable verwerkt hem nu als marketplace-order.`,
      response: parsed,
    };
  } catch (err) {
    const aborted = err instanceof Error && err.name === "AbortError";
    return {
      ok: false,
      status: 0,
      configured: true,
      message: aborted
        ? "Channable reageerde niet binnen 15 seconden (timeout)."
        : `Versturen naar Channable mislukt: ${err instanceof Error ? err.message : "onbekende fout"}.`,
    };
  } finally {
    clearTimeout(timeout);
  }
}
