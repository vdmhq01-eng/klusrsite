"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/store/cart";
import { getProductById } from "@/lib/data/products";
import { Button } from "@/components/ui/button";
import { showAddedToCartToast } from "@/components/cart/added-to-cart-toast";

/**
 * "Alles in winkelwagen" voor een kluspakket: legt in één klik álle (echte)
 * catalogusproducten met hun aantallen in de winkelwagen en toont daarna één
 * samenvattende bevestiging. Hergebruikt de bestaande bevestigingskaart.
 */
export function AddAllToCart({
  items,
}: {
  items: { productId: string; quantity: number }[];
}) {
  const addItem = useCart((s) => s.addItem);

  function addAll() {
    let added = 0;
    for (const it of items) {
      const product = getProductById(it.productId);
      if (!product) continue; // gedropt — product bestaat niet (meer)
      addItem({ product, variant: product.variants[0], quantity: it.quantity });
      added += it.quantity;
    }
    if (added === 0) return;

    showAddedToCartToast({
      title: "Kluspakket toegevoegd",
      meta: `${added} ${added === 1 ? "artikel" : "artikelen"}`,
      labels: {
        added: "Toegevoegd aan winkelwagen",
        toCart: "Naar winkelwagen",
        continue: "Verder winkelen",
      },
    });
  }

  return (
    <Button size="lg" className="w-full sm:w-auto" onClick={addAll}>
      <ShoppingCart className="h-5 w-5" />
      Alles in winkelwagen
    </Button>
  );
}
