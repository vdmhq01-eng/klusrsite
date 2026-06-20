import { isKvEnabled, kvGetJSON, kvSAdd, kvSetJSON, kvSMembers } from "./kv";

/**
 * Klusstore: bewaart de "kluspakketten" die de KLUSR Klushulp samenstelt — een
 * persoonlijke pagina met de échte catalogusproducten (met aantallen) die je
 * voor een klus nodig hebt. Net als de orderstore werkt het met persistente
 * opslag via KV (Upstash/Vercel KV) én een in-memory cache als fallback. Met KV
 * blijven kluspakketten bewaard tussen serverless-instances en deploys (nodig
 * voor de deelbare URL /klus/<id> en "Mijn klussen"); zonder KV draait alles
 * in-memory binnen één instance (demo).
 */

export interface KlusItem {
  productId: string;
  variantId?: string;
  quantity: number;
  /** Korte reden waarom dit artikel bij de klus hoort. */
  reason?: string;
}

export interface Klus {
  id: string;
  createdAt: string;
  title: string;
  intro?: string;
  /** De oorspronkelijke klusomschrijving van de klant. */
  query?: string;
  items: KlusItem[];
  /** E-mailadres van de ingelogde eigenaar (lowercase), indien ingelogd. */
  ownerEmail?: string;
}

const klussen = new Map<string, Klus>();
/** Per e-mailadres de set van klus-id's — in-memory fallback voor "Mijn klussen". */
const klussenByUser = new Map<string, Set<string>>();

const KEY = {
  klus: (id: string) => `klus:${id}`,
  user: (e: string) => `klus:user:${e.trim().toLowerCase()}`,
};

function generateId(): string {
  return "klus_" + Math.random().toString(36).slice(2, 10);
}

/** Schrijf een kluspakket weg naar de in-memory cache én (indien aan) naar KV. */
async function persist(klus: Klus): Promise<void> {
  klussen.set(klus.id, klus);
  if (klus.ownerEmail) {
    const set = klussenByUser.get(klus.ownerEmail) ?? new Set<string>();
    set.add(klus.id);
    klussenByUser.set(klus.ownerEmail, set);
  }
  if (!isKvEnabled()) return;
  await kvSetJSON(KEY.klus(klus.id), klus);
  if (klus.ownerEmail) await kvSAdd(KEY.user(klus.ownerEmail), klus.id);
}

/** Laad een kluspakket op id: eerst cache, dan KV. */
async function loadById(id: string): Promise<Klus | undefined> {
  const mem = klussen.get(id);
  if (mem) return mem;
  const kv = await kvGetJSON<Klus>(KEY.klus(id));
  if (kv) {
    klussen.set(kv.id, kv);
    return kv;
  }
  return undefined;
}

export interface CreateKlusInput {
  title: string;
  intro?: string;
  query?: string;
  items: KlusItem[];
  ownerEmail?: string;
}

export async function createKlus(input: CreateKlusInput): Promise<Klus> {
  const klus: Klus = {
    id: generateId(),
    createdAt: new Date().toISOString(),
    title: input.title,
    intro: input.intro,
    query: input.query,
    items: input.items,
    ownerEmail: input.ownerEmail?.trim().toLowerCase() || undefined,
  };
  await persist(klus);
  return klus;
}

export async function getKlus(id: string): Promise<Klus | null> {
  return (await loadById(id)) ?? null;
}

/** Kluspakketten van één klant (op e-mailadres), nieuwste eerst — voor "Mijn klussen". */
export async function listKlussenByEmail(email: string): Promise<Klus[]> {
  const target = email.trim().toLowerCase();
  if (!target) return [];
  const byId = new Map<string, Klus>();
  if (isKvEnabled()) {
    const ids = await kvSMembers(KEY.user(target));
    const loaded = await Promise.all(ids.map((id) => loadById(id)));
    for (const k of loaded) if (k) byId.set(k.id, k);
  }
  const memIds = klussenByUser.get(target);
  if (memIds) {
    for (const id of memIds) {
      const k = await loadById(id);
      if (k) byId.set(k.id, k);
    }
  }
  return [...byId.values()].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
