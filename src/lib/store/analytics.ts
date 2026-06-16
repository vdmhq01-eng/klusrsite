/**
 * Lichtgewicht analytics: registreert events (zoekopdrachten, chat-vragen,
 * conversies, paginaweergaven) in een begrensde KV-lijst (of in-memory zonder
 * KV) en levert geaggregeerde inzichten voor de admin. Best-effort: gooit nooit.
 */

import { isKvEnabled, kvLPush, kvLTrim, kvLRange } from "./kv";

export interface AnalyticsEvent {
  type: string;
  ts: number;
  query?: string;
  question?: string;
  value?: number;
  reference?: string;
  path?: string;
  [k: string]: unknown;
}

const KEY = "analytics:events";
const MAX = 1000;
const mem: AnalyticsEvent[] = [];

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
  const recentChats: { question: string; ts: number }[] = [];
  let conversions = 0;
  let revenue = 0;
  let searchCount = 0;
  let chatCount = 0;

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
    }
  }

  const topSearches = [...searches.entries()]
    .map(([query, count]) => ({ query, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  return {
    total: events.length,
    searchCount,
    chatCount,
    topSearches,
    recentChats,
    conversions,
    revenue: Math.round(revenue * 100) / 100,
  };
}
