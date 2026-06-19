/**
 * Resend Broadcasts — verstuur een nieuwsbrief naar een hele audience.
 *
 * Dependency-vrij (REST via fetch), gemodelleerd naar `audiences.ts`'s `api()`:
 * Bearer RESEND_API_KEY, korte timeout, gooit nooit. Zonder RESEND_API_KEY is
 * alles een no-op (demo-modus) zodat de admin-tool blijft werken.
 *
 * Let op: het FROM-domein moet geverifieerd zijn in Resend en een broadcast
 * MOET een uitschrijflink bevatten ({{{RESEND_UNSUBSCRIBE_URL}}}).
 */

const API_KEY = process.env.RESEND_API_KEY;
const BASE = "https://api.resend.com";

/** Afzender voor de nieuwsbrief (apart van transactionele mail). */
export const NEWSLETTER_FROM =
  process.env.NEWSLETTER_FROM || "KLUSR <nieuwsbrief@klus-r.nl>";
/** Antwoorden komen bij de klantenservice terecht. */
export const NEWSLETTER_REPLY_TO =
  process.env.EMAIL_REPLY_TO || "klantenservice@klus-r.nl";

export function isBroadcastConfigured(): boolean {
  return Boolean(API_KEY);
}

async function api<T>(path: string, init?: RequestInit): Promise<T | null> {
  if (!API_KEY) return null;
  try {
    const res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[resend-broadcast]", path, res.status, detail);
      return null;
    }
    return (await res.json().catch(() => null)) as T | null;
  } catch (err) {
    console.error("[resend-broadcast] request failed", err);
    return null;
  }
}

export interface CreateBroadcastInput {
  audienceId: string;
  from: string;
  subject: string;
  html: string;
  text?: string;
  /** Interne naam in het Resend-dashboard. */
  name: string;
  replyTo?: string;
}

/**
 * Maak een broadcast aan (nog niet verstuurd). Geeft `{ id }` terug, of null
 * wanneer Resend niet geconfigureerd is of de call faalt.
 */
export async function createBroadcast(
  input: CreateBroadcastInput,
): Promise<{ id: string } | null> {
  const data = await api<{ id?: string }>("/broadcasts", {
    method: "POST",
    body: JSON.stringify({
      audience_id: input.audienceId,
      from: input.from,
      subject: input.subject,
      html: input.html,
      ...(input.text ? { text: input.text } : {}),
      name: input.name,
      reply_to: input.replyTo || NEWSLETTER_REPLY_TO,
    }),
  });
  return data?.id ? { id: data.id } : null;
}

/**
 * Verstuur een eerder aangemaakte broadcast. Met `scheduledAt` (ISO of natuurlijke
 * taal zoals "in 1 hour") plant Resend 'm in; anders gaat-ie meteen de deur uit.
 * Geeft true terug bij succes.
 */
export async function sendBroadcast(
  id: string,
  opts?: { scheduledAt?: string },
): Promise<boolean> {
  if (!API_KEY) return false;
  const body = opts?.scheduledAt ? { scheduled_at: opts.scheduledAt } : {};
  const data = await api<{ id?: string }>(`/broadcasts/${id}/send`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return data != null;
}

/**
 * Ruwe schatting van het aantal (actieve) contacten in een audience. Best-effort:
 * telt de contacten in `data` die niet `unsubscribed` zijn. Geeft null terug bij
 * een fout (bijv. niet geconfigureerd of paginering).
 */
export async function audienceContactCount(
  audienceId: string,
): Promise<number | null> {
  const data = await api<{ data?: { unsubscribed?: boolean }[] }>(
    `/audiences/${audienceId}/contacts`,
  );
  if (!data?.data || !Array.isArray(data.data)) return null;
  return data.data.filter((c) => !c.unsubscribed).length;
}
