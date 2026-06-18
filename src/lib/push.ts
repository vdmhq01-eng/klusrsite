import type { PushSubscription as WebPushSubscription } from "web-push";
import { kvSAdd, kvSMembers, kvSRem } from "./store/kv";

/**
 * Web Push (VAPID) voor het KLUSR-beheer. Stuurt meldingen naar de geabonneerde
 * beheerders bij een nieuwe bestelling of een nieuw gesprek met de Klushulp.
 *
 * Activeren: zet in productie de VAPID-sleutels als env-vars:
 *   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (een mailto:-adres)
 * Genereer een sleutelpaar met `npx web-push generate-vapid-keys`.
 *
 * Zonder deze env-vars is push UIT: `isPushEnabled()` is false en
 * `sendPushToAdmins` doet niets (geen throws). Abonnementen worden bewaard in KV
 * (Upstash/Vercel KV); zonder KV worden ze niet bewaard maar breekt er niets.
 * Alles is best-effort en gooit NOOIT, zodat het veilig vanuit de webhook of de
 * publieke chat kan worden aangeroepen (via `void`).
 */

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:info@klus-r.nl";

/** Set in KV waarin de browser-abonnementen (als JSON-strings) zijn opgeslagen. */
const SUBS_KEY = "push:subs";

/** Push is alleen actief als beide VAPID-sleutels aanwezig zijn. */
export function isPushEnabled(): boolean {
  return Boolean(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY);
}

/** De publieke VAPID-sleutel (veilig om aan de client te geven), leeg als uit. */
export function getPublicKey(): string {
  return VAPID_PUBLIC_KEY;
}

/** Het opgeslagen abonnement zoals de browser het levert. */
export type StoredSubscription = WebPushSubscription;

function endpointOf(value: unknown): string | null {
  if (value && typeof value === "object" && "endpoint" in value) {
    const ep = (value as { endpoint?: unknown }).endpoint;
    if (typeof ep === "string" && ep) return ep;
  }
  return null;
}

/** Lees alle bewaarde abonnementen uit KV. Leeg bij elke fout / zonder KV. */
export async function listSubscriptions(): Promise<StoredSubscription[]> {
  try {
    const raw = await kvSMembers(SUBS_KEY);
    const out: StoredSubscription[] = [];
    for (const s of raw) {
      try {
        const parsed = JSON.parse(s) as StoredSubscription;
        if (endpointOf(parsed)) out.push(parsed);
      } catch {
        /* sla onleesbare entry over */
      }
    }
    return out;
  } catch (err) {
    console.error("[push] listSubscriptions failed", err);
    return [];
  }
}

/**
 * Bewaar een abonnement, gededupliceerd op `endpoint`: verwijder eerst een
 * eventueel bestaand abonnement met hetzelfde endpoint en voeg dan de nieuwe
 * (mogelijk vernieuwde sleutels) toe. Best-effort.
 */
export async function addSubscription(sub: StoredSubscription): Promise<void> {
  try {
    const endpoint = endpointOf(sub);
    if (!endpoint) return;
    await removeSubscription(endpoint);
    await kvSAdd(SUBS_KEY, JSON.stringify(sub));
  } catch (err) {
    console.error("[push] addSubscription failed", err);
  }
}

/** Verwijder elk bewaard abonnement met dit endpoint. Best-effort. */
export async function removeSubscription(endpoint: string): Promise<void> {
  try {
    if (!endpoint) return;
    const raw = await kvSMembers(SUBS_KEY);
    for (const s of raw) {
      try {
        if (endpointOf(JSON.parse(s)) === endpoint) {
          await kvSRem(SUBS_KEY, s);
        }
      } catch {
        /* onleesbare entry: laten staan */
      }
    }
  } catch (err) {
    console.error("[push] removeSubscription failed", err);
  }
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

/**
 * Stuur een melding naar alle geabonneerde beheerders. Doet niets als push uit
 * is. Verlopen abonnementen (HTTP 404/410) worden opgeruimd. Volledig
 * afgeschermd: gooit NOOIT, zodat het via `void` vanuit de webhook of de chat
 * kan worden aangeroepen zonder die te kunnen breken.
 */
export async function sendPushToAdmins(payload: PushPayload): Promise<void> {
  try {
    if (!isPushEnabled()) return;

    const subs = await listSubscriptions();
    if (subs.length === 0) return;

    // Lazy import: web-push (en zijn afhankelijkheden) alleen laden als we ook
    // echt versturen — niet bij build of als push uit is. web-push is een
    // CommonJS-module met benoemde exports; de namespace gebruiken we direct.
    const webpush = await import("web-push");
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

    const data = JSON.stringify({
      title: payload.title,
      body: payload.body,
      url: payload.url || "/admin",
    });

    await Promise.all(
      subs.map(async (sub) => {
        try {
          await webpush.sendNotification(sub, data);
        } catch (err: unknown) {
          const statusCode =
            err && typeof err === "object" && "statusCode" in err
              ? (err as { statusCode?: number }).statusCode
              : undefined;
          // Abonnement verlopen/ongeldig → opruimen.
          if (statusCode === 404 || statusCode === 410) {
            const endpoint = endpointOf(sub);
            if (endpoint) await removeSubscription(endpoint);
          } else {
            console.error("[push] sendNotification failed", statusCode ?? err);
          }
        }
      }),
    );
  } catch (err) {
    console.error("[push] sendPushToAdmins failed", err);
  }
}
