import { NextResponse } from "next/server";
import { getAdminSession } from "@/auth";
import { generateImage, isFalConfigured } from "@/lib/fal";
import {
  HERO_CATEGORY_SLUGS,
  SITE_IMAGE_SLUGS,
  getAllImages,
  heroPrompt,
  isManagedHeroSlug,
  setHeroImage,
} from "@/lib/store/hero";

/**
 * Admin: sfeerbeelden (hero's) genereren via fal.ai.
 *
 * Beheert zowel de categorie-hero's als de losse site-slots (homepage-banner,
 * advies, winkels) — alles onder dezelfde `hero:<slug>`-KV-keys.
 *
 * GET  → { configured, images } — toont per slug (categorie ∪ site-slot) de
 *        huidige (gecachete) URL.
 * POST → { slug? } — genereert + bewaart voor één slug (met slug) of voor ALLE
 *        beheerde slugs (zonder slug, sequentieel & best-effort).
 *
 * Gooit nooit: fal-fouten komen als per-slug `{ ok:false, message }` terug.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface HeroJobResult {
  slug: string;
  ok: boolean;
  url?: string;
  message?: string;
}

/** Alle beheerde slugs: eerst de categorieën, dan de losse site-slots. */
const ALL_SLUGS: string[] = [...HERO_CATEGORY_SLUGS, ...SITE_IMAGE_SLUGS];

/** Genereer + bewaar één slug. Vangt alles af en geeft een resultaat terug. */
async function generateOne(slug: string): Promise<HeroJobResult> {
  try {
    const res = await generateImage(heroPrompt(slug));
    if (!res.ok) {
      return { slug, ok: false, message: res.message };
    }
    await setHeroImage(slug, res.url);
    return { slug, ok: true, url: res.url };
  } catch (err) {
    // Vangnet: generateImage/setHeroImage gooien niet, maar voor de zekerheid.
    console.error("[admin/hero] generateOne failed", slug, err instanceof Error ? err.name : err);
    return { slug, ok: false, message: "Onbekende fout tijdens genereren." };
  }
}

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const images = await getAllImages();
  return NextResponse.json({ configured: isFalConfigured(), images });
}

export async function POST(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Body is optioneel; lege/ongeldige body → genereer alles.
  let slug: string | undefined;
  try {
    const body = (await req.json()) as { slug?: unknown };
    if (typeof body.slug === "string" && body.slug.trim()) slug = body.slug.trim();
  } catch {
    /* geen/ongeldige JSON → behandel als "genereer alles" */
  }

  if (!isFalConfigured()) {
    return NextResponse.json(
      { ok: false, results: [], message: "fal.ai is niet geconfigureerd (FAL_API_KEY ontbreekt)." },
      { status: 200 },
    );
  }

  // Eén specifieke slug (categorie of site-slot).
  if (slug) {
    if (!isManagedHeroSlug(slug)) {
      return NextResponse.json({ ok: false, results: [], message: "Onbekende afbeelding-slot." }, { status: 400 });
    }
    const result = await generateOne(slug);
    return NextResponse.json({ ok: result.ok, results: [result] });
  }

  // Alles (categorieën + site-slots) — sequentieel (image-gen is zwaar) en best-effort.
  const results: HeroJobResult[] = [];
  for (const s of ALL_SLUGS) {
    results.push(await generateOne(s));
  }
  return NextResponse.json({ ok: results.every((r) => r.ok), results });
}
