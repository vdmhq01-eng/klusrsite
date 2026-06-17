/**
 * Bouwt de prijs-overlay (adviesprijs + normale prijs per sku) voor de catalogus.
 *
 * Bron (in volgorde):
 *   1. process.env.PRIJSFEED_URL  → live feed (CSV: sku,ean,normale_prijs,advies_prijs)
 *   2. scripts/data/prijsfeed.csv → gecommitte snapshot (fallback / offline build)
 *
 * Uitvoer: src/lib/data/price-overrides.generated.json
 *   { "<sku>": { "n": <normale_prijs>, "a": <advies_prijs> }, ... }
 *
 * De adviesprijs (a) wordt op de productpagina/kaarten als doorgestreepte
 * "van"-prijs getoond zodra die hoger is dan de verkoopprijs.
 *
 *   node scripts/build-price-feed.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SNAPSHOT = join(ROOT, "scripts", "data", "prijsfeed.csv");
const OUT = join(ROOT, "src", "lib", "data", "price-overrides.generated.json");

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const iSku = header.indexOf("sku");
  const iNor = header.indexOf("normale_prijs");
  const iAdv = header.indexOf("advies_prijs");
  if (iSku < 0 || iNor < 0 || iAdv < 0) {
    throw new Error(`Onverwachte koppen: ${header.join(", ")}`);
  }
  const out = {};
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    const sku = (cols[iSku] || "").trim();
    if (!sku) continue;
    const n = Number(cols[iNor]);
    const a = Number(cols[iAdv]);
    const entry = {};
    if (Number.isFinite(n)) entry.n = n;
    if (Number.isFinite(a)) entry.a = a;
    if (entry.n != null || entry.a != null) out[sku] = entry;
  }
  return out;
}

async function loadCsv() {
  const url = process.env.PRIJSFEED_URL;
  if (url) {
    try {
      const res = await fetch(url, { headers: { accept: "text/csv,*/*" } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      console.log(`Prijsfeed opgehaald van ${url}`);
      return await res.text();
    } catch (err) {
      console.warn(`Live feed faalde (${err.message}); val terug op snapshot.`);
    }
  }
  console.log(`Prijsfeed uit snapshot: ${SNAPSHOT}`);
  return readFileSync(SNAPSHOT, "utf8");
}

const map = parseCsv(await loadCsv());
const count = Object.keys(map).length;
writeFileSync(OUT, JSON.stringify(map) + "\n", "utf8");
console.log(`OK — ${count} sku's geschreven naar ${OUT}`);
