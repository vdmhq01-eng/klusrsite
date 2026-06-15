import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AccountDashboard } from "@/components/account/account-dashboard";

export const metadata: Metadata = {
  title: "Mijn account",
  description:
    "Beheer je KLUSR-account: bekijk je bestellingen, favorieten, gegevens en KLUSRPAS-voordeel op één plek.",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <div className="container-klusr py-8 sm:py-10">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Terug naar home
        </Link>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
          Mijn account
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Welkom in je persoonlijke omgeving. Bekijk je bestellingen, beheer je
          favorieten en gegevens, en houd je KLUSRPAS-voordeel in de gaten.
        </p>
      </div>

      <AccountDashboard />
    </div>
  );
}
