import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, LogIn } from "lucide-react";
import { getSession } from "@/auth";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Inloggen",
  description: "Log in bij KLUSR om je bestellingen, favorieten en KLUSRPAS te beheren.",
  robots: { index: false, follow: false },
};

export default async function InloggenPage() {
  const session = await getSession();
  if (session) redirect("/account");

  return (
    <div className="container-klusr flex min-h-[60vh] items-center justify-center py-10">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-card">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <LogIn className="h-5 w-5" />
        </span>
        <h1 className="mt-4 text-2xl font-black tracking-tight">Inloggen bij KLUSR</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Log in met je e-mailadres om je bestellingen, favorieten en je KLUSRPAS-voordeel te
          beheren.
        </p>

        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>

        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Terug naar home
        </Link>
      </div>
    </div>
  );
}
