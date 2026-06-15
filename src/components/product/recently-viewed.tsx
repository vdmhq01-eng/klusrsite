"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/types";
import { ProductCarousel } from "@/components/shared/product-carousel";
import { SectionHeading } from "@/components/shared/section-heading";
import { useCart } from "@/lib/store/cart";

/**
 * Tracks the current product as "recently viewed" and shows previously viewed
 * products. Product data is fetched from /api/products so the catalogus is not
 * bundled into the client.
 */
export function RecentlyViewed({ currentId }: { currentId: string }) {
  const recentlyViewed = useCart((s) => s.recentlyViewed);
  const pushRecentlyViewed = useCart((s) => s.pushRecentlyViewed);
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    const previous = recentlyViewed.filter((id) => id !== currentId).slice(0, 8);
    pushRecentlyViewed(currentId);
    if (previous.length === 0) {
      setItems([]);
      return;
    }
    let active = true;
    fetch(`/api/products?ids=${previous.join(",")}`)
      .then((r) => r.json())
      .then((d) => active && setItems(d.products ?? []))
      .catch(() => {});
    return () => {
      active = false;
    };
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
