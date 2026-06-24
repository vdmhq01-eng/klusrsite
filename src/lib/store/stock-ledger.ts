import type { Order } from "@/types";
import {
  isKvEnabled,
  kvHGetAll,
  kvHIncrBy,
  kvLPush,
  kvLRange,
  kvLTrim,
  kvSetNX,
} from "./kv";

/**
 * Gedeeld voorraad-grootboek (stock ledger) — de kern van de omnichannel-voorraad.
 *
 * De catalogus-voorraad (`stockByStore`) is een momentopname uit de Channable/
 * Tilroy-feed die alleen bij een build/deploy ververst. Elke verkoop — zowel via
 * de webshop als via de fysieke kassa (POS) — boeken we hier als "verkocht sinds
 * de feed". De live-voorraad is dan: feed-voorraad − verkocht (≥ 0).
 *
 * Zo telt een toonbankverkoop in Nijverdal direct mee met wat de webshop nog als
 * beschikbaar ziet, en omgekeerd. Persistent via KV (hash `stock:sold`), met een
 * in-memory fallback voor demo. Idempotent per order: een order wordt nooit twee
 * keer afgeboekt (claim via SET NX), ook niet over serverless-instances heen.
 */

const SOLD_KEY = "stock:sold"; // hash: variantId → cumulatief verkochte stuks
const MOVES_KEY = "stock:moves"; // lijst met recente voorraadmutaties (gecapt)
const claimKey = (orderId: string) => `stock:claimed:${orderId}`;
const MAX_MOVES = 200;

// In-memory fallback (demo / geen KV).
const memSold = new Map<string, number>();
const memMoves: StockMovement[] = [];
const memClaimed = new Set<string>();

export interface StockMovement {
  orderId: string;
  reference: string;
  variantId: string;
  productId: string;
  title: string;
  /** Aantal afgeboekte stuks (positief getal). */
  qty: number;
  channel: "web" | "pos";
  ts: number;
}

/**
 * Boek een betaalde order af op de voorraad — exact één keer per order. De claim
 * (SET NX) voorkomt dubbel afboeken bij webhook-retries of dubbele kassa-polls.
 * Best-effort: gooit nooit, zodat dit nooit een betaal-/fulfilment-flow breekt.
 */
export async function recordOrderSale(order: Order): Promise<void> {
  try {
    if (!order.items.length) return;
    const channel = order.channel === "pos" ? "pos" : "web";

    // Claim: precies één keer afboeken.
    if (isKvEnabled()) {
      const claimed = await kvSetNX(claimKey(order.id), new Date().toISOString());
      if (!claimed) return;
    } else {
      if (memClaimed.has(order.id)) return;
      memClaimed.add(order.id);
    }

    for (const it of order.items) {
      const qty = Math.max(0, Math.round(it.quantity));
      if (!qty || !it.variantId) continue;
      const move: StockMovement = {
        orderId: order.id,
        reference: order.reference,
        variantId: it.variantId,
        productId: it.productId,
        title: it.title,
        qty,
        channel,
        ts: Date.now(),
      };
      if (isKvEnabled()) {
        await kvHIncrBy(SOLD_KEY, it.variantId, qty);
        await kvLPush(MOVES_KEY, move);
      } else {
        memSold.set(it.variantId, (memSold.get(it.variantId) ?? 0) + qty);
        memMoves.unshift(move);
        if (memMoves.length > MAX_MOVES) memMoves.length = MAX_MOVES;
      }
    }
    if (isKvEnabled()) await kvLTrim(MOVES_KEY, 0, MAX_MOVES - 1);
  } catch {
    /* voorraad-grootboek mag nooit een flow breken */
  }
}

/** Aantal sinds de feed verkochte stuks per variant-id (alle varianten). */
export async function getSoldMap(): Promise<Record<string, number>> {
  try {
    if (isKvEnabled()) {
      const raw = await kvHGetAll(SOLD_KEY);
      const out: Record<string, number> = {};
      for (const [k, v] of Object.entries(raw)) {
        const n = Number(v);
        if (n > 0) out[k] = n;
      }
      return out;
    }
    return Object.fromEntries([...memSold.entries()].filter(([, n]) => n > 0));
  } catch {
    return {};
  }
}

/** Verkochte stuks voor één variant (sinds de feed-momentopname). */
export async function getSold(variantId: string): Promise<number> {
  const map = await getSoldMap();
  return map[variantId] ?? 0;
}

/**
 * Live beschikbare voorraad voor een variant: de feed-voorraad minus wat sinds de
 * feed is verkocht (web + kassa), afgekapt op 0. Geef de feed-voorraad mee
 * (meestal de Nijverdal-voorraad) en, indien al opgehaald, de sold-map.
 */
export function liveStock(feedStock: number, sold: number): number {
  return Math.max(0, Math.round(feedStock) - Math.max(0, Math.round(sold)));
}

/** Recente voorraadmutaties (nieuwste eerst) voor het admin-overzicht. */
export async function getRecentMovements(limit = 50): Promise<StockMovement[]> {
  try {
    if (isKvEnabled()) {
      return await kvLRange<StockMovement>(MOVES_KEY, 0, Math.max(0, limit - 1));
    }
    return memMoves.slice(0, limit);
  } catch {
    return [];
  }
}
