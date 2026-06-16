import { products, categories } from "@/lib/data";
import type { Product, ProductVariant } from "@/types";

/**
 * Google Merchant Center productfeed (RSS 2.0 met g:-namespace).
 *
 * Bereikbaar op /google-merchant.xml en statisch gegenereerd bij de build, dus
 * je kunt 'm direct als geplande ophaal-URL in Merchant Center zetten.
 *
 * Prijs = de KLUSRPAS-prijs (`kluspasPrice`) — bewust de ledenprijs, zoals we
 * naar Google Merchant willen communiceren. Eén item per koopbare variant,
 * variantgroepen via item_group_id.
 */

export const dynamic = "force-static";

const BASE = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.klus-r.nl").replace(/\/$/, "");

const JUNK_BRANDS = new Set(["", "onbekend", "merk", "overig", "overige"]);

// slug → titel, voor het product_type-pad (bv. "Verf > Binnenverf").
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
  // Verwijder control-tekens (\p{Cc}) en normaliseer witruimte — feeds mogen
  // geen stuurtekens bevatten; koppeltekens e.d. blijven bewust staan.
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

function buildItems(): string {
  const out: string[] = [];
  for (const p of products) {
    const image = p.images?.find((u) => /^https?:\/\//.test(u));
    if (!image) continue; // Google vereist een afbeelding.
    const brand = p.brand && !JUNK_BRANDS.has(p.brand.toLowerCase()) ? p.brand : "";
    const link = `${BASE}/product/${p.slug}`;
    const description = clean(p.description || p.title).slice(0, 4900);
    const pType = productType(p);
    const multi = p.variants.length > 1;

    for (const v of p.variants) {
      // KLUSRPAS-prijs naar Merchant; val terug op de reguliere prijs als die ontbreekt.
      const feedPrice = v.kluspasPrice > 0 ? v.kluspasPrice : v.price;
      if (!(feedPrice > 0)) continue;
      const id = multi ? `${p.id}-${v.id}` : p.id;
      const title = clean(multi ? `${p.title} ${v.label}` : p.title).slice(0, 150);
      const inStock = variantStock(v) > 0;

      const fields = [
        `<g:id>${xml(id)}</g:id>`,
        multi ? `<g:item_group_id>${xml(p.id)}</g:item_group_id>` : "",
        `<g:title>${xml(title)}</g:title>`,
        `<g:description>${xml(description)}</g:description>`,
        `<g:link>${xml(link)}</g:link>`,
        `<g:image_link>${xml(image)}</g:image_link>`,
        `<g:availability>${inStock ? "in_stock" : "out_of_stock"}</g:availability>`,
        `<g:price>${feedPrice.toFixed(2)} EUR</g:price>`,
        brand ? `<g:brand>${xml(brand)}</g:brand>` : "",
        `<g:condition>new</g:condition>`,
        `<g:identifier_exists>no</g:identifier_exists>`,
        pType ? `<g:product_type>${xml(pType)}</g:product_type>` : "",
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
