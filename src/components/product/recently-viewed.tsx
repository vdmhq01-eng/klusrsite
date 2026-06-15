"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/types";
import { ProductCarousel } from "@/components/shared/product-carousel";
import { SectionHeading } from "@/components/shared/section-heading";
import { useCart } from "@/lib/store/cart";
import { getProductById } from "@/lib/data/products";

/**
 * Tracks the current product as "recently viewed" and shows previously viewed
 * products (excluding the current one). Reads from the persisted cart store.
 */
export function RecentlyViewed({ currentId }: { currentId: string }) {
  const recentlyViewed = useCart((s) => s.recentlyViewed);
  const pushRecentlyViewed = useCart((s) => s.pushRecentlyViewed);
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    // Snapshot the list before adding the current product.
    const previous = recentlyViewed
      .filter((id) => id !== currentId)
      .map(getProductById)
      .filter((p): p is Product => Boolean(p))
      .slice(0, 8);
    setItems(previous);
    pushRecentlyViewed(currentId);
    // Only run when the product changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentId]);

  if (items.length === 0) return null;

  return (
    <section>
      <SectionHeading title="Laatst bekeken" />
      <ProductCarousel products={items} listName="Laatst bekeken" />
    </section>
  );
}
