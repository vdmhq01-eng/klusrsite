// @ts-nocheck
/**
 * Gedeelde mapping: normaliseert feed-/Channable-items naar KLUSR Product[].
 * Gebruikt door build-tilroy-catalog.mjs én build-channable-catalog.mjs.
 *
 * Verwacht "items" in een genormaliseerde vorm:
 *   { id, title, description, link, image, additionalImage, availability,
 *     price (number), productType ('Home > X > Y'), brand, gtin, color, size, groupId }
 * en een stockMap: Map<id, { total:number, perStore:number[] }>.
 */

export const KLUSR_STORES = ["nijverdal", "emmen", "zutphen", "apeldoorn", "deventer"];

const PRO_BRANDS = new Set([
  "Sikkens", "Hammerite", "Histor", "Anza", "Fischer", "Alabastine", "Bosch",
  "Makita", "Sigma", "Wijzonol",
]);

export function decodeEntities(s = "") {
  return s
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ");
}

export function stripHtml(html = "") {
  return decodeEntities(
    html.replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " "),
  ).replace(/\s+/g, " ").trim();
}

export function slugify(input = "") {
  return input
    .toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60);
}

function seeded(seed) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

const round2 = (n) => Math.round(n * 100) / 100;

function stockByStore(perStore = []) {
  const get = (i) => perStore[i] ?? 0;
  const mapped = {
    nijverdal: get(0) + get(5),
    emmen: get(1),
    zutphen: get(2),
    apeldoorn: get(3),
    deventer: get(4),
  };
  return KLUSR_STORES.map((storeId) => ({ storeId, quantity: mapped[storeId] ?? 0 }));
}

function mapCategory(productType = "") {
  const segs = productType.split(">").map((s) => s.trim());
  const top = (segs[1] || segs[0] || "").toLowerCase();
  const full = productType.toLowerCase();
  if (top.includes("ijzerwaren")) return "ijzerwaren";
  if (top.startsWith("verf") && top.includes("benodigd")) return "gereedschap";
  if (top.startsWith("verf") || top.includes("beits")) return "verf";
  if (top.includes("gereedschap")) return "gereedschap";
  if (top.includes("verlichting")) return "verlichting";
  if (top.includes("elektra")) return "elektra";
  if (top.includes("vloer")) return "vloeren-raam";
  if (top.includes("tuin")) return "tuin";
  if (top.includes("behang") || top.includes("wandbekleding")) return "afbouw-fijnbouw";
  if (top.includes("lijm") || top.includes("kit")) return "afbouw-fijnbouw";
  if (top.includes("deuren") || top.includes("kozijn")) return "afbouw-fijnbouw";
  if (top.includes("bouwmaterial")) return "afbouw-fijnbouw";
  if (top.includes("toebehoren")) {
    if (full.includes("plamuur") || full.includes("kit") || full.includes("lijm"))
      return "afbouw-fijnbouw";
    return "gereedschap";
  }
  if (top.includes("auto") || top.includes("fiets") || top.includes("hobby")) return null;
  return "gereedschap";
}

function mapVerfSub(title, productType) {
  const segs = productType.split(">").map((x) => x.trim());
  const deep = segs.slice(2).join(" ");
  const s = `${title} ${deep}`.toLowerCase();
  if (s.includes("beits")) return "beits";
  if (s.includes("primer") || s.includes("grond")) return "primer";
  if (s.includes("lak") || s.includes("trapverf") || s.includes("aqua") || s.includes("pu "))
    return "lak";
  if (s.includes("buiten") || s.includes("gevel")) return "buitenverf";
  if (s.includes("muur") || s.includes("latex") || s.includes("binnen")) return "binnenverf";
  return "binnenverf";
}

function subCategoryFor(category, title, productType) {
  if (category === "verf") return mapVerfSub(title, productType);
  const segs = productType.split(">").map((s) => s.trim());
  const seg = segs[2] || segs[1];
  return seg ? slugify(seg) : undefined;
}

const cleanTitle = (t = "") => t.replace(/\s+/g, " ").trim();

/**
 * Productnaam zonder maat-/aantal-tokens (case-behoudend), voor gegroepeerde
 * producten. Losse model-/voltage-nummers (bv. "18V-55") blijven staan.
 */
function cleanProductTitle(title = "") {
  return cleanTitle(
    title
      .replace(/\b\d+([.,]\d+)?\s*[xX×]\s*\d+([.,]\d+)?(\/\d+)?\s*(mm|cm|m)?\b/gi, " ")
      .replace(/Ø\s*\d+([.,]\d+)?\s*(mm|cm)?/gi, " ")
      .replace(/\b\d+([.,]\d+)?\s*(ml|cl|l|liter|kg|gr|gram|mm|cm)\b/gi, " ")
      .replace(/\b\d+\s*-?\s*(delig|stuks?|stk?|pcs|pack)\b/gi, " "),
  );
}

function variantLabel(item) {
  if (item.size) return item.size.replace(/\s+/g, " ").trim();
  if (item.color) return item.color;
  return "Standaard";
}

