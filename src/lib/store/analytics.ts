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
  kvSRem,
  kvSMembers,
  kvSetEx,
  kvMGet,
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

// Live sessies (huidige pagina + afreken-vlag) per bezoeker, kortlevend.
const SESSION_TTL_S = 60; // seconden dat een sessie "live" blijft zonder heartbeat
const SESSION_INDEX_KEY = "analytics:sessions"; // set met actieve bezoeker-id's
const sessionKey = (vid: string) => `presence:session:${vid}`;
const CHECKOUT_PATH = "/checkout"; // de afrekenpagina (winkelwagen → "Verder naar afrekenen")
const MAX_SESSIONS = 50;
const memSessions = new Map<string, { path: string; ts: number; checkout: boolean }>();

// IP-uitsluiting: eigen/intern verkeer telt niet mee in rapportages en live.
const EXCLUDED_IPS_KEY = "analytics:excluded-ips";
const ENV_EXCLUDED_IPS = (process.env.INTERNAL_IPS || "")
  .split(/[\s,;]+/)
  .map((s) => s.trim())
  .filter(Boolean);
const memExcludedIps = new Set<string>();

const dayKey = (d = new Date()) => `analytics:visitors:${d.toISOString().slice(0, 10)}`;

/** Is een path de afrekenpagina? (start-with, zodat sub-stappen meetellen) */
function isCheckoutPath(path?: string): boolean {
  if (!path) return false;
  const clean = path.split("?")[0];
  return clean === CHECKOUT_PATH || clean.startsWith(`${CHECKOUT_PATH}/`);
}

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

/* ------------------------------------------------------------------ */
/* IP-uitsluiting                                                      */
/* ------------------------------------------------------------------ */

/** Door de admin beheerde (KV) lijst met uitgesloten IP's. */
async function getCustomExcludedIps(): Promise<string[]> {
  try {
    if (isKvEnabled()) return await kvSMembers(EXCLUDED_IPS_KEY);
    return [...memExcludedIps];
  } catch {
    return [];
  }
}

/**
 * Telt dit IP NIET mee in rapportages/live? Snelle env-check eerst, daarna de
 * door de admin beheerde KV-lijst. Best-effort: faalt KV, dan alleen env.
 */
export async function isExcludedIp(ip: string): Promise<boolean> {
  if (!ip) return false;
  if (ENV_EXCLUDED_IPS.includes(ip)) return true;
  const custom = await getCustomExcludedIps();
  return custom.includes(ip);
}

/** Env-IP's (read-only) + door admin toegevoegde IP's (KV). */
export async function listExcludedIps(): Promise<{ env: string[]; custom: string[] }> {
  return { env: [...ENV_EXCLUDED_IPS], custom: await getCustomExcludedIps() };
}

/** Voeg een IP toe aan de KV-uitsluitlijst. */
export async function addExcludedIp(ip: string): Promise<void> {
  const clean = ip.trim();
  if (!clean) return;
  try {
    if (isKvEnabled()) await kvSAdd(EXCLUDED_IPS_KEY, clean);
    else memExcludedIps.add(clean);
  } catch {
    /* best-effort */
  }
}

/** Verwijder een IP uit de KV-uitsluitlijst. */
export async function removeExcludedIp(ip: string): Promise<void> {
  const clean = ip.trim();
  if (!clean) return;
  try {
    if (isKvEnabled()) await kvSRem(EXCLUDED_IPS_KEY, clean);
    else memExcludedIps.delete(clean);
  } catch {
    /* best-effort */
  }
}

/* ------------------------------------------------------------------ */
/* Aanwezigheid (live)                                                 */
/* ------------------------------------------------------------------ */

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

interface SessionRecord {
  path: string;
  ts: number;
  checkout: boolean;
}

/**
 * Werk de live-sessie van een bezoeker bij: huidige pagina + afreken-vlag, met
 * korte TTL. Houdt daarnaast een index-set bij zodat we sessies kunnen oplijsten.
 */
async function touchSession(visitorId: string, path?: string): Promise<void> {
  const rec: SessionRecord = { path: path || "/", ts: Date.now(), checkout: isCheckoutPath(path) };
  try {
    if (isKvEnabled()) {
      await kvSetEx(sessionKey(visitorId), JSON.stringify(rec), SESSION_TTL_S);
      // Index met een ruime marge zodat verlopen sessie-keys eruit gefilterd worden.
      await kvSAdd(SESSION_INDEX_KEY, visitorId);
    } else {
      memSessions.set(visitorId, rec);
    }
  } catch {
    /* best-effort */
  }
}

/**
 * Actieve live-sessies: per niet-verlopen bezoeker de huidige pagina, hoe lang
 * geleden en of die afrekent. Verlopen sessies (TTL) worden overgeslagen en uit
 * de index opgeruimd. Begrensd tot MAX_SESSIONS. Best-effort: leeg bij storing.
 */
export async function getLiveSessions(): Promise<
  { path: string; secondsAgo: number; checkout: boolean }[]
> {
  const now = Date.now();
  try {
    if (!isKvEnabled()) {
      const out: { path: string; secondsAgo: number; checkout: boolean }[] = [];
      for (const [vid, rec] of memSessions) {
        if (now - rec.ts > SESSION_TTL_S * 1000) {
          memSessions.delete(vid);
          continue;
        }
        out.push({
          path: rec.path,
          secondsAgo: Math.floor((now - rec.ts) / 1000),
          checkout: rec.checkout,
        });
      }
      return out
        .sort((a, b) => a.secondsAgo - b.secondsAgo)
        .slice(0, MAX_SESSIONS);
    }

    const ids = await kvSMembers(SESSION_INDEX_KEY);
    if (ids.length === 0) return [];
    const raws = await kvMGet(ids.map(sessionKey));
    const out: { path: string; secondsAgo: number; checkout: boolean }[] = [];
    const stale: string[] = [];
    ids.forEach((vid, i) => {
      const raw = raws[i];
      if (raw == null) {
        stale.push(vid); // sessie-key is verlopen (TTL) → uit de index halen
        return;
      }
      try {
        const rec = JSON.parse(raw) as SessionRecord;
        if (now - rec.ts > SESSION_TTL_S * 1000) {
          stale.push(vid);
          return;
        }
        out.push({
          path: rec.path,
          secondsAgo: Math.floor((now - rec.ts) / 1000),
          checkout: Boolean(rec.checkout),
        });
      } catch {
        stale.push(vid);
      }
    });
    // Opruimen (best-effort, niet awaiten zodat de respons snel blijft).
    for (const vid of stale) void kvSRem(SESSION_INDEX_KEY, vid);
    return out.sort((a, b) => a.secondsAgo - b.secondsAgo).slice(0, MAX_SESSIONS);
  } catch {
    return [];
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
      await touchSession(visitorId, path);
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
