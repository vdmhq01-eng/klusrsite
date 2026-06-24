"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/store/cart";
import { getProductById } from "@/lib/data/products";
import { Button } from "@/components/ui/button";
import { showAddedToCartToast } from "@/components/cart/added-to-cart-toast";

/**
 * Voegt één los product uit een kluspakket toe aan de winkelwagen (met het in
 * het pakket voorgestelde aantal), zodat de klant niet het hele pakket hoeft te
 * nemen. Tegenhanger van AddAllToCart; hergebruikt dezelfde bevestiging.
 */
export function AddLineToCart({
  productId,
  quantity = 1,
  title,
}: {
  productId: string;
  quantity?: number;
  title: string;
}) {
  const addItem = useCart((s) => s.addItem);

  function add() {
    const product = getProductById(productId);
    if (!product) return; // product bestaat niet (meer)
    addItem({ product, variant: product.variants[0], quantity });
    showAddedToCartToast({
      title,
      meta: `${quantity} ${quantity === 1 ? "artikel" : "artikelen"}`,
      labels: {
        added: "Toegevoegd aan winkelwagen",
        toCart: "Naar winkelwagen",
        continue: "Verder winkelen",
      },
    });
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={add}
      className="gap-1.5 whitespace-nowrap"
    >
      <ShoppingCart className="h-4 w-4" />
      Toevoegen
    </Button>
  );
}