function unitFor(label = "") {
  const l = label.toLowerCase();
  if (/\b(l|liter|ml)\b/.test(l)) return "L";
  if (/\b(kg|gram|g)\b/.test(l)) return "kg";
  if (/\b(m|meter|cm|mm)\b/.test(l)) return "m";
  return "st";
}

function buildHighlights(item, category) {
  const out = [];
  if (item.brand && item.brand !== "Onbekend") out.push(`Merk: ${item.brand}`);
  if (item.color) out.push(`Kleur: ${item.color}`);
  if (item.size) out.push(`Inhoud: ${item.size}`);
  if (category === "verf") out.push("Op kleur te laten mengen");
  out.push("Professionele kwaliteit");
  return [...new Set(out)].slice(0, 4);
}

function buildSpecs(item) {
  const items = [];
  if (item.brand) items.push({ label: "Merk", value: item.brand });
  if (item.color) items.push({ label: "Kleur", value: item.color });
  if (item.size) items.push({ label: "Inhoud / maat", value: item.size });
  if (item.gtin) items.push({ label: "EAN", value: item.gtin });
  items.push({ label: "Conditie", value: "Nieuw" });
  return [{ group: "Productgegevens", items }];
}

function synthReviews(seed, count, avg) {
  const samples = [
    { author: "Mark V.", body: "Goede kwaliteit en snel geleverd. Advies in de winkel was top.", rating: 5 },
    { author: "Sanne K.", body: "Precies wat ik nodig had voor mijn klus. Fijne service.", rating: 5 },
    { author: "Joost B.", body: "Prima product, doet wat het moet doen.", rating: 4 },
    { author: "Petra D.", body: "Tevreden! Goede prijs-kwaliteitverhouding.", rating: 4 },
  ];
  return Array.from({ length: Math.min(count, 4) }, (_, i) => ({
    id: `${seed}-r${i}`,
    author: samples[i % samples.length].author,
    rating: i === 0 ? Math.round(avg) : samples[i % samples.length].rating,
    body: samples[i % samples.length].body,
    date: new Date(2026, 4 - (i % 5), 20 - i * 4).toISOString(),
    verified: true,
  }));
}

