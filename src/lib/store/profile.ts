import { isKvEnabled, kvGetJSON, kvSetJSON } from "./kv";

/**
 * Klantprofiel: het bewaarde bezorgadres, telefoonnummer en (zakelijke) gegevens
 * van een ingelogde klant. Hiermee hoeft een ingelogde klant z'n adres niet bij
 * elke checkout opnieuw in te vullen — de checkout vult het voor en bewaart het
 * bij het afrekenen.
 *
 * Bewust losgekoppeld van de auth-`User`: het profiel staat op het e-mailadres
 * van de sessie, dus het werkt voor elk ingelogd account. Net als de orderstore
 * dual-cache: KV wanneer geconfigureerd, anders in-memory (demo).
 */

export interface SavedAddress {
  firstName?: string;
  lastName?: string;
  /** Straatnaam (zonder huisnummer). */
  street?: string;
  houseNumber?: string;
  houseNumberAddition?: string;
  postalCode?: string;
  city?: string;
  /** ISO-landcode, bv. "NL". */
  country?: string;
}

export interface CustomerProfile {
  email: string;
  name?: string;
  phone?: string;
  address?: SavedAddress;
  /** Zakelijke gegevens (optioneel). */
  company?: string;
  cocNumber?: string;
  vatNumber?: string;
  updatedAt?: string;
}

/** Een wijziging op het profiel — alle velden optioneel; alleen meegegeven velden tellen. */
export type ProfilePatch = Omit<CustomerProfile, "email" | "updatedAt">;

const mem = new Map<string, CustomerProfile>();
const norm = (e: string) => e.trim().toLowerCase();
const KEY = (e: string) => `profile:${norm(e)}`;

/** Niet-lege, getrimde string of undefined. */
function clean(v?: string): string | undefined {
  const s = v?.trim();
  return s ? s : undefined;
}

const ADDRESS_KEYS: (keyof SavedAddress)[] = [
  "firstName",
  "lastName",
  "street",
  "houseNumber",
  "houseNumberAddition",
  "postalCode",
  "city",
  "country",
];

/** Laad het profiel: eerst KV (indien aan), anders de in-memory cache. */
export async function getProfile(email: string): Promise<CustomerProfile | null> {
  const e = norm(email);
  if (isKvEnabled()) {
    const p = await kvGetJSON<CustomerProfile>(KEY(e));
    if (p) {
      mem.set(e, p);
      return p;
    }
  }
  return mem.get(e) ?? null;
}

/**
 * Werk het profiel bij. Velden die niet worden meegegeven blijven ongemoeid; het
 * adres wordt per veld samengevoegd. Een lege string wist het betreffende veld.
 */
export async function saveProfile(email: string, patch: ProfilePatch): Promise<CustomerProfile> {
  const e = norm(email);
  const current = (await getProfile(e)) ?? { email: e };
  const next: CustomerProfile = { ...current, email: e };

  if (patch.name !== undefined) next.name = clean(patch.name);
  if (patch.phone !== undefined) next.phone = clean(patch.phone);
  if (patch.company !== undefined) next.company = clean(patch.company);
  if (patch.cocNumber !== undefined) next.cocNumber = clean(patch.cocNumber);
  if (patch.vatNumber !== undefined) next.vatNumber = clean(patch.vatNumber);

  if (patch.address) {
    const merged: SavedAddress = { ...(current.address ?? {}) };
    for (const k of ADDRESS_KEYS) {
      const val = patch.address[k];
      if (val !== undefined) merged[k] = clean(val);
    }
    next.address = merged;
  }

  next.updatedAt = new Date().toISOString();
  mem.set(e, next);
  if (isKvEnabled()) await kvSetJSON(KEY(e), next);
  return next;
}
