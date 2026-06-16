"use client";

import { useEffect, useRef } from "react";
import type { Product } from "@/types";
import { trackEvent, toAnalyticsItem } from "@/lib/tracking";

/**
 * Fires a GA4 view_item_list event once when a product list renders.
 * Renders nothing.
 */
export function ViewItemListTracker({
  products,
  listName,
}: {
  products: Product[];
  listName: string;
}) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current || products.length === 0) return;
    fired.current = true;
    trackEvent("view_item_list", {
      item_list_name: listName,
      items: products.slice(0, 12).map((p) =>
        toAnalyticsItem({
          id: p.id,
          title: p.title,
          brand: p.brand,
          category: p.category,
          price: p.kluspasPrice,
        }),
      ),
    });
  }, [products, listName]);

  return null;
}
