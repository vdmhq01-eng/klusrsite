import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, LogOut } from "lucide-react";
import { getSession, signOut } from "@/auth";
import { AccountDashboard } from "@/components/account/account-dashboard";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Mijn account",
  description:
    "Beheer je KLUSR-account: bekijk je bestellingen, favorieten, gegevens en KLUSRPAS-voordeel op één plek.",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/inloggen");
  const firstName = session.user?.name?.split(" ")[0];

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
        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            {firstName ? `Welkom terug, ${firstName}` : "Mijn account"}
          </h1>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <Button type="submit" variant="outline" size="sm" className="gap-1.5">
              <LogOut className="h-4 w-4" />
              Uitloggen
            </Button>
          </form>
        </div>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Bekijk je bestellingen, beheer je favorieten en gegevens, en houd je
          KLUSRPAS-voordeel in de gaten.
        </p>
      </div>

      <AccountDashboard />
    </div>
  );
}
