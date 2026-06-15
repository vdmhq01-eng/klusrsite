import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, PackageSearch } from "lucide-react";
import { OrderTracker } from "@/components/account/order-tracker";

export const metadata: Metadata = {
  title: "Bestelstatus volgen",
  description:
    "Volg je KLUSR-bestelling. Vul je bestelnummer en e-mailadres in om de status en verwachte bezorgdatum te bekijken.",
  // The lookup page shows order-specific data; keep it out of the index.
  robots: { index: false, follow: false },
};

interface BestelstatusPageProps {
  searchParams: { ref?: string | string[] };
}

export default function BestelstatusPage({ searchParams }: BestelstatusPageProps) {
  const rawRef = searchParams.ref;
  const initialReference = Array.isArray(rawRef) ? rawRef[0] : rawRef;

  return (
    <div className="container-klusr max-w-3xl py-8 sm:py-10">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Terug naar home
        </Link>
        <div className="mt-3 flex items-start gap-3">
          <span className="hidden h-12 w-12 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary sm:grid">
            <PackageSearch className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              Bestelstatus volgen
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Vul je bestelnummer en e-mailadres in om de status van je
              bestelling en de verwachte bezorgdatum te bekijken.
            </p>
          </div>
        </div>
      </div>

      <OrderTracker initialReference={initialReference} />
    </div>
  );
}
