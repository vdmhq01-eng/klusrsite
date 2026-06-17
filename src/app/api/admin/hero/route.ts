import { NextResponse } from "next/server";
import { getAdminSession } from "@/auth";
import { generateImage, isFalConfigured } from "@/lib/fal";
import {
  HERO_CATEGORY_SLUGS,
  getAllHeroImages,
  heroPrompt,
  setHeroImage,
} from "@/lib/store/hero";

/**
 * Admin: hero-afbeeldingen voor categoriepagina's genereren via fal.ai.
 *
 * GET  → { configured, images } — toont per categorie de huidige (gecachete) URL.
 * POST → { slug? } — genereert + bewaart voor één categorie (met slug) of voor
 *        ALLE hoofdcategorieën (zonder slug, sequentieel & best-effort).
 *
 * Gooit nooit: fal-fouten komen als per-categorie `{ ok:false, message }` terug.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface HeroJobResult {
  slug: string;
  ok: boolean;
  url?: string;
  message?: string;
}

/** Genereer + bewaar één categorie. Vangt alles af en geeft een resultaat terug. */
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
  const images = await getAllHeroImages();
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

  // Eén specifieke categorie.
  if (slug) {
    if (!HERO_CATEGORY_SLUGS.includes(slug)) {
      return NextResponse.json({ ok: false, results: [], message: "Onbekende categorie." }, { status: 400 });
    }
    const result = await generateOne(slug);
    return NextResponse.json({ ok: result.ok, results: [result] });
  }

  // Alle hoofdcategorieën — sequentieel (image-gen is zwaar) en best-effort.
  const results: HeroJobResult[] = [];
  for (const s of HERO_CATEGORY_SLUGS) {
    results.push(await generateOne(s));
  }
  return NextResponse.json({ ok: results.every((r) => r.ok), results });
}
