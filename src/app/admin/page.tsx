import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, ShieldCheck, ShieldAlert, LogOut } from "lucide-react";
import { getSession, isAdminEmail, signOut } from "@/auth";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "KLUSR Beheer",
  description: "Beheer orders, klanten, rapportages, AI-content en koppelingen voor de KLUSR webshop.",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/inloggen?redirect=/admin");

  // Ingelogd, maar geen admin → geen toegang (geen klantdata tonen).
  if (!isAdminEmail(session.user?.email)) {
    return (
      <div className="container-klusr flex min-h-[60vh] flex-col items-center justify-center gap-4 py-16 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-secondary text-muted-foreground">
          <ShieldAlert className="h-7 w-7" />
        </span>
        <div>
          <h1 className="text-2xl font-black tracking-tight">Geen toegang</h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Je bent ingelogd als{" "}
            <span className="font-semibold text-foreground">{session.user?.email}</span>, maar dit
            account heeft geen beheerdersrechten. Vraag een beheerder om je e-mailadres toe te
            voegen aan <code className="rounded bg-secondary px-1">ADMIN_EMAILS</code>.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/">Terug naar de winkel</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="py-6 sm:py-8">
      <div className="container-klusr">
        {/* Header */}
        <div className="flex flex-col gap-3 border-b border-border pb-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-klusr-black text-white">
                <LayoutDashboard className="h-5 w-5" />
              </span>
              <div>
                <h1 className="text-2xl font-black tracking-tight sm:text-3xl">KLUSR Beheer</h1>
                <p className="text-sm text-muted-foreground">
                  Orders, klanten, rapportages, AI-content en koppelingen.
                </p>
              </div>
            </div>
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
          <div className="flex w-fit items-center gap-1.5 rounded-full bg-klusr-stock/10 px-3 py-1 text-xs font-semibold text-klusr-stock">
            <ShieldCheck className="h-3.5 w-3.5" />
            Beveiligd · ingelogd als {session.user?.email}
          </div>
        </div>

        <div className="mt-6">
          <AdminDashboard />
        </div>
      </div>
    </div>
  );
}
