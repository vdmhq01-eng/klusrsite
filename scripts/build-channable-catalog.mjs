// @ts-nocheck
/**
 * Bouw de KLUSR-catalogus uit CHANNABLE (primaire bron voor productdata + stock).
 * Channable haalt de data uit Tilroy; wij lezen de project-items via de API.
 *
 * Vereist env:
 *   CHANNABLE_TOKEN        — API Bearer token
 *   CHANNABLE_COMPANY_ID   — company id
 *   CHANNABLE_PROJECT_ID   — project id (of gebruik CHANNABLE_ITEMS_URL)
 * Optioneel:
 *   CHANNABLE_API_BASE     — default https://api.channable.com/v1
 *   CHANNABLE_ITEMS_URL    — volledige override voor het items-endpoint
 *
 *   node scripts/build-channable-catalog.mjs
 *
 * NB: api.channable.com moet in de network-allowlist staan om dit te draaien.
 * Lukt het ophalen niet, draai dan build-tilroy-catalog.mjs als fallback.
 */

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { buildCatalog } from "./lib/catalog-map.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "src", "lib", "data", "feed-products.generated.json");

const BASE = process.env.CHANNABLE_API_BASE || "https://api.channable.com/v1";
const TOKEN = process.env.CHANNABLE_TOKEN;
const COMPANY_ID = process.env.CHANNABLE_COMPANY_ID;
const PROJECT_ID = process.env.CHANNABLE_PROJECT_ID;

function itemsUrl(offset, limit) {
  if (process.env.CHANNABLE_ITEMS_URL) {
    const u = new URL(process.env.CHANNABLE_ITEMS_URL);
    u.searchParams.set("offset", String(offset));
    u.searchParams.set("limit", String(limit));
    return u.toString();
  }
  return `${BASE}/companies/${COMPANY_ID}/projects/${PROJECT_ID}/items?offset=${offset}&limit=${limit}`;
}

const num = (v) =>
  typeof v === "number" ? v : v != null ? parseFloat(String(v).replace(",", ".")) : 0;

/** Zet een ruw Channable-item om naar de genormaliseerde vorm voor buildCatalog. */
function normalize(raw) {
  const f = raw.data ?? raw;
  const stock = num(f.stock ?? f.quantity ?? f.availability_quantity);
  return {
    item: {
      id: String(f.id ?? f.gtin ?? f.ean ?? ""),
      title: String(f.title ?? f.name ?? ""),
      description: String(f.description ?? ""),
      link: String(f.link ?? ""),
      // De channableusercontent-afbeelding (`image`) eerst: laadt vanaf elke
      // origin. Dan pas image_link (S3) / cloudimg als terugval.
      image: String(f.image ?? f.image_link ?? f.image_link2 ?? ""),
      additionalImage: String(f.additional_image_link ?? f.image_link2 ?? f.image_link ?? ""),
      availability:
        String(f.availability ?? (stock > 0 ? "in stock" : "out of stock")).includes("out")
          ? "out of stock"
          : "in stock",
      price: num(f.price),
      productType: String(f.product_type ?? f.category ?? ""),
      brand: String(f.brand ?? "Onbekend"),
      gtin: String(f.gtin ?? f.ean ?? ""),
      color: String(f.color ?? ""),
      size: String(f.size ?? ""),
      groupId: String(f.item_group_id ?? f.id ?? ""),
    },
    // Voorraad per vestiging indien aanwezig, anders totaal op de flagship.
    stock: {
      total: stock,
      perStore: Array.isArray(f.stock_by_location)
        ? f.stock_by_location.map((x) => num(x))
        : [stock],
    },
  };
}

async function fetchAll() {
  const items = [];
  const stockMap = new Map();
  const pageSize = 1000;
  let offset = 0;

  for (;;) {
    const res = await fetch(itemsUrl(offset, pageSize), {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: "application/json",
      },
    });
    if (!res.ok) throw new Error(`Channable items → ${res.status}: ${await res.text()}`);
    const body = await res.json();
    const rows = Array.isArray(body) ? body : body.items ?? body.data ?? body.results ?? [];
    if (!rows.length) break;
    for (const raw of rows) {
      const { item, stock } = normalize(raw);
      if (!item.id) continue;
      items.push(item);
      stockMap.set(item.id, stock);
    }
    if (rows.length < pageSize) break;
    offset += pageSize;
  }
  return { items, stockMap };
}

async function main() {
  if (!TOKEN || !COMPANY_ID || (!PROJECT_ID && !process.env.CHANNABLE_ITEMS_URL)) {
    console.error(
      "✗ Channable niet geconfigureerd. Zet CHANNABLE_TOKEN, CHANNABLE_COMPANY_ID en CHANNABLE_PROJECT_ID (of CHANNABLE_ITEMS_URL).",
    );
    process.exit(1);
  }
  console.log("→ Channable items ophalen…");
  const { items, stockMap } = await fetchAll();
  console.log(`  ${items.length} items uit Channable`);

  const snapshot = buildCatalog(items, stockMap, { source: "channable" });
  writeFileSync(OUT, JSON.stringify(snapshot, null, 2));
  console.log(`✓ ${snapshot.count} producten → ${OUT}`);
  console.log("  per categorie:", snapshot.countsByCategory);
}

main().catch((err) => {
  console.error("✗ Channable-catalogus-build mislukt:", err);
  process.exit(1);
});
