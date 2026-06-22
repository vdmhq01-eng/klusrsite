import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export const metadata: Metadata = {
  title: "Afrekenen",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  // Interne checkout (methodekeuze + ingebedde kaart + express-knoppen) op onze
  // eigen pagina. Staat nu standaard AAN zodat klanten op ONZE site de methode
  // kiezen en betalen i.p.v. op Mollie's hosted-checkout. Expliciet terug naar
  // Mollie hosted kan met NEXT_PUBLIC_CHECKOUT_EXPRESS=0 (of "false").
  const expressMode =
    process.env.NEXT_PUBLIC_CHECKOUT_EXPRESS !== "0" &&
    process.env.NEXT_PUBLIC_CHECKOUT_EXPRESS !== "false";
  // Mollie-profiel + testmodus voor de ingebedde kaart/wallets (alleen relevant
  // wanneer de interne checkout aanstaat).
  const mollieProfile = process.env.MOLLIE_PROFILE_ID || process.env.MOLLIE_PROFILE || undefined;
  const mollieTest = (process.env.MOLLIE_API_KEY || "").startsWith("test_");

  return (
    <CheckoutForm expressMode={expressMode} mollieProfile={mollieProfile} mollieTest={mollieTest} />
  );
}
