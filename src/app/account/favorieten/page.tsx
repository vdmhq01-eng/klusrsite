import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/auth";
import { FavoritesGrid } from "@/components/account/favorites-grid";

export const metadata: Metadata = {
  title: "Mijn favorieten",
  description:
    "Bekijk en beheer de producten die je bij KLUSR als favoriet hebt bewaard.",
  robots: { index: false, follow: false },
};

export default async function FavorietenPage() {
  const session = await getSession();
  if (!session) redirect("/inloggen");
  return (
    <div className="container-klusr py-8 sm:py-10">
      <div className="mb-6">
        <Link
          href="/account"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Terug naar account
        </Link>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
          Mijn favorieten
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Jouw bewaarde producten op één plek — klaar om in de winkelwagen te
          leggen wanneer jij dat wilt.
        </p>
      </div>

      <FavoritesGrid />
    </div>
  );
}
