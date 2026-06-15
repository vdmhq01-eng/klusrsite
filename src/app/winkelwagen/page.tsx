import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";

export const metadata: Metadata = {
  title: "Winkelwagen",
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return <CartView />;
}
