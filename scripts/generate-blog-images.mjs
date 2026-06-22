#!/usr/bin/env node
/**
 * Genereert per advies-blog één hero-foto met fal.ai (FLUX) en slaat die op in
 * public/generated/blog/<slug>.jpg. De artikelpagina gebruikt die foto zodra hij
 * bestaat; anders valt hij netjes terug op de on-brand BrandedVisual.
 *
 * Gebruik:
 *   FAL_API_KEY=xxxxxxxx node scripts/generate-blog-images.mjs
 *   (FAL_KEY werkt ook). Bestaande bestanden worden overgeslagen; verwijder een
 *   .jpg om die opnieuw te genereren.
 */
import { mkdir, writeFile, access } from "node:fs/promises";
import { join } from "node:path";

const FAL_KEY = process.env.FAL_API_KEY || process.env.FAL_KEY;
if (!FAL_KEY) {
  console.error("✗ Zet FAL_API_KEY (of FAL_KEY) in je omgeving en probeer opnieuw.");
  process.exit(1);
}

const OUT_DIR = "public/generated/blog";
const MODEL = "fal-ai/flux/schnell"; // snel + goedkoop; pas aan naar flux/dev voor hogere kwaliteit
const STYLE =
  ", professional editorial photography, photorealistic, bright natural soft lighting, " +
  "high detail, clean composition, Dutch home improvement context, no text, no watermark, no logos";

/** slug → beeld-prompt (onderwerp-specifiek, zodat elke blog een eigen, passende foto krijgt). */
const PROMPTS = {
  "muur-verven-stappenplan":
    "A person painting a smooth interior wall with a paint roller, fresh light paint, masking tape along the trim, bright modern living room",
  "juiste-kwast-of-roller-kiezen":
    "An assortment of paint brushes and paint rollers neatly arranged on a wooden workbench next to paint cans",
  "kleur-kiezen-interieur":
    "Interior paint colour swatches and fan decks fanned out on a table in a styled modern living room, warm and cool tones",
  "schutting-beitsen":
    "Applying brown wood stain with a brush to a wooden garden fence on a sunny day, rich saturated tone",
  "stopcontact-veilig-vervangen":
    "Close-up of hands installing a white wall power socket with a screwdriver, neat electrical wiring, safe DIY",
  "laminaat-leggen-tips":
    "Installing click laminate flooring planks in a bright empty room, spacer wedges along the skirting",
  "hoeveel-verf-nodig-berekenen":
    "Paint cans, a measuring tape and a notepad with simple calculations on a wooden floor, planning a painting project",
  "latex-muurverf-sausverf-verschil":
    "Several cans of wall paint with matte and satin finishes lined up with a paint roller, clean studio product shot",
  "primer-of-grondverf-wanneer-nodig":
    "Applying white primer to bare wood with a brush, preparing a smooth surface for painting",
  "badkamer-schilderen-schimmelwerend":
    "Painting a clean modern bathroom wall with a roller, moisture resistant paint, tiles in the background",
  "buiten-schilderen-temperatuur-seizoen":
    "Painting the exterior wooden window frames of a house in spring sunshine, brush and paint pot",
  "kozijnen-schilderen-stappenplan":
    "Painting a white wooden window frame with a brush to a glossy finish, masking tape on the glass",
  "behang-verwijderen-muur-voorbereiden":
    "Stripping old wallpaper from a wall with a scraper, a partially bare and prepared wall",
  "schuurpapier-korrel-kiezen":
    "Assorted sandpaper sheets of different grits with a sanding block on a workbench, fine wood dust",
  "mengverf-elke-kleur-laten-mengen":
    "A paint mixing machine dispensing custom coloured paint into a can in a paint shop, vibrant colour swatches",
};

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function generate(slug, prompt) {
  const out = join(OUT_DIR, `${slug}.jpg`);
  if (await fileExists(out)) {
    console.log(`• overslaan (bestaat al): ${slug}`);
    return;
  }
  process.stdout.write(`• genereren: ${slug} … `);
  const res = await fetch(`https://fal.run/${MODEL}`, {
    method: "POST",
    headers: { Authorization: `Key ${FAL_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: prompt + STYLE,
      image_size: "landscape_16_9",
      num_images: 1,
      enable_safety_checker: true,
    }),
  });
  if (!res.ok) {
    console.log(`MISLUKT (${res.status})`);
    console.error(`  ${(await res.text()).slice(0, 300)}`);
    return;
  }
  const data = await res.json();
  const url = data?.images?.[0]?.url;
  if (!url) {
    console.log("MISLUKT (geen image-url in respons)");
    return;
  }
  const img = await fetch(url);
  const buf = Buffer.from(await img.arrayBuffer());
  await writeFile(out, buf);
  console.log(`ok (${Math.round(buf.length / 1024)} kB)`);
}

await mkdir(OUT_DIR, { recursive: true });
console.log(`fal.ai → ${OUT_DIR} (${Object.keys(PROMPTS).length} afbeeldingen)\n`);
for (const [slug, prompt] of Object.entries(PROMPTS)) {
  try {
    await generate(slug, prompt);
  } catch (err) {
    console.log(`MISLUKT: ${slug} — ${err?.message ?? err}`);
  }
  await new Promise((r) => setTimeout(r, 400));
}
console.log("\nKlaar. Vergeet niet de nieuwe afbeeldingen te committen.");
