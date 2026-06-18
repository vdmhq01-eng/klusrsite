import { products, categories } from "@/lib/data";
import type { Product, ProductVariant } from "@/types";

/**
 * Google Merchant Center productfeed (RSS 2.0 met g:-namespace).
 *
 * Bereikbaar op /google-merchant.xml en statisch gegenereerd bij de build, dus
 * je kunt 'm direct als geplande ophaal-URL in Merchant Center zetten.
 *
 * Geoptimaliseerd: google_product_category, gtin/identifier_exists, verzending,
 * product_highlight, extra afbeeldingen, maat en (bij adviesprijs) sale_price.
 */

export const dynamic = "force-static";

const BASE = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.klus-r.nl").replace(/\/$/, "");

const JUNK_BRANDS = new Set(["", "onbekend", "merk", "overig", "overige"]);

// Verzendkosten (gespiegeld vanuit de winkelwagen): gratis vanaf €50, anders €4,95.
const shippingFor = (subtotal: number): number =>
  subtotal <= 0 || subtotal >= 50 ? 0 : 4.95;

// Categorie → officiële Google-producttaxonomie (verbetert matching/zichtbaarheid).
const GOOGLE_CATEGORY: Record<string, string> = {
  verf: "Hardware > Paint & Wall Covering > Paint",
  "afbouw-fijnbouw": "Hardware > Building Materials",
  ijzerwaren: "Hardware > Fasteners",
  elektra: "Hardware > Power & Electrical Supplies",
  gereedschap: "Hardware > Tools",
  tuin: "Home & Garden > Lawn & Garden",
  verlichting: "Home & Garden > Lighting",
  "vloeren-raam": "Hardware > Building Materials > Flooring & Carpet",
};

// slug → titel, voor het product_type-pad (bv. "Verf > Binnenlak").
const catTitle = new Map<string, string>();
const subTitle = new Map<string, string>();
for (const c of categories) {
  catTitle.set(c.slug, c.title);
  for (const s of c.subCategories ?? []) subTitle.set(`${c.slug}/${s.slug}`, s.title);
}

