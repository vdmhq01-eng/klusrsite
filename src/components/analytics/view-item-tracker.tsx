"use client";

import { useEffect, useRef } from "react";
import type { Product } from "@/types";
import { trackEvent, toAnalyticsItem } from "@/lib/tracking";
import { trackVisit } from "@/lib/visitor-id";

/** Fires a GA4 view_item event once when a product detail page renders. */
export function ViewItemTracker({ product }: { product: Product }) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    // Eigen server-analytics: bekeken product.
    trackVisit({ type: "view_item", productId: product.id, title: product.title });
    trackEvent("view_item", {
      value: product.kluspasPrice,
      items: [
        toAnalyticsItem({
          id: product.id,
          title: product.title,
          brand: product.brand,
          category: product.category,
          price: product.kluspasPrice,
        }),
      ],
    });
  }, [product]);
  return null;
}
