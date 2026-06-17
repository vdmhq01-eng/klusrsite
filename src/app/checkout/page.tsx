import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export const metadata: Metadata = {
  title: "Afrekenen",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  // Mollie Components (ingebedde creditcard) als het profiel is geconfigureerd.
  const mollieProfile = process.env.MOLLIE_PROFILE;
  const mollieTest = (process.env.MOLLIE_API_KEY || "").startsWith("test_");
  return <CheckoutForm mollieProfile={mollieProfile} mollieTest={mollieTest} />;
}
