"use client";

import { useEffect, useRef } from "react";
import type { Order } from "@/types";
import { trackEvent } from "@/lib/tracking";

/**
 * Fires the GA4 `purchase` event once after a successful order. Rendered on the
 * thank-you page. (Het legen van de winkelwagen doet <ClearCart/>.)
 */
export function PurchaseTracker({ order }: { order: Order }) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    trackEvent("purchase", {
      transaction_id: order.reference,
      value: order.total,
      shipping: order.shipping,
      currency: "EUR",
      items: order.items.map((i) => ({
        item_id: i.productId,
        item_name: i.title,
        item_brand: i.brand,
        item_variant: i.variantLabel,
        price: i.kluspasPrice,
        quantity: i.quantity,
      })),
    });
  }, [order]);

  return null;
}