/** Verwijder maat-/aantal-tokens uit een titel zodat formaten samenvallen. */
function stripSizeTokens(title = "") {
  return title
    .toLowerCase()
    .replace(/\b\d+([.,]\d+)?\s*[x×]\s*\d+([.,]\d+)?(\/\d+)?\s*(mm|cm|m)?\b/g, " ")
    .replace(/ø\s*\d+([.,]\d+)?\s*(mm|cm)?/g, " ")
    .replace(/\b\d+([.,]\d+)?\s*(ml|cl|l|liter|kg|gr|gram|g|mm|cm|m)\b/g, " ")
    .replace(/\b\d+\s*-?\s*(delig|stuks?|stk?|pcs|pack)\b/g, " ")
    .replace(/\b1?size\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Topsegment van product_type — houdt groeperen binnen één categorie. */
function topType(productType = "") {
  const segs = productType.split(">").map((s) => s.trim());
  return (segs[1] || segs[0] || "").toLowerCase();
}

/**
 * Groepssleutel om hetzelfde product in verschillende maten samen te voegen.
 * Merk + categorie + titel-zonder-maat. Verschillende typen (PZ1/PZ2/Torx/RVS)
 * houden een andere titel en blijven dus aparte producten.
 */
function groupKey(item) {
  const base = stripSizeTokens(item.title);
  if (!base) return `${item.brand}|${item.groupId || item.id}`;
  return `${(item.brand || "?").toLowerCase()}|${topType(item.productType)}|${base}`;
}

/** Sorteersleutel op eerste maat (Ø×lengte) zodat varianten oplopend staan. */
function sizeSortKey(item) {
  const m = (item.size || item.title || "").match(/(\d+([.,]\d+)?)\s*[x×]\s*(\d+([.,]\d+)?)/);
  if (m) return parseFloat(m[1].replace(",", ".")) * 1000 + parseFloat(m[3].replace(",", "."));
  const v = (item.size || "").match(/(\d+([.,]\d+)?)/);
  return v ? parseFloat(v[1].replace(",", ".")) : 0;
}

/** Maak een maatlabel leesbaar: "4,0 X 16 MM 200 ST" → "4,0 x 16 mm · 200 st". */
function cleanSizeLabel(label = "") {
  let s = label.replace(/\s+/g, " ").trim();
  if (/^1?size$/i.test(s) || !s) return "Standaard";
  s = s
    .replace(/\bMM\b/gi, "mm").replace(/\bCM\b/gi, "cm")
    .replace(/\bX\b/g, "x").replace(/\b(ST|STK)\b/gi, "st")
    .replace(/\b(GR|GRAM)\b/gi, "gr").replace(/\bML\b/gi, "ml");
  return s.replace(/(mm|cm|gr)\s+(\d)/g, "$1 · $2");
}

/**
 * Bouw de KLUSR-catalogus uit genormaliseerde items + stockMap.
 * @returns snapshot-object { generatedAt, source, count, countsByCategory, products }
 */
export function buildCatalog(items, stockMap, opts = {}) {
  const { source = "feed", maxPerCategory = 100000, maxTotal = 100000 } = opts;

  // Groepeer items die hetzelfde product in een ander formaat zijn (bv.
  // schroeven in tientallen maten) tot één product met maatvarianten.
  const groups = new Map();
  for (const item of items) {
    const key = groupKey(item);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }

  const products = [];
  for (const [groupId, group] of groups) {
    const lead =
      group.find((i) => i.availability === "in stock" && i.image) ||
      group.find((i) => i.image) ||
      group[0];
    if (!lead || !lead.image || !(lead.price > 0)) continue;

    const category = mapCategory(lead.productType);
    if (!category) continue;

    const title = cleanTitle(lead.title);
    if (!title) continue;

    const seenLabels = new Set();
    const variants = [];
    const sortedGroup = [...group].sort((a, b) => sizeSortKey(a) - sizeSortKey(b));
    for (const it of sortedGroup) {
      const label = cleanSizeLabel(variantLabel(it));
      if (seenLabels.has(label)) continue;
      seenLabels.add(label);
      const st = stockMap.get(it.id);
      const discount = 0.9 + seeded(it.id) * 0.08;
      const price = round2(it.price);
      variants.push({
        id: `tilroy-${it.id}`,
        label,
        unit: unitFor(label),
        price,
        kluspasPrice: round2(price * discount),
        stockByStore: stockByStore(st?.perStore),
      });
      if (variants.length >= 60) break;
    }
    if (variants.length === 0) continue;

    const base = variants.reduce((a, b) => (b.price < a.price ? b : a), variants[0]);
    const leadStock = stockMap.get(lead.id);
    const totalStock =
      leadStock?.total ?? variants[0].stockByStore.reduce((s, x) => s + x.quantity, 0);

    const rng = seeded(groupId);
    const rating = round2(4.1 + seeded(`${groupId}-r`) * 0.8);
    const reviewCount = 8 + Math.floor(seeded(`${groupId}-c`) * 240);

    const badges = [];
    const saving = base.price > 0 ? 1 - base.kluspasPrice / base.price : 0;
    if (PRO_BRANDS.has(lead.brand)) badges.push("PRO KEUZE");
    if (totalStock > 12 && rng > 0.55) badges.push("BESTSELLER");
    if (saving >= 0.07) badges.push("ACTIE");
    if (group.length > 1 && rng > 0.85) badges.push("NIEUW");

    const desc = stripHtml(lead.description).slice(0, 700);
    const hasDesc = desc.length > 120;
    const subCategory = subCategoryFor(category, title, lead.productType);
    const displayTitle = variants.length > 1 ? cleanProductTitle(lead.title) || title : title;

    products.push({
      id: `tilroy-${lead.id}`,
      title: displayTitle,
      slug: `${slugify(displayTitle)}-${lead.id}`,
      brand: lead.brand || "Onbekend",
      highlights: buildHighlights(lead, category),
      description:
        desc ||
        `${title} van ${lead.brand}. Professionele kwaliteit, verkrijgbaar bij KLUSR. Vraag in de winkel naar advies van onze ex-schilders.`,
      images: [lead.image, lead.additionalImage].filter(Boolean),
      price: round2(base.price),
      kluspasPrice: round2(base.kluspasPrice),
      category,
      subCategory,
      badges: badges.length ? [...new Set(badges)].slice(0, 3) : undefined,
      rating,
      reviewCount,
      reviews: synthReviews(groupId, 4, rating),
      specifications: buildSpecs(lead),
      variants,
      stockByStore: stockByStore(leadStock?.perStore),
      frequentlyBoughtTogether: [],
      colorMatchable: category === "verf",
      aiGeneratedContentStatus: hasDesc ? "complete" : "missing",
      contentFlags: {
        description: hasDesc ? "complete" : "missing",
        specifications: "complete",
        faqs: "missing",
        seo: hasDesc ? "suggested" : "missing",
      },
      _sortStock: totalStock,
    });
  }

  const byCat = new Map();
  for (const p of products) {
    if (!byCat.has(p.category)) byCat.set(p.category, []);
    byCat.get(p.category).push(p);
  }
  const selected = [];
  for (const [, list] of byCat) {
    list.sort((a, b) => b._sortStock - a._sortStock);
    selected.push(...list.slice(0, maxPerCategory));
  }
  selected.sort((a, b) => b._sortStock - a._sortStock);
  const final = selected.slice(0, maxTotal).map(({ _sortStock, ...p }) => p);

  const counts = {};
  for (const p of final) counts[p.category] = (counts[p.category] || 0) + 1;

  return {
    generatedAt: new Date().toISOString(),
    source,
    count: final.length,
    countsByCategory: counts,
    products: final,
  };
}
