/**
 * Minimale, dependency-vrije client voor de fal.ai SYNC image-API.
 *
 * Wordt gebruikt om brand-fitting hero-afbeeldingen voor categoriepagina's te
 * genereren (zie src/lib/store/hero.ts en de admin-tool /api/admin/hero).
 *
 * Activeren: zet `FAL_API_KEY` in Vercel. Zonder die env-var is de generatie uit
 * en valt de hero terug op de bestaande gradient (degradeert netjes). Optioneel
 * `FAL_HERO_MODEL` om het model te overrulen (default fal-ai/flux/dev).
 *
 * Alle calls vangen fouten af en geven een gestructureerd resultaat terug; ze
 * gooien NOOIT. De API-sleutel wordt nooit gelogd.
 */

/** Default text-to-image model. Override via env voor experimenten. */
const FAL_MODEL = process.env.FAL_HERO_MODEL || "fal-ai/flux/dev";

/** Image-gen is traag: ruime timeout (2 min) zodat we 'm niet te vroeg afkappen. */
const FAL_TIMEOUT_MS = 120_000;

export function isFalConfigured(): boolean {
  return Boolean(process.env.FAL_API_KEY);
}

/** Het exacte SYNC-endpoint dat we aanroepen (handig om te tonen/loggen). */
export function falEndpoint(): string {
  return `https://fal.run/${FAL_MODEL}`;
}

export type GenerateImageResult =
  | { ok: true; url: string }
  | { ok: false; status: number; message: string };

/** Minimale shape van een geslaagde fal.ai-respons (we lezen alleen images[0].url). */
interface FalImageResponse {
  images?: { url?: string; width?: number; height?: number }[];
}

/**
 * Genereer één wide (16:9) afbeelding op basis van `prompt`.
 *
 * Roept de fal.ai SYNC-endpoint aan (`POST https://fal.run/<model-id>`) en geeft
 * de URL van het eerste resultaat terug. Bij ontbrekende sleutel, een non-200
 * respons, een netwerkfout of een onverwachte body komt er een gestructureerde
 * fout terug i.p.v. een exception.
 *
 * Runtime-agnostisch: gebruikt alleen `fetch` + `AbortSignal.timeout`, zodat het
 * vanuit een nodejs-route (of edge) kan draaien.
 */
export async function generateImage(prompt: string): Promise<GenerateImageResult> {
  const apiKey = process.env.FAL_API_KEY;
  if (!apiKey) {
    return { ok: false, status: 0, message: "fal.ai is niet geconfigureerd (FAL_API_KEY ontbreekt)." };
  }

  const trimmed = prompt.trim();
  if (!trimmed) {
    return { ok: false, status: 0, message: "Lege prompt." };
  }

  try {
    const res = await fetch(falEndpoint(), {
      method: "POST",
      headers: {
        // LET OP: nooit de sleutel loggen.
        Authorization: `Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: trimmed,
        image_size: "landscape_16_9",
        num_images: 1,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(FAL_TIMEOUT_MS),
    });

    if (!res.ok) {
      // Probeer een nette foutmelding uit de body te halen; val terug op de status.
      let detail = "";
      try {
        const body = (await res.json()) as { detail?: unknown; error?: unknown; message?: unknown };
        detail =
          (typeof body.detail === "string" && body.detail) ||
          (typeof body.error === "string" && body.error) ||
          (typeof body.message === "string" && body.message) ||
          "";
      } catch {
        /* body is geen JSON — negeren */
      }
      return {
        ok: false,
        status: res.status,
        message: detail || `fal.ai gaf status ${res.status} terug.`,
      };
    }

    const data = (await res.json()) as FalImageResponse;
    const url = data.images?.[0]?.url;
    if (!url || typeof url !== "string") {
      return { ok: false, status: res.status, message: "fal.ai gaf geen afbeelding-URL terug." };
    }
    return { ok: true, url };
  } catch (err) {
    // Timeout (AbortError) of netwerkfout — niet de sleutel, wél de oorzaak loggen.
    const message =
      err instanceof Error && err.name === "TimeoutError"
        ? "fal.ai duurde te lang (timeout)."
        : "Kon fal.ai niet bereiken (netwerkfout).";
    console.error("[fal] generateImage failed", err instanceof Error ? err.name : err);
    return { ok: false, status: 0, message };
  }
}
