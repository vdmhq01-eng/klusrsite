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
import { dirname, join } from "node:path";

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
  { name: "categorie-acties", size: "square_hd", seed: 2009, prompt: `Hardware and paint store aisle with bright red sale and discount price tags on shelves of paint cans and tools, ${STYLE}` },
  { name: "winkel-nijverdal", size: "landscape_4_3", seed: 3001, prompt: `Bright modern paint and hardware store interior with shelves of paint cans, ${STYLE}` },
  // Advies-blog hero's → public/generated/blog/<slug>.jpg (de artikelpagina gebruikt deze).
  { name: "blog/muur-verven-stappenplan", size: "landscape_16_9", seed: 4001, prompt: `A person painting a smooth interior wall with a paint roller, fresh light paint, masking tape along the trim, bright modern living room, ${STYLE}` },
  { name: "blog/juiste-kwast-of-roller-kiezen", size: "landscape_16_9", seed: 4002, prompt: `An assortment of paint brushes and paint rollers neatly arranged on a wooden workbench next to paint cans, ${STYLE}` },
  { name: "blog/kleur-kiezen-interieur", size: "landscape_16_9", seed: 4003, prompt: `Interior paint colour swatches and fan decks fanned out on a table in a styled modern living room, warm and cool tones, ${STYLE}` },
  { name: "blog/schutting-beitsen", size: "landscape_16_9", seed: 4004, prompt: `Applying brown wood stain with a brush to a wooden garden fence on a sunny day, ${STYLE}` },
  { name: "blog/stopcontact-veilig-vervangen", size: "landscape_16_9", seed: 4005, prompt: `Close-up of hands installing a white wall power socket with a screwdriver, neat electrical wiring, ${STYLE}` },
  { name: "blog/laminaat-leggen-tips", size: "landscape_16_9", seed: 4006, prompt: `Installing click laminate flooring planks in a bright empty room, spacer wedges along the skirting, ${STYLE}` },
  { name: "blog/hoeveel-verf-nodig-berekenen", size: "landscape_16_9", seed: 4007, prompt: `Paint cans, a measuring tape and a notepad with simple calculations on a wooden floor, planning a painting project, ${STYLE}` },
  { name: "blog/latex-muurverf-sausverf-verschil", size: "landscape_16_9", seed: 4008, prompt: `Several cans of wall paint with matte and satin finishes lined up with a paint roller, ${STYLE}` },
  { name: "blog/primer-of-grondverf-wanneer-nodig", size: "landscape_16_9", seed: 4009, prompt: `Applying white primer to bare wood with a brush, preparing a smooth surface for painting, ${STYLE}` },
  { name: "blog/badkamer-schilderen-schimmelwerend", size: "landscape_16_9", seed: 4010, prompt: `Painting a clean modern bathroom wall with a roller, moisture resistant paint, tiles in the background, ${STYLE}` },
  { name: "blog/buiten-schilderen-temperatuur-seizoen", size: "landscape_16_9", seed: 4011, prompt: `Painting the exterior wooden window frames of a house in spring sunshine, brush and paint pot, ${STYLE}` },
  { name: "blog/kozijnen-schilderen-stappenplan", size: "landscape_16_9", seed: 4012, prompt: `Painting a white wooden window frame with a brush to a glossy finish, masking tape on the glass, ${STYLE}` },
  { name: "blog/behang-verwijderen-muur-voorbereiden", size: "landscape_16_9", seed: 4013, prompt: `Stripping old wallpaper from a wall with a scraper, a partially bare and prepared wall, ${STYLE}` },
  { name: "blog/schuurpapier-korrel-kiezen", size: "landscape_16_9", seed: 4014, prompt: `Assorted sandpaper sheets of different grits with a sanding block on a workbench, fine wood dust, ${STYLE}` },
  { name: "blog/mengverf-elke-kleur-laten-mengen", size: "landscape_16_9", seed: 4015, prompt: `A paint mixing machine dispensing custom coloured paint into a can in a paint shop, vibrant colour swatches, ${STYLE}` },
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
  await mkdir(dirname(file), { recursive: true });
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
