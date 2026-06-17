/**
 * Bootstrap: verbeter de verf-titels in de gecommitte snapshot — verwijder
 * trailing "Ral"/"Ral 9001"-ruis en voeg de glansgraad toe als die ontbreekt.
 * Zelfde logica als de feed-build, maar op de bestaande snapshot zodat het
 * direct zichtbaar is. Draaien: `node scripts/remap-verf-titles.mjs`.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = join(__dirname, "..", "src", "lib", "data", "feed-products.generated.json");

const data = JSON.parse(readFileSync(FILE, "utf8"));
const products = Array.isArray(data) ? data : data.products || [];

function specVal(p, label) {
  for (const g of p.specifications || []) {
    for (const it of g.items || []) {
      if ((it.label || "").trim().toLowerCase() === label.toLowerCase()) return (it.value || "").trim();
    }
  }
  return "";
}

let changed = 0;
for (const p of products) {
  if (p.category !== "verf") continue;
  let t = (p.title || "").replace(/\s+ral(\s+\d{3,4})?\s*$/i, "").trim();
  const glans = specVal(p, "Glansgraad");
  if (glans && glans.length <= 20 && !t.toLowerCase().includes(glans.toLowerCase())) {
    t = `${t} ${glans}`.trim();
  }
  if (t && t !== p.title) {
    p.title = t;
    changed++;
  }
}

writeFileSync(FILE, JSON.stringify(data, null, 2) + "\n");
console.log(`Verf-titels verbeterd: ${changed} aangepast.`);
