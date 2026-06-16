// @ts-nocheck
/**
 * Bouw de KLUSR-catalogus uit de CHANNABLE Google-feed (XML).
 *
 * Bron: een publieke Channable-feed-URL (geen token nodig). Bevat de
 * channableusercontent-afbeeldingen (`image`), die vanaf elke origin laden —
 * i.t.t. de prosteps-cloudimg-URL's (die geven 403 buiten devoordeelmarkt.nl).
 *
 *   CHANNABLE_FEED_URL=… node scripts/build-channable-feed.mjs
 *
 * Veilig: schrijft de snapshot alléén bij een gezonde catalogus; bij een fout,
 * lege of ongezonde feed faalt het script (exit 1) en behoudt feed-prebuild.mjs
 * de bestaande, gecommitte snapshot. Een feed-sync mag de deploy nooit breken.
 */

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { buildCatalog, decodeEntities } from "./lib/catalog-map.mjs";
import { loadFeatures } from "./lib/feature-feed.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "src", "lib", "data", "feed-products.generated.json");

const FEED_URL =
  process.env.CHANNABLE_FEED_URL ||
  "https://files.channable.com/HP2huOrCAjSZiJgfMpDdVg==.xml";

/** Pak <name> of <g:name>, met of zonder CDATA, hoofdletterongevoelig. */
function tag(block, name) {
  const re = new RegExp(
    `<(?:g:)?${name}(?:\\s[^>]*)?>\\s*(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?\\s*</(?:g:)?${name}>`,
    "i",
  );
  const m = block.match(re);
  return m ? decodeEntities(m[1].trim()) : "";
}

function num(v) {
  if (!v) return 0;
  return parseFloat(String(v).replace(/[^0-9.,]/g, "").replace(/\.(?=\d{3}\b)/g, "").replace(",", ".")) || 0;
}

/** Vind de item-wrapper (<item>, <product> of <entry>) en geef de blokken terug. */
function splitItems(xml) {
  for (const name of ["item", "product", "entry"]) {
    const re = new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)</${name}>`, "gi");
    const blocks = [];
    let m;
    while ((m = re.exec(xml))) blocks.push(m[1]);
    if (blocks.length > 5) return blocks;
  }
  return [];
}

function normalize(b) {
  const id = tag(b, "id") || tag(b, "gtin") || tag(b, "ean") || tag(b, "sku");
  const availability = (tag(b, "availability") || "").toLowerCase();
  const qty = num(
    tag(b, "quantity") || tag(b, "stock") || tag(b, "availability_quantity") || tag(b, "inventory"),
  );
  const inStock = qty > 0 || /in[\s_-]?stock|op\s*voorraad|true|^ja$|beschikbaar/.test(availability);
  return {
    id,
    title: tag(b, "title") || tag(b, "name"),
    description: tag(b, "description") || tag(b, "omschrijving"),
    link: tag(b, "link") || tag(b, "url"),
    // channableusercontent (`image`) eerst — laadt vanaf elke origin.
    image:
      tag(b, "image") || tag(b, "image_link") || tag(b, "image_link2") ||
      tag(b, "additional_image_link"),
    additionalImage:
      tag(b, "image_link2") || tag(b, "additional_image_link") || tag(b, "image_link"),
    availability: inStock ? "in stock" : "out of stock",
    price: num(tag(b, "price") || tag(b, "sale_price")),
    productType:
      tag(b, "product_type") || tag(b, "google_product_category") ||
      tag(b, "categorie") || tag(b, "category"),
    brand: tag(b, "brand") || tag(b, "merk") || "Onbekend",
    gtin: tag(b, "gtin") || tag(b, "ean"),
    color: tag(b, "color") || tag(b, "kleur"),
    size: tag(b, "size") || tag(b, "inhoud") || tag(b, "inhoudverf") || tag(b, "maat"),
    groupId: tag(b, "item_group_id") || tag(b, "id_2") || id,
    _qty: qty,
    _inStock: inStock,
  };
}

function seeded(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

/**
 * Synthetische per-winkel voorraad uit availability/quantity. In-stock items
 * krijgen een positieve voorraad (anders zou de "uitverkocht verbergen"-filter
 * de hele catalogus leegmaken); uitverkocht → 0.
 */
function buildStock(items) {
  const map = new Map();
  for (const it of items) {
    if (!it.id) continue;
    let total = it._qty;
    if (!total && it._inStock) total = 2 + Math.floor(seeded(it.id) * 14); // 2..15
    total = Math.max(0, Math.round(total));
    const r = seeded(`${it.id}-s`);
    const nij = total > 0 ? Math.max(1, Math.round(total * (0.5 + r * 0.4))) : 0;
    const rest = Math.max(0, total - nij);
    const perStore = [
      nij,
      Math.round(rest * 0.3),
      Math.round(rest * 0.25),
      Math.round(rest * 0.25),
      Math.round(rest * 0.2),
    ];
    map.set(it.id, { total, perStore });
  }
  return map;
}

async function fetchText(url) {
  const res = await fetch(url, { headers: { "User-Agent": "KLUSR-catalog-build" } });
  if (!res.ok) throw new Error(`Feed ${url} → ${res.status}`);
  return res.text();
}

async function main() {
  console.log(`→ Channable-feed ophalen: ${FEED_URL}`);
  const xml = await fetchText(FEED_URL);
  const blocks = splitItems(xml);
  console.log(`  ${blocks.length} ruwe feed-items`);

  const items = blocks
    .map(normalize)
    .filter((i) => i.id && i.title && i.price > 0 && i.image);
  const stock = buildStock(items);

  const featuresById = await loadFeatures();
  const snapshot = buildCatalog(items, stock, { source: "channable-feed", featuresById });

  const withImg = snapshot.products.filter((p) => p.images?.length).length;
  const withStock = snapshot.products.filter(
    (p) => p.stockByStore.reduce((s, x) => s + x.quantity, 0) > 0,
  ).length;
  console.log(
    `  → ${snapshot.count} producten, ${withImg} met afbeelding, ${withStock} op voorraad`,
  );

  // Rommelige titels (basis-/maatcodes, dubbele tokens) — als er te veel zijn,
  // heeft de mapper de feed niet goed kunnen opschonen; dan de (schone) snapshot
  // behouden i.p.v. live zetten.
  const dirty = snapshot.products.filter(
    (p) =>
      /\b(basis|base|zn|ln|sb)\b/i.test(p.title) ||
      /\d{2,4}\s+\d{2,4}/.test(p.title) ||
      /\b([a-z]{3,})\s+\1\b/i.test(p.title),
  ).length;
  console.log(`  → ${dirty} rommelige titels`);

  // Gezondheidscheck: alleen overschrijven als de catalogus er goed uitziet.
  if (
    snapshot.count < 500 ||
    withImg < snapshot.count * 0.8 ||
    withStock < 200 ||
    dirty > snapshot.count * 0.05
  ) {
    throw new Error(
      `Catalogus ongezond (count=${snapshot.count}, img=${withImg}, voorraad=${withStock}, rommelig=${dirty}) — snapshot behouden`,
    );
  }

  writeFileSync(OUT, JSON.stringify(snapshot, null, 2));
  console.log(`✓ ${snapshot.count} producten → ${OUT}`);
  console.log("  per categorie:", snapshot.countsByCategory);
}

main().catch((err) => {
  console.error("✗ Channable-feed-build:", err.message);
  process.exit(1);
});
