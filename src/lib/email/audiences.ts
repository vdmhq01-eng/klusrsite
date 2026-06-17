/**
 * Resend Audiences (contactlijsten/segmenten).
 *
 * We onderhouden een paar handige audiences en vullen ze automatisch:
 *  - "KLUSR Nieuwsbrief" — nieuwsbrief-inschrijvingen
 *  - "KLUSR Klanten"     — iedereen die een bestelling plaatst
 *  - "KLUSR Zakelijk"    — zakelijke klanten (bedrijfsnaam ingevuld)
 *
 * De audiences worden bij eerste gebruik automatisch aangemaakt (en hun id
 * gecachet in KV + geheugen), zodat er niets handmatig in Resend hoeft. Alles is
 * best-effort en dependency-vrij (REST via fetch); zonder RESEND_API_KEY is het
 * een no-op zodat de shop in demo-modus blijft werken.
 */

import { isKvEnabled, kvGetJSON, kvSetJSON } from "@/lib/store/kv";

const API_KEY = process.env.RESEND_API_KEY;
const BASE = "https://api.resend.com";

export const AUDIENCES = {
  NEWSLETTER: "KLUSR Nieuwsbrief",
  CUSTOMERS: "KLUSR Klanten",
  BUSINESS: "KLUSR Zakelijk",
} as const;

export type AudienceName = (typeof AUDIENCES)[keyof typeof AUDIENCES];

const idCache = new Map<string, string>();

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
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
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) {
      console.error("[resend-audiences]", path, res.status);
      return null;
    }
    return (await res.json().catch(() => null)) as T | null;
  } catch (err) {
    console.error("[resend-audiences] request failed", err);
    return null;
  }
}

/** Vind of maak een audience en cache het id (geheugen + KV). */
export async function ensureAudienceId(name: string): Promise<string | null> {
  if (!API_KEY) return null;
  const key = slug(name);
  const mem = idCache.get(key);
  if (mem) return mem;

  if (isKvEnabled()) {
    const cached = await kvGetJSON<string>(`resend:aud:${key}`);
    if (cached) {
      idCache.set(key, cached);
      return cached;
    }
  }

  // Bestaat de audience al? (voorkomt duplicaten, ook zonder KV)
  const list = await api<{ data?: { id: string; name: string }[] }>("/audiences");
  let id = list?.data?.find((a) => a.name?.toLowerCase() === name.toLowerCase())?.id ?? null;

  if (!id) {
    const created = await api<{ id?: string }>("/audiences", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    id = created?.id ?? null;
  }

  if (id) {
    idCache.set(key, id);
    if (isKvEnabled()) await kvSetJSON(`resend:aud:${key}`, id);
  }
  return id;
}

/** Voeg (best-effort) een contact toe aan een audience. */
export async function addContact(input: {
  audience: string;
  email: string;
  firstName?: string;
  lastName?: string;
  unsubscribed?: boolean;
}): Promise<void> {
  if (!API_KEY) return;
  try {
    const id = await ensureAudienceId(input.audience);
    if (!id) return;
    await api(`/audiences/${id}/contacts`, {
      method: "POST",
      body: JSON.stringify({
        email: input.email.trim().toLowerCase(),
        first_name: input.firstName || undefined,
        last_name: input.lastName || undefined,
        unsubscribed: input.unsubscribed ?? false,
      }),
    });
  } catch {
    /* een marketing-sync mag nooit een flow breken */
  }
}
