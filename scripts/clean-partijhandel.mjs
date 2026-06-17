/**
 * Eenmalige opschoning van de gecommitte catalogus-snapshot: haal het
 * groothandelskanaal "Partijhandel"/"Partij" uit titels, slugs, merk, highlights
 * en specs. De feed-rebuild op Vercel doet dit voortaan automatisch (zie
 * catalog-map.mjs); dit script maakt de bestaande snapshot meteen schoon zodat
 * het ook klopt als de live-feed-sync een keer faalt en op de snapshot terugvalt.
 *
 *   node scripts/clean-partijhandel.mjs
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { stripWholesaleNoise, cleanBrand, slugify } from "./lib/catalog-map.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = join(__dirname, "..", "src", "lib", "data", "feed-products.generated.json");

const data = JSON.parse(readFileSync(FILE, "utf8"));

let titles = 0;
let brands = 0;

for (const p of data.products) {
  const newTitle = stripWholesaleNoise(p.title || "");
  if (newTitle && newTitle !== p.title) {
    p.title = newTitle;
    const id = String(p.id).replace(/^tilroy-/, "");
    p.slug = `${slugify(newTitle)}-${id}`;
    titles++;
  }

  if (cleanBrand(p.brand) === "Onbekend" && p.brand !== "Onbekend") {
    p.brand = "Onbekend";
    brands++;
    if (Array.isArray(p.highlights)) {
      p.highlights = p.highlights.filter((h) => !/^\s*merk\s*:\s*partij/i.test(h));
    }
    if (Array.isArray(p.specifications)) {
      for (const grp of p.specifications) {
        if (Array.isArray(grp.items)) {
          grp.items = grp.items.filter(
            (it) => !(/merk/i.test(it.label) && /partij/i.test(it.value)),
          );
        }
      }
      p.specifications = p.specifications.filter((g) => g.items && g.items.length);
    }
  }

  if (p.description && /\bvan Partijhandel\b/i.test(p.description)) {
    p.description = p.description.replace(/\bvan Partijhandel\b/gi, "van KLUSR");
  }
}

writeFileSync(FILE, JSON.stringify(data, null, 2));
console.log(`✓ Opgeschoond: ${titles} titels, ${brands} merken (Partijhandel → Onbekend)`);
