/**
 * Eenmalige/bootstrap re-map: zet de subCategory van bestaande verf-producten in
 * de gecommitte snapshot om naar de nieuwe taxonomie (mapVerfSub), zónder de feed
 * opnieuw op te halen. Zo zijn de nieuwe verf-landingspagina's direct gevuld.
 *
 * Veilig: idempotent en gebruikt exact dezelfde mapVerfSub als de feed-build.
 * Draaien: `node scripts/remap-verf-subcategories.mjs`.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mapVerfSub } from "./lib/catalog-map.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = join(__dirname, "..", "src", "lib", "data", "feed-products.generated.json");

const data = JSON.parse(readFileSync(FILE, "utf8"));
const products = Array.isArray(data) ? data : data.products || [];

let changed = 0;
const counts = {};
for (const p of products) {
  if (p.category !== "verf") continue;
  const text = `${p.title || ""} ${(p.highlights || []).join(" ")} ${p.description || ""}`;
  const sub = mapVerfSub(text, "");
  if (sub !== p.subCategory) changed++;
  p.subCategory = sub;
  counts[sub] = (counts[sub] || 0) + 1;
}

writeFileSync(FILE, JSON.stringify(data, null, 2) + "\n");
console.log(`Verf-producten opnieuw ingedeeld — ${changed} gewijzigd.`);
console.log("Nieuwe verdeling:");
for (const [k, v] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(v).padStart(4)}  ${k}`);
}
