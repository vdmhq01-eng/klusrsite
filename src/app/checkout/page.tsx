import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export const metadata: Metadata = {
  title: "Afrekenen",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  // Feature-flag: interne checkout (methodekeuze + ingebedde kaart + express-
  // knoppen) op onze eigen pagina. STAAT DIE UIT (leeg), dan rendert en gedraagt
  // de checkout zich EXACT zoals nu: één "Betalen"-knop → Mollie hosted-checkout.
  const expressMode =
    process.env.NEXT_PUBLIC_CHECKOUT_EXPRESS === "1" ||
    process.env.NEXT_PUBLIC_CHECKOUT_EXPRESS === "true";
  // Mollie-profiel + testmodus voor de ingebedde kaart/wallets (alleen relevant
  // wanneer de interne checkout aanstaat).
  const mollieProfile = process.env.MOLLIE_PROFILE_ID || process.env.MOLLIE_PROFILE || undefined;
  const mollieTest = (process.env.MOLLIE_API_KEY || "").startsWith("test_");

  return (
    <CheckoutForm expressMode={expressMode} mollieProfile={mollieProfile} mollieTest={mollieTest} />
  );
}
