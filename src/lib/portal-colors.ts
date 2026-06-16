import type { SelectedColor } from "@/types";
import { colorCollections, type ColorCollection } from "@/lib/data/colors";

/**
 * Verbinding met de DVM-kleurenkiezerportal (repo: vdmhq01-eng/dashboardvdm).
 * Haalt de gesynchroniseerde Gamma/Kleurenwaaier- + AkzoNobel-kleuren op uit de
 * publieke dashboard-API (CORS staat open). Valt netjes terug op de gecureerde
 * set bij een fout of lege respons, en cachet het resultaat per sessie.
 *
 * Overschrijfbaar via NEXT_PUBLIC_KLEURENKIEZER_API (bv. https://kleur.devoordeelmarkt.nl).
 */
const API_BASE = (
  process.env.NEXT_PUBLIC_KLEURENKIEZER_API || "https://dashboardvdm.vercel.app"
).replace(/\/+$/, "");
// Volledige feed: alle collecties + kleuren (en later bases). Val terug op de
// lichtere public-colors als de feed onverhoopt faalt.
const FEED_URL = `${API_BASE}/api/kleurenkiezer/feed`;
const FALLBACK_URL = `${API_BASE}/api/kleurenkiezer/public-colors`;

interface PortalColor {
  name?: string;
  code?: string;
  hex?: string;
  collectionId?: string | number;
  collection?: string;
  provider?: string;
}

function normalizeHex(h?: string): string {
  const raw = (h ?? "").trim();
  if (!raw) return "#cccccc";
  return raw.charAt(0) === "#" ? raw : `#${raw}`;
}

let cache: ColorCollection[] | null = null;

async function loadFrom(url: string): Promise<ColorCollection[] | null> {
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    const data = (await res.json()) as { colors?: PortalColor[] };
    const rows = Array.isArray(data?.colors) ? data.colors : [];
    if (!rows.length) return null;

    const byId = new Map<string, ColorCollection>();
    for (const c of rows) {
      const name = String(c?.name || c?.code || "").trim();
      if (!name) continue;
      const collectionName = String(c?.collection || "Kleuren").trim();
      const id = String(c?.collectionId || collectionName);
      if (!byId.has(id)) byId.set(id, { id, name: collectionName, colors: [] });
      byId.get(id)!.colors.push({
        name,
        code: String(c?.code || name),
        hex: normalizeHex(c?.hex),
        collection: collectionName,
        provider: c?.provider ? String(c.provider) : undefined,
      } as SelectedColor);
    }
    const collections = [...byId.values()].filter((c) => c.colors.length);
    // Grootste collecties eerst, voor vindbaarheid in de pillsbalk.
    collections.sort((a, b) => b.colors.length - a.colors.length);
    return collections.length ? collections : null;
  } catch {
    return null;
  }
}

export async function fetchPortalColors(): Promise<ColorCollection[]> {
  if (cache) return cache;
  cache = (await loadFrom(FEED_URL)) || (await loadFrom(FALLBACK_URL)) || colorCollections;
  return cache;
}
