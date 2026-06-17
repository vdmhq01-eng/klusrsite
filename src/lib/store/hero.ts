/**
 * Hero-afbeeldingen per categorie (gegenereerd via fal.ai).
 *
 * De admin-tool (/api/admin/hero) genereert per hoofdcategorie een wide
 * sfeerbeeld en bewaart de resulterende fal.media-URL hier; de categoriepagina
 * leest die URL en toont 'm achter de bestaande donkere gradient.
 *
 * KV-backed met in-memory fallback (demo). Best-effort: gooit NOOIT en geeft
 * `undefined` terug bij elke storing, zodat de pagina altijd terugvalt op de
 * bestaande gradient-hero.
 *
 * LET OP: fal.media-URL's worden hier in KV gecachet. Mochten ze ooit
 * verlopen (kapotte afbeelding), genereer ze dan opnieuw via de admin-tool
 * "Hero-afbeeldingen".
 */

import { categories } from "@/lib/data";
import { isKvEnabled, kvGetJSON, kvMGet, kvSetJSON } from "./kv";

const key = (slug: string) => `hero:${slug}`;

/** In-memory fallback (per serverinstance) als KV uit staat of faalt. */
const mem = new Map<string, string>();

/**
 * De hoofdcategorie-slugs waarvoor we hero's beheren. "acties" valt hier bewust
 * buiten: die pagina heeft een eigen themablok.
 */
export const HERO_CATEGORY_SLUGS: string[] = categories
  .filter((c) => c.slug !== "acties")
  .map((c) => c.slug);

/**
 * Gemeenschappelijke stijl-instructie voor élke hero: premium, fotografisch en
 * WIDE, zodat 'ie goed werkt achter een donkere gradient met witte tekst.
 */
const STYLE_SUFFIX =
  "professional, cinematic, soft natural lighting, modern Dutch home/workshop, " +
  "shallow depth of field, no text, no watermark, high detail, photorealistic, " +
  "wide banner composition, subtle warm tones";

/**
 * Categorie-specifiek onderwerp per hoofdcategorie-slug. In het Engels
 * geschreven (beter voor het model), maar in Nederlandse klus-context.
 */
const HERO_SUBJECTS: Record<string, string> = {
  verf:
    "a professional painter rolling fresh paint onto a smooth interior wall, " +
    "open paint cans and colour swatches on the floor, clean modern living room",
  "afbouw-fijnbouw":
    "a plasterer smoothing a wall with a trowel, filler and plaster tools, " +
    "freshly finished drywall in a bright renovation room",
  ijzerwaren:
    "an organised wall of screws, bolts, wall plugs and door hardware in labelled " +
    "bins, brass hinges and locks neatly arranged",
  elektra:
    "modern wall sockets and light switches being installed, coiled electrical " +
    "cable and a screwdriver on a clean white wall",
  gereedschap:
    "neatly arranged power tools and hand tools on a wooden workbench, cordless " +
    "drill, measuring tape and a tidy tool wall",
  tuin:
    "a tidy modern garden with wooden decking and green plants, garden tools and " +
    "a watering can, warm late-afternoon light",
  verlichting:
    "warm modern interior lighting fixtures and pendant lamps glowing at dusk in a " +
    "cosy living room, soft golden light",
  "vloeren-raam":
    "newly laid laminate flooring in a bright modern room with elegant window " +
    "blinds, planks and an underlay roll nearby",
};

/** Generieke fallback voor een onbekende (toekomstige) categorie-slug. */
const GENERIC_SUBJECT =
  "a premium DIY and home-improvement scene with tools and materials neatly arranged " +
  "in a modern Dutch home or workshop";

/**
 * Bouw de volledige fal.ai-prompt voor een categorie-slug: onderwerp + de
 * gedeelde premium/cinematische stijlinstructie.
 */
export function heroPrompt(slug: string): string {
  const subject = HERO_SUBJECTS[slug] ?? GENERIC_SUBJECT;
  return `${subject}, ${STYLE_SUFFIX}`;
}

/** Hele prompt-map (slug → prompt) voor de bekende hoofdcategorieën. */
export const HERO_PROMPTS: Record<string, string> = Object.fromEntries(
  HERO_CATEGORY_SLUGS.map((slug) => [slug, heroPrompt(slug)]),
);

/** Lees de bewaarde hero-URL voor een categorie. `undefined` bij storing/leeg. */
export async function getHeroImage(slug: string): Promise<string | undefined> {
  try {
    if (isKvEnabled()) {
      const url = await kvGetJSON<string>(key(slug));
      if (typeof url === "string" && url) return url;
    }
  } catch {
    /* val terug op memory */
  }
  return mem.get(slug);
}

/** Bewaar de hero-URL voor een categorie (KV + memory). Best-effort. */
export async function setHeroImage(slug: string, url: string): Promise<void> {
  if (!slug || !url) return;
  mem.set(slug, url);
  try {
    if (isKvEnabled()) await kvSetJSON(key(slug), url);
  } catch {
    /* memory is al gezet; KV-fout negeren */
  }
}

/**
 * Lees alle bekende hero-URL's als `{ slug: url }`. Mist een categorie een
 * afbeelding, dan staat 'ie simpelweg niet in het resultaat. Leeg bij storing.
 */
export async function getAllHeroImages(): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  try {
    if (isKvEnabled()) {
      // Eén MGET voor alle bekende slugs i.p.v. N losse GET's.
      const raw = await kvMGet(HERO_CATEGORY_SLUGS.map(key));
      HERO_CATEGORY_SLUGS.forEach((slug, i) => {
        const v = raw[i];
        if (typeof v !== "string" || !v) return;
        // KV bewaart JSON-strings; parse de gequote URL netjes terug.
        try {
          const parsed = JSON.parse(v) as unknown;
          if (typeof parsed === "string" && parsed) out[slug] = parsed;
        } catch {
          // Mocht het ooit een kale string zijn (geen JSON), gebruik 'm dan zo.
          out[slug] = v;
        }
      });
      return out;
    }
  } catch {
    /* val terug op memory */
  }
  for (const slug of HERO_CATEGORY_SLUGS) {
    const v = mem.get(slug);
    if (v) out[slug] = v;
  }
  return out;
}
