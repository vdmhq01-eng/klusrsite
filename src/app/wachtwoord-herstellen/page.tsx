import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, KeyRound } from "lucide-react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Nieuw wachtwoord instellen",
  description: "Stel een nieuw wachtwoord in voor je KLUSR-account.",
  robots: { index: false, follow: false },
};

export default function WachtwoordHerstellenPage() {
  return (
    <div className="container-klusr flex min-h-[60vh] items-center justify-center py-10">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-card">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <KeyRound className="h-5 w-5" />
        </span>
        <h1 className="mt-4 text-2xl font-black tracking-tight">Nieuw wachtwoord instellen</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Kies een nieuw wachtwoord voor je KLUSR-account. Daarna kun je direct inloggen.
        </p>

        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>

        <Link
          href="/inloggen"
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Terug naar inloggen
        </Link>
      </div>
    </div>
  );
}
