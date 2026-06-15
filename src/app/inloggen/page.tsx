import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, LogIn } from "lucide-react";
import { getSession, signIn, authConfigured } from "@/auth";
import { Button } from "@/components/ui/button";

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
          Log in om je bestellingen, favorieten en je KLUSRPAS-voordeel te beheren.
        </p>

        {authConfigured ? (
          <div className="mt-6 flex flex-col gap-3">
            {process.env.AUTH_GOOGLE_ID && (
              <form
                action={async () => {
                  "use server";
                  await signIn("google", { redirectTo: "/account" });
                }}
              >
                <Button type="submit" size="lg" variant="outline" className="w-full">
                  Inloggen met Google
                </Button>
              </form>
            )}
            {process.env.AUTH_GITHUB_ID && (
              <form
                action={async () => {
                  "use server";
                  await signIn("github", { redirectTo: "/account" });
                }}
              >
                <Button type="submit" size="lg" variant="outline" className="w-full">
                  Inloggen met GitHub
                </Button>
              </form>
            )}
          </div>
        ) : (
          <div className="mt-6 rounded-lg border border-dashed border-border bg-secondary/40 p-4 text-sm">
            <p className="font-semibold text-foreground">Inloggen is nog niet geconfigureerd.</p>
            <p className="mt-1 text-muted-foreground">
              Zet in de omgeving <code className="font-mono text-xs">AUTH_SECRET</code> en de
              OAuth-gegevens (<code className="font-mono text-xs">AUTH_GOOGLE_ID</code> +{" "}
              <code className="font-mono text-xs">AUTH_GOOGLE_SECRET</code>) om echte
              authenticatie te activeren.
            </p>
          </div>
        )}

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
