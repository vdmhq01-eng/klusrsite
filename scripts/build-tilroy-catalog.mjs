// @ts-nocheck
/**
 * Bouw de KLUSR-catalogus uit de directe Tilroy/De Voordeelmarkt feeds.
 * (Fallback-bron; primair loopt productdata via Channable — zie
 * build-channable-catalog.mjs.)
 *
 *   node scripts/build-tilroy-catalog.mjs
 *   TILROY_FEED_URL=… TILROY_STOCK_URL=… node scripts/build-tilroy-catalog.mjs
 */

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { buildCatalog, decodeEntities } from "./lib/catalog-map.mjs";
import { loadFeatures } from "./lib/feature-feed.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "src", "lib", "data", "feed-products.generated.json");

const FEED_URL =
  process.env.TILROY_FEED_URL ||
  "https://tilroy.s3.eu-west-1.amazonaws.com/780/feed/google_devoordeelmarkt_NL.xml";
const STOCK_URL =
  process.env.TILROY_STOCK_URL ||
  "https://tilroy.s3.eu-west-1.amazonaws.com/780/feed/google_stock_devoordeelmarkt.csv";

function tag(block, name) {
  const re = new RegExp(`<g:${name}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</g:${name}>`);
  const m = block.match(re);
  return m ? m[1].trim() : undefined;
}

function parseItems(xml) {
  const items = [];
  const re = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = re.exec(xml))) {
    const b = m[1];
    const id = tag(b, "id");
    if (!id) continue;
    items.push({
      id,
      title: tag(b, "title") ? decodeEntities(tag(b, "title")) : "",
      description: tag(b, "description") || "",
      link: tag(b, "link") || "",
      image: tag(b, "image_link") || "",
      additionalImage: tag(b, "additional_image_link") || "",
      availability: tag(b, "availability") || "out of stock",
      price: parseFloat((tag(b, "price") || "0").replace(",", ".")) || 0,
      productType: tag(b, "product_type") ? decodeEntities(tag(b, "product_type")) : "",
      brand: tag(b, "brand") ? decodeEntities(tag(b, "brand")) : "Onbekend",
      gtin: tag(b, "gtin") || "",
      color: tag(b, "color") ? decodeEntities(tag(b, "color")) : "",
      size: tag(b, "size") ? decodeEntities(tag(b, "size")) : "",
      groupId: tag(b, "item_group_id") || id,
    });
  }
  return items;
}

function parseStock(csv) {
  const lines = csv.trim().split(/\r?\n/);
  const header = lines[0].split(",");
  const storeCols = header.slice(2);
  const map = new Map();
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    map.set(cols[0], {
      total: parseInt(cols[1], 10) || 0,
      perStore: storeCols.map((_, idx) => parseInt(cols[2 + idx], 10) || 0),
    });
  }
  return map;
}

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch ${url} → ${res.status}`);
  return res.text();
}

async function main() {
  console.log("→ Tilroy feeds ophalen…");
  const [xml, csv] = await Promise.all([fetchText(FEED_URL), fetchText(STOCK_URL)]);
  const items = parseItems(xml);
  const stock = parseStock(csv);
  console.log(`  ${items.length} feed-items, ${stock.size} stock-rijen`);

  const featuresById = await loadFeatures();
  const snapshot = buildCatalog(items, stock, { source: FEED_URL, featuresById });
  writeFileSync(OUT, JSON.stringify(snapshot, null, 2));
  console.log(`✓ ${snapshot.count} producten → ${OUT}`);
  console.log("  per categorie:", snapshot.countsByCategory);
}

main().catch((err) => {
  console.error("✗ Catalogus-build mislukt:", err);
  process.exit(1);
});
