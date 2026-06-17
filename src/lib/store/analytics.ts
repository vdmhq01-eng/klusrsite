/**
 * Lichtgewicht analytics: registreert events (zoekopdrachten, chat-vragen,
 * conversies, paginaweergaven, productweergaven) in een begrensde KV-lijst (of
 * in-memory zonder KV), plus unieke bezoekers per dag en "live" aanwezigheid.
 * Levert geaggregeerde inzichten voor de admin. Best-effort: gooit nooit.
 */

import {
  isKvEnabled,
  kvLPush,
  kvLTrim,
  kvLRange,
  kvGetJSON,
  kvSetJSON,
  kvSAdd,
  kvSMembers,
} from "./kv";

export interface AnalyticsEvent {
  type: string;
  ts: number;
  query?: string;
  question?: string;
  value?: number;
  reference?: string;
  path?: string;
  productId?: string;
  title?: string;
  [k: string]: unknown;
}

const KEY = "analytics:events";
const MAX = 1000;
const mem: AnalyticsEvent[] = [];

const PRESENCE_KEY = "analytics:presence";
const PRESENCE_TTL = 5 * 60 * 1000; // entries ouder dan 5 min weggooien
const LIVE_WINDOW = 2 * 60 * 1000; // "live" = gezien in de laatste 2 min
const memPresence = new Map<string, number>();
const memVisitors = new Map<string, Set<string>>();

const dayKey = (d = new Date()) => `analytics:visitors:${d.toISOString().slice(0, 10)}`;

export async function logEvent(
  type: string,
  payload: Record<string, unknown> = {},
): Promise<void> {
  try {
    const ev: AnalyticsEvent = { type, ts: Date.now(), ...payload };
    mem.unshift(ev);
    if (mem.length > MAX) mem.length = MAX;
    if (isKvEnabled()) {
      await kvLPush(KEY, ev);
      await kvLTrim(KEY, 0, MAX - 1);
    }
  } catch {
    /* analytics mag nooit een flow breken */
  }
}

/** Markeer een bezoeker als (nu) aanwezig — voedt het live-aantal. */
async function touchPresence(visitorId: string): Promise<void> {
  const now = Date.now();
  try {
    let presence: Record<string, number> = {};
    if (isKvEnabled()) presence = (await kvGetJSON<Record<string, number>>(PRESENCE_KEY)) ?? {};
    else presence = Object.fromEntries(memPresence);
    presence[visitorId] = now;
    // Oude entries opruimen zodat het object klein blijft.
    for (const [id, ts] of Object.entries(presence)) {
      if (now - ts > PRESENCE_TTL) delete presence[id];
    }
    if (isKvEnabled()) await kvSetJSON(PRESENCE_KEY, presence);
    else {
      memPresence.clear();
      for (const [id, ts] of Object.entries(presence)) memPresence.set(id, ts);
    }
  } catch {
    /* best-effort */
  }
}

/** Aantal bezoekers dat in de laatste 2 minuten actief was. */
export async function getLiveCount(): Promise<number> {
  const now = Date.now();
  try {
    const presence = isKvEnabled()
      ? (await kvGetJSON<Record<string, number>>(PRESENCE_KEY)) ?? {}
      : Object.fromEntries(memPresence);
    return Object.values(presence).filter((ts) => now - ts < LIVE_WINDOW).length;
  } catch {
    return 0;
  }
}

async function getVisitorsToday(): Promise<number> {
  try {
    if (isKvEnabled()) return (await kvSMembers(dayKey())).length;
    return memVisitors.get(dayKey())?.size ?? 0;
  } catch {
    return 0;
  }
}

/**
 * Registreert een bezoek: unieke bezoeker (per dag), live-aanwezigheid en
 * eventueel een event (pageview/productweergave). `logType=null` (heartbeat)
 * houdt alleen de aanwezigheid vers zonder de eventlijst te vervuilen.
 */
export async function recordVisit(input: {
  visitorId?: string;
  path?: string;
  productId?: string;
  title?: string;
  logType?: "pageview" | "view_item" | null;
}): Promise<void> {
  const { visitorId, path, productId, title, logType } = input;
  try {
    if (visitorId) {
      await touchPresence(visitorId);
      if (isKvEnabled()) {
        await kvSAdd(dayKey(), visitorId);
      } else {
        const k = dayKey();
        const set = memVisitors.get(k) ?? new Set<string>();
        set.add(visitorId);
        memVisitors.set(k, set);
      }
    }
    if (logType === "pageview") await logEvent("pageview", { path });
    else if (logType === "view_item") await logEvent("view_item", { productId, title, path });
  } catch {
    /* best-effort */
  }
}

export async function getEvents(limit = MAX): Promise<AnalyticsEvent[]> {
  if (isKvEnabled()) {
    const kv = await kvLRange<AnalyticsEvent>(KEY, 0, limit - 1);
    if (kv.length) return kv;
  }
  return mem.slice(0, limit);
}

/** Geaggregeerde inzichten voor het admin-dashboard. */
export async function getInsights() {
  const events = await getEvents();
  const searches = new Map<string, number>();
  const viewed = new Map<string, { title: string; count: number }>();
  const recentChats: { question: string; ts: number }[] = [];
  let conversions = 0;
  let revenue = 0;
  let searchCount = 0;
  let chatCount = 0;
  let pageviews = 0;

  for (const e of events) {
    if (e.type === "search" && e.query) {
      searchCount++;
      const q = String(e.query).toLowerCase().trim();
      if (q) searches.set(q, (searches.get(q) || 0) + 1);
    } else if (e.type === "chat" && e.question) {
      chatCount++;
      if (recentChats.length < 40) recentChats.push({ question: String(e.question), ts: e.ts });
    } else if (e.type === "conversion") {
      conversions++;
      revenue += Number(e.value) || 0;
    } else if (e.type === "pageview") {
      pageviews++;
    } else if (e.type === "view_item" && (e.productId || e.title)) {
      const id = String(e.productId || e.title);
      const cur = viewed.get(id) ?? { title: String(e.title || id), count: 0 };
      cur.count++;
      viewed.set(id, cur);
    }
  }

  const topSearches = [...searches.entries()]
    .map(([query, count]) => ({ query, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  const topViewed = [...viewed.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  const [live, visitorsToday] = await Promise.all([getLiveCount(), getVisitorsToday()]);

  return {
    total: events.length,
    searchCount,
    chatCount,
    pageviews,
    conversions,
    revenue: Math.round(revenue * 100) / 100,
    visitorsToday,
    live,
    topSearches,
    topViewed,
    recentChats,
  };
}
