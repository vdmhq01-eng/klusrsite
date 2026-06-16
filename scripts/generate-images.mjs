/**
 * Sfeerbeelden genereren via fal.ai (FLUX schnell) → public/generated/*.jpg.
 *
 * Draait in de build-keten (vóór `next build`), maar **veilig by design**: zonder
 * key of bij een fout slaat hij netjes over en blijft de on-brand gradient-
 * fallback staan. Een mislukte generatie mag de deploy nooit breken.
 *
 * - Key: FAI_API_KEY (of FAL_KEY / FAL_API_KEY).
 * - Idempotent: bestaande bestanden worden overgeslagen. Commit public/generated
 *   om regeneratie (en kosten) per deploy te voorkomen.
 * - Vaste seeds → stabiele beelden tussen builds.
 *
 * Los draaien: `npm run images:generate`.
 */

import { mkdir, writeFile, access } from "node:fs/promises";
import { join } from "node:path";

const KEY = process.env.FAI_API_KEY || process.env.FAL_KEY || process.env.FAL_API_KEY;
const OUT_DIR = "public/generated";
const MODEL = "fal-ai/flux/schnell";
const REQ_TIMEOUT_MS = 60_000;

const STYLE = "professional lifestyle product photography, bright natural light, shallow depth of field, photorealistic, no text, no words, no logo, no watermark";

/** @type {{name:string, prompt:string, size:string, seed:number}[]} */
const IMAGES = [
  { name: "hero", size: "landscape_16_9", seed: 1001, prompt: `A person painting an interior wall at home with a paint roller, fresh light-grey paint, airy modern Dutch living room, cinematic, ${STYLE}` },
  { name: "categorie-verf", size: "square_hd", seed: 2001, prompt: `Open paint cans with a roller and fanned colour swatches on a workbench, ${STYLE}` },
  { name: "categorie-afbouw-fijnbouw", size: "square_hd", seed: 2002, prompt: `Plastering a wall smooth with a trowel and filler, home renovation, ${STYLE}` },
  { name: "categorie-ijzerwaren", size: "square_hd", seed: 2003, prompt: `Neatly arranged screws, bolts and hinges in an organiser, close-up, workshop, ${STYLE}` },
  { name: "categorie-elektra", size: "square_hd", seed: 2004, prompt: `Installing a white wall socket with wiring in a modern home, ${STYLE}` },
  { name: "categorie-gereedschap", size: "square_hd", seed: 2005, prompt: `Power drill and assorted hand tools laid out on a wooden workbench, ${STYLE}` },
  { name: "categorie-tuin", size: "square_hd", seed: 2006, prompt: `Applying wood stain to a garden fence on a sunny day, outdoor, ${STYLE}` },
  { name: "categorie-verlichting", size: "square_hd", seed: 2007, prompt: `Warm LED bulbs and a modern pendant lamp glowing in a cosy interior, ${STYLE}` },
  { name: "categorie-vloeren-raam", size: "square_hd", seed: 2008, prompt: `Installing light oak laminate flooring in a bright living room, ${STYLE}` },
  { name: "winkel-nijverdal", size: "landscape_4_3", seed: 3001, prompt: `Bright modern paint and hardware store interior with shelves of paint cans, ${STYLE}` },
];

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function generateOne(img) {
  const file = join(OUT_DIR, `${img.name}.jpg`);
  if (await exists(file)) {
    console.log(`  • ${img.name}: bestaat al, overslaan`);
    return;
  }

  const res = await fetch(`https://fal.run/${MODEL}`, {
    method: "POST",
    headers: { Authorization: `Key ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: img.prompt,
      image_size: img.size,
      num_images: 1,
      seed: img.seed,
      enable_safety_checker: true,
      output_format: "jpeg",
    }),
    signal: AbortSignal.timeout(REQ_TIMEOUT_MS),
  });

  if (!res.ok) {
    console.warn(`  ⚠ ${img.name}: fal.ai ${res.status} — overslaan`);
    return;
  }

  const data = await res.json();
  const url = data?.images?.[0]?.url;
  if (!url) {
    console.warn(`  ⚠ ${img.name}: geen image-url in respons — overslaan`);
    return;
  }

  const imgRes = await fetch(url, { signal: AbortSignal.timeout(REQ_TIMEOUT_MS) });
  if (!imgRes.ok) {
    console.warn(`  ⚠ ${img.name}: download ${imgRes.status} — overslaan`);
    return;
  }

  const buf = Buffer.from(await imgRes.arrayBuffer());
  await writeFile(file, buf);
  console.log(`  ✓ ${img.name} (${Math.round(buf.length / 1024)} kB)`);
}

async function main() {
  if (!KEY) {
    console.log("→ Sfeerbeelden: geen FAI_API_KEY/FAL_KEY — overslaan (branded fallback blijft).");
    return;
  }
  console.log("→ Sfeerbeelden genereren via fal.ai…");
  await mkdir(OUT_DIR, { recursive: true });
  const results = await Promise.allSettled(IMAGES.map((img) => generateOne(img)));
  const failed = results.filter((r) => r.status === "rejected");
  if (failed.length) {
    console.warn(`⚠ ${failed.length}/${IMAGES.length} sfeerbeeld(en) niet gegenereerd — build gaat door.`);
  }
}

// Nooit de build breken op beeldgeneratie.
main().catch((e) => console.warn("⚠ Beeldgeneratie overgeslagen:", e?.message ?? e));
