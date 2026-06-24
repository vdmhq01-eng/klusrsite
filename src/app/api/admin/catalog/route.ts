import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/auth";
import { products, categories } from "@/lib/data";
import {
  getOverrides,
  mergeOverrides,
  clearOverride,
  listCustomProductRecords,
  upsertCustomProduct,
  deleteCustomProduct,
} from "@/lib/store/catalog-overrides";
import { buildCustomProduct, parseProductCsv, type CustomProductInput } from "@/lib/catalog-build";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ----------------------------------------------------------------- GET */

export async function GET(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();
  const brand = (url.searchParams.get("brand") ?? "").trim().toLowerCase();
  const category = (url.searchParams.get("category") ?? "").trim();
  const limit = Math.min(300, Math.max(20, Number(url.searchParams.get("limit")) || 120));

  const [overrides, customRecords] = await Promise.all([
    getOverrides(),
    listCustomProductRecords(),
  ]);
  const customIds = new Set(customRecords.map((r) => r.product.id));
  const pov = overrides.products ?? {};
  const vov = overrides.variants ?? {};

  const rows = [];
  for (const p of products) {
    if (customIds.has(p.id)) continue; // custom apart
    if (category && p.category !== category) continue;
    if (brand && p.brand.toLowerCase() !== brand) continue;
    if (q && !`${p.title} ${p.brand} ${p.gtin ?? ""}`.toLowerCase().includes(q)) continue;
    rows.push({
      productId: p.id,
      title: p.title,
      brand: p.brand,
      category: p.category,
      image: (p.images ?? [])[0],
      price: p.price,
      kluspasPrice: p.kluspasPrice,
      compareAtPrice: p.compareAtPrice,
      override: pov[p.id],
      variants: p.variants.map((v) => ({
        id: v.id,
        label: v.label,
        price: v.price,
        kluspasPrice: v.kluspasPrice,
        override: vov[v.id],
      })),
    });
    if (rows.length >= limit) break;
  }

  return NextResponse.json({
    rows,
    custom: customRecords.map((r) => ({
      productId: r.product.id,
      title: r.product.title,
      brand: r.product.brand,
      category: r.product.category,
      image: (r.product.images ?? [])[0],
      price: r.product.price,
      kluspasPrice: r.product.kluspasPrice,
      dropship: r.dropship ?? false,
      supplier: r.supplier,
    })),
    categories: categories.map((c) => ({ slug: c.slug, title: c.title })),
    counts: { catalog: products.length, custom: customRecords.length },
  });
}

/* ---------------------------------------------------------------- POST */

const overridePatch = z.object({
  price: z.number().nonnegative().optional(),
  kluspasPrice: z.number().nonnegative().optional(),
  compareAtPrice: z.number().nonnegative().optional(),
  active: z.boolean().optional(),
});

const customInput = z.object({
  id: z.string().optional(),
  title: z.string().min(1).max(200),
  brand: z.string().max(120).optional(),
  category: z.string().min(1).max(80),
  price: z.number().positive(),
  kluspasPrice: z.number().nonnegative().optional(),
  compareAtPrice: z.number().nonnegative().optional(),
  gtin: z.string().max(20).optional(),
  image: z.string().max(600).optional(),
  description: z.string().max(2000).optional(),
  stock: z.number().int().nonnegative().optional(),
  dropship: z.boolean().optional(),
  supplier: z.string().max(160).optional(),
});

const bodySchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("override"),
    products: z.record(z.string(), overridePatch).optional(),
    variants: z.record(z.string(), overridePatch).optional(),
  }),
  z.object({ action: z.literal("clearOverride"), kind: z.enum(["product", "variant"]), id: z.string() }),
  z.object({ action: z.literal("custom"), product: customInput }),
  z.object({ action: z.literal("deleteCustom"), id: z.string() }),
  z.object({ action: z.literal("import"), csv: z.string().min(2) }),
]);

export async function POST(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldige aanvraag" }, { status: 400 });
  }
  const data = parsed.data;

  if (data.action === "override") {
    await mergeOverrides({ products: data.products ?? {}, variants: data.variants ?? {} });
    return NextResponse.json({ ok: true });
  }

  if (data.action === "clearOverride") {
    await clearOverride(data.kind, data.id);
    return NextResponse.json({ ok: true });
  }

  if (data.action === "custom") {
    const { supplier, ...fields } = data.product;
    const product = buildCustomProduct(fields as CustomProductInput);
    await upsertCustomProduct({
      product,
      dropship: data.product.dropship ?? false,
      supplier: supplier?.trim() || undefined,
    });
    return NextResponse.json({ ok: true, productId: product.id });
  }

  if (data.action === "deleteCustom") {
    await deleteCustomProduct(data.id);
    return NextResponse.json({ ok: true });
  }

  // import
  const rows = parseProductCsv(data.csv);
  const valid = rows.filter((r) => !r._error);
  let imported = 0;
  for (const r of valid) {
    const product = buildCustomProduct(r);
    await upsertCustomProduct({ product, dropship: r.dropship ?? false });
    imported++;
  }
  return NextResponse.json({
    ok: true,
    imported,
    total: rows.length,
    errors: rows.filter((r) => r._error).map((r) => ({ row: r._row, error: r._error })),
  });
}
