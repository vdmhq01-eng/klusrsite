/**
 * Gepubliceerde AI-content per product (beschrijving, specs, FAQ, SEO).
 *
 * De admin AI-contentmanager schrijft hier goedgekeurde/gepubliceerde teksten
 * naartoe; de productpagina kan ze als override inlezen. KV-backed met in-memory
 * fallback (demo). Best-effort: gooit nooit.
 */

import { isKvEnabled, kvGetJSON, kvSetJSON } from "./kv";

export type ProductContentType = "description" | "specifications" | "faqs" | "seo";

export interface ProductContentOverride {
  productId: string;
  type: ProductContentType;
  content: string;
  updatedAt: string;
}

const key = (productId: string) => `product-content:${productId}`;
const mem = new Map<string, Record<string, ProductContentOverride>>();

export async function saveProductContent(
  productId: string,
  type: ProductContentType,
  content: string,
): Promise<void> {
  const entry: ProductContentOverride = {
    productId,
    type,
    content,
    updatedAt: new Date().toISOString(),
  };
  const current = (await getProductContent(productId)) ?? {};
  current[type] = entry;
  mem.set(productId, current);
  if (isKvEnabled()) await kvSetJSON(key(productId), current);
}

export async function getProductContent(
  productId: string,
): Promise<Record<string, ProductContentOverride> | undefined> {
  if (isKvEnabled()) {
    const kv = await kvGetJSON<Record<string, ProductContentOverride>>(key(productId));
    if (kv) return kv;
  }
  return mem.get(productId);
}
