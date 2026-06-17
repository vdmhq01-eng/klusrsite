/**
 * "Winkelwagen-vergeten" opslag. We bewaren per e-mailadres een laatste
 * winkelwagen-snapshot zodra de klant op de checkout een geldig e-mailadres
 * invult. Een cron (/api/cron/abandoned-cart) stuurt later een herinnering als
 * de bestelling niet is afgerond.
 *
 * KV wanneer geconfigureerd; anders in-memory (demo). Gooit nooit.
 */

import { isKvEnabled, kvGetJSON, kvSetJSON, kvSAdd, kvSMembers, kvDel } from "./kv";

export interface PendingCartItem {
  title: string;
  quantity: number;
  price: number;
  image?: string;
  slug?: string;
}

export interface PendingCart {
  email: string;
  name?: string;
  items: PendingCartItem[];
  total: number;
  updatedAt: string;
  reminded: boolean;
}

const mem = new Map<string, PendingCart>();
const norm = (e: string) => e.trim().toLowerCase();
const KEY = {
  cart: (e: string) => `cart:pending:${norm(e)}`,
  index: "cart:pending:index",
};

export async function rememberCart(input: {
  email: string;
  name?: string;
  items: PendingCartItem[];
  total: number;
}): Promise<void> {
  const email = norm(input.email);
  if (!email || input.items.length === 0) return;
  const existing = (await loadCart(email)) ?? null;
  const cart: PendingCart = {
    email,
    name: input.name || existing?.name,
    items: input.items,
    total: input.total,
    updatedAt: new Date().toISOString(),
    // Reminder-vlag sticky houden: zo sturen we hooguit één herinnering, ook al
    // werkt de klant de winkelwagen daarna nog bij.
    reminded: existing?.reminded ?? false,
  };
  mem.set(email, cart);
  if (isKvEnabled()) {
    await kvSetJSON(KEY.cart(email), cart);
    await kvSAdd(KEY.index, email);
  }
}

async function loadCart(email: string): Promise<PendingCart | null> {
  if (isKvEnabled()) {
    const c = await kvGetJSON<PendingCart>(KEY.cart(email));
    if (c) return c;
  }
  return mem.get(norm(email)) ?? null;
}

export async function clearPendingCart(email: string): Promise<void> {
  const key = norm(email);
  if (!key) return;
  mem.delete(key);
  if (isKvEnabled()) await kvDel(KEY.cart(key));
  // Index laten staan is onschadelijk (load geeft dan null terug).
}

export async function markReminded(email: string): Promise<void> {
  const c = await loadCart(email);
  if (!c) return;
  c.reminded = true;
  mem.set(norm(email), c);
  if (isKvEnabled()) await kvSetJSON(KEY.cart(email), c);
}

/** Alle openstaande winkelwagens (KV + in-memory), voor de cron. */
export async function listPendingCarts(): Promise<PendingCart[]> {
  const byEmail = new Map<string, PendingCart>();
  if (isKvEnabled()) {
    const emails = await kvSMembers(KEY.index);
    const loaded = await Promise.all(emails.map((e) => loadCart(e)));
    for (const c of loaded) if (c) byEmail.set(c.email, c);
  }
  for (const c of mem.values()) byEmail.set(c.email, c);
  return [...byEmail.values()];
}
