"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/store/cart";

/**
 * Leegt de winkelwagen zodra de klant op de bedankpagina belandt. Werkt los van
 * de order-lookup (die op serverless soms de order niet vindt), zodat de mand
 * altijd leeg is ná het afrekenen.
 */
export function ClearCart() {
  const clear = useCart((s) => s.clear);
  useEffect(() => {
    clear();
  }, [clear]);
  return null;
}