function xml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function clean(s: string): string {
  return s
    .replace(/\p{Cc}+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function variantStock(v: ProductVariant): number {
  return v.stockByStore.reduce((sum, x) => sum + x.quantity, 0);
}

function productType(p: Product): string {
  const parts: string[] = [];
  const ct = catTitle.get(p.category);
  if (ct) parts.push(ct);
  if (p.subCategory) parts.push(subTitle.get(`${p.category}/${p.subCategory}`) ?? p.subCategory);
  return parts.join(" > ");
}

/** Waarde van een specificatie (bv. "Glansgraad", "Kleur"). */
function specVal(p: Product, label: string): string {
  for (const g of p.specifications ?? []) {
    for (const it of g.items ?? []) {
      if ((it.label ?? "").trim().toLowerCase() === label.toLowerCase()) return (it.value ?? "").trim();
    }
  }
  return "";
}

/** EAN/GTIN uit het product of (terugval) uit de specificaties. */
function gtinFor(p: Product): string {
  if (p.gtin && /^\d{8,14}$/.test(p.gtin)) return p.gtin;
  for (const g of p.specifications ?? []) {
    for (const it of g.items ?? []) {
      const v = (it.value ?? "").trim();
      if (/^(ean|gtin|barcode)$/i.test(it.label) && /^\d{8,14}$/.test(v)) return v;
    }
  }
  return "";
}

function buildItems(): string {
  const out: string[] = [];
  for (const p of products) {
    const images = (p.images ?? []).filter((u) => /^https?:\/\//.test(u));
    const image = images[0];
    if (!image) continue; // Google vereist een afbeelding.
    const brand = p.brand && !JUNK_BRANDS.has(p.brand.toLowerCase()) ? p.brand : "";
    const link = `${BASE}/product/${p.slug}`;
    const description = clean(p.description || p.title).slice(0, 4900);
    const pType = productType(p);
    const googleCat = GOOGLE_CATEGORY[p.category];
    const gtin = gtinFor(p);
    const glans = specVal(p, "Glansgraad");
    const colorAttr = specVal(p, "Kleur");
    const multi = p.variants.length > 1;

    const extraImages = images
      .slice(1, 11)
      .map((u) => `<g:additional_image_link>${xml(u)}</g:additional_image_link>`)
      .join("");
    const highlights = (p.highlights ?? [])
      .slice(0, 6)
      .map((h) => `<g:product_highlight>${xml(clean(h).slice(0, 150))}</g:product_highlight>`)
      .join("");

    for (const v of p.variants) {
      // De feed-prijs = de NORMALE prijs (wat iedereen zonder KLUSRPAS betaalt).
      // De 5% KLUSRPAS-korting is een INGELOGD voordeel en hoort dus niet in de
      // feed: Google moet de prijs zien die een niet-ingelogde bezoeker betaalt.
      // Terugval op de KLUSRPAS-prijs alleen als de normale prijs ontbreekt. Dit
      // is exact wat de productpagina in haar structured data zet, zodat Google
      // geen "niet-overeenkomende productprijs" meldt. Géén adviesprijs als
      // g:price: die staat niet op de pagina en veroorzaakt juist de mismatch.
      const feedPrice = v.price > 0 ? v.price : v.kluspasPrice;
      if (!(feedPrice > 0)) continue;
      const id = multi ? `${p.id}-${v.id}` : p.id;
      // Verrijkte titel: merk vooraan + glans/kleur/maat als die er nog niet in
      // staan (beter voor Shopping). Zonder dubbeling.
      const has = (s: string) => p.title.toLowerCase().includes(s.toLowerCase());
      const title = clean(
        [
          brand && !has(brand) ? brand : "",
          p.title,
          glans && !has(glans) ? glans : "",
          colorAttr && colorAttr.length <= 24 && !/mengen|gewenste/i.test(colorAttr) && !has(colorAttr)
            ? colorAttr
            : "",
          multi && v.label && v.label !== "Standaard" ? v.label : "",
        ]
          .filter(Boolean)
          .join(" "),
      ).slice(0, 150);
      const inStock = variantStock(v) > 0;
      const shipCost = shippingFor(feedPrice);

      const fields = [
        `<g:id>${xml(id)}</g:id>`,
        multi ? `<g:item_group_id>${xml(p.id)}</g:item_group_id>` : "",
        `<g:title>${xml(title)}</g:title>`,
        `<g:description>${xml(description)}</g:description>`,
        `<g:link>${xml(link)}</g:link>`,
        `<g:image_link>${xml(image)}</g:image_link>`,
        extraImages,
        `<g:availability>${inStock ? "in_stock" : "out_of_stock"}</g:availability>`,
        `<g:price>${feedPrice.toFixed(2)} EUR</g:price>`,
        brand ? `<g:brand>${xml(brand)}</g:brand>` : "",
        gtin ? `<g:gtin>${xml(gtin)}</g:gtin>` : "",
        // identifier_exists alleen "no" als er écht geen merk/GTIN is.
        !gtin && !brand ? `<g:identifier_exists>no</g:identifier_exists>` : "",
        `<g:condition>new</g:condition>`,
        googleCat ? `<g:google_product_category>${xml(googleCat)}</g:google_product_category>` : "",
        pType ? `<g:product_type>${xml(pType)}</g:product_type>` : "",
        multi && v.label && v.label !== "Standaard" ? `<g:size>${xml(v.label)}</g:size>` : "",
        highlights,
        `<g:shipping><g:country>NL</g:country><g:service>Standaard</g:service><g:price>${shipCost.toFixed(2)} EUR</g:price></g:shipping>`,
      ];
      out.push(`<item>${fields.filter(Boolean).join("")}</item>`);
    }
  }
  return out.join("\n");
}

export async function GET() {
  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n` +
    `<channel>\n` +
    `<title>KLUSR productfeed</title>\n` +
    `<link>${xml(BASE)}</link>\n` +
    `<description>KLUSR — verf, ijzerwaren, gereedschap en meer. Google Merchant Center feed.</description>\n` +
    buildItems() +
    `\n</channel>\n</rss>\n`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
