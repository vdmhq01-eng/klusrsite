/**
 * Round-2 hercategorisatie van de gecommitte catalogus-snapshot.
 *
 * De durable logica leeft in scripts/lib/catalog-map.mjs (mapCategory /
 * subCategoryFor) en wordt bij een echte feed-rebuild toegepast. De snapshot
 * (src/lib/data/feed-products.generated.json) heeft echter GÉÉN productType,
 * dus patchen we hem hier op `title` + bestaande category/subCategory, exact
 * volgens dezelfde regels. Idempotent en herhaalbaar.
 *
 *   node scripts/recategorize-round2.mjs
 *
 * Drie scoped wijzigingen:
 *   1. "behang" wordt een eigen top-level categorie (uit afbouw-fijnbouw).
 *   2. "reiniging" wordt een eigen top-level categorie (de HG-producten uit
 *      gereedschap/huishoudelijk).
 *   3. Het gereedschap-bucket "schildersger-en-schuurpapier" splitst in
 *      "schuurmateriaal" vs. "schildersgereedschap".
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = join(__dirname, "..", "src", "lib", "data", "feed-products.generated.json");

// Dezelfde regels als in scripts/lib/catalog-map.mjs.
const BEHANG_TITLE_RE = /behang|vliesbehang|wandbekleding|glasweefsel|fotobehang/i;
const GLASWEEFSEL_RE = /glasweefsel/i;
const SCHUUR_RE =
  /schuur|korrel|glaspapier|schuurpapier|schuurblok|schuurspons|schuurvel|schuurband|schuurschijf|schuurrol|schuurgaas|grit|schuurmiddel/i;
const ONGEDIERTE_RE = /ongedierte|insect|mug|vlieg|slak|muiz|ratt|mier|wesp|gif/i;
const SCHIMMEL_RE = /schimmel|aanslag|groene aanslag/i;

const data = JSON.parse(readFileSync(FILE, "utf8"));
const products = data.products || [];

const tallyBefore = countByCategory(products);

let movedBehang = 0;
let movedReiniging = 0;
let splitPaintTools = 0;

for (const p of products) {
  const title = p.title || "";

  // 1. Behang → eigen categorie (uit afbouw-fijnbouw).
  if (
    p.category === "afbouw-fijnbouw" &&
    (p.subCategory === "behang" ||
      p.subCategory === "glasweefselbehang" ||
      BEHANG_TITLE_RE.test(title))
  ) {
    p.category = "behang";
    p.subCategory = GLASWEEFSEL_RE.test(title) ? "glasweefselbehang" : "behang";
    movedBehang++;
    continue;
  }

  // 2. Reiniging & onderhoud → eigen categorie (uit gereedschap/huishoudelijk).
  if (p.category === "gereedschap" && p.subCategory === "huishoudelijk") {
    p.category = "reiniging";
    if (ONGEDIERTE_RE.test(title)) p.subCategory = "ongediertebestrijding";
    else if (SCHIMMEL_RE.test(title)) p.subCategory = "schimmel-aanslag";
    else p.subCategory = "reinigers";
    movedReiniging++;
    continue;
  }

  // 3. Split van het gecombineerde schilders-/schuurbucket.
  if (p.subCategory === "schildersger-en-schuurpapier") {
    p.subCategory = SCHUUR_RE.test(title) ? "schuurmateriaal" : "schildersgereedschap";
    splitPaintTools++;
    continue;
  }
}

// Herbereken countsByCategory in de snapshot-header.
const tallyAfter = countByCategory(products);
data.countsByCategory = tallyAfter;

writeFileSync(FILE, JSON.stringify(data, null, 2) + "\n");

// ---- Rapport ----------------------------------------------------------------
function countByCategory(list) {
  const m = {};
  for (const p of list) m[p.category] = (m[p.category] || 0) + 1;
  return m;
}
function countSub(list, category) {
  const m = {};
  for (const p of list) if (p.category === category) m[p.subCategory] = (m[p.subCategory] || 0) + 1;
  return m;
}
function countSubSlug(list, slug) {
  return list.filter((p) => p.subCategory === slug).length;
}

console.log("recategorize-round2: snapshot gepatcht (%d producten)\n", products.length);
console.log("Verplaatst:");
console.log("  → behang        :", movedBehang);
console.log("  → reiniging     :", movedReiniging);
console.log("  → schuur/schilder split:", splitPaintTools);

console.log("\ncategory-counts (voor → na):");
const cats = new Set([...Object.keys(tallyBefore), ...Object.keys(tallyAfter)]);
for (const c of [...cats].sort()) {
  console.log(`  ${c.padEnd(18)} ${String(tallyBefore[c] || 0).padStart(4)} → ${String(tallyAfter[c] || 0).padStart(4)}`);
}

console.log("\nbehang subcategorieën   :", countSub(products, "behang"));
console.log("reiniging subcategorieën:", countSub(products, "reiniging"));
console.log("gereedschap split       :", {
  schuurmateriaal: countSubSlug(products, "schuurmateriaal"),
  schildersgereedschap: countSubSlug(products, "schildersgereedschap"),
});
console.log(
  "resterende oude slug 'schildersger-en-schuurpapier':",
  countSubSlug(products, "schildersger-en-schuurpapier"),
);
console.log(
  "resterende 'huishoudelijk' in gereedschap:",
  products.filter((p) => p.category === "gereedschap" && p.subCategory === "huishoudelijk").length,
);
