import { isKvEnabled, kvGetJSON, kvSetJSON } from "./kv";
import { DEFAULT_SAFETY_STOCK } from "@/lib/stock";

/**
 * Door de owner instelbare winkelinstellingen (KV). Nu: de veiligheidsvoorraad
 * (drempel waaronder een product niet meer online verkocht wordt). Zonder KV
 * in-memory (reset bij cold start) — zet KV aan voor productie.
 */

const SAFETY_KEY = "settings:safety-stock";
let memSafety: number | undefined;

function clamp(n: number): number {
  return Math.max(0, Math.min(9999, Math.floor(Number.isFinite(n) ? n : DEFAULT_SAFETY_STOCK)));
}

/** Huidige veiligheidsvoorraad (valt terug op de default). */
export async function getSafetyStock(): Promise<number> {
  try {
    if (isKvEnabled()) {
      const v = await kvGetJSON<number>(SAFETY_KEY);
      if (typeof v === "number") return clamp(v);
    } else if (typeof memSafety === "number") {
      return memSafety;
    }
  } catch {
    /* val terug op de default */
  }
  return DEFAULT_SAFETY_STOCK;
}

/** Stel de veiligheidsvoorraad in (genormaliseerd). Geeft de bewaarde waarde terug. */
export async function setSafetyStock(value: number): Promise<number> {
  const safe = clamp(value);
  memSafety = safe;
  try {
    if (isKvEnabled()) await kvSetJSON(SAFETY_KEY, safe);
  } catch {
    /* best-effort */
  }
  return safe;
}
