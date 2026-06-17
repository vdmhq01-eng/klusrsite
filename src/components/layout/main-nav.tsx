"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Tag, Palette, ArrowRight } from "lucide-react";
import { navCategories } from "@/lib/data/categories";
import { getSubCategories } from "@/lib/data/products";
import { cn } from "@/lib/utils";

export function MainNav() {
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  const active = navCategories.find((c) => c.slug === openSlug);
  const activeGroups = active?.subGroups ?? null;
  const activeSubs = active ? getSubCategories(active.slug) : [];
  const activeHasSub = (activeGroups?.length ?? 0) > 0 || activeSubs.length > 0;

  return (
    <nav
      className="relative hidden border-t border-border bg-card lg:block"
      onMouseLeave={() => setOpenSlug(null)}
    >
      <div className="container-klusr">
        <ul className="flex items-center gap-1">
          {navCategories.map((cat) => {
            const isActie = cat.slug === "acties";
            const hasSub =
              (cat.subGroups?.length ?? 0) > 0 || getSubCategories(cat.slug).length > 0;
            return (
              <li key={cat.slug} onMouseEnter={() => setOpenSlug(cat.slug)}>
                <Link
                  href={`/categorie/${cat.slug}`}
                  className={cn(
                    "inline-flex items-center gap-1 px-3 py-3 text-sm font-semibold transition-colors hover:text-primary",
                    isActie && "text-primary",
                    openSlug === cat.slug && "text-primary",
                  )}
                >
                  {isActie && <Tag className="h-4 w-4" />}
                  {cat.title}
                  {hasSub && <ChevronDown className="h-3.5 w-3.5 opacity-60" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Full-width mega-menu over de hele breedte */}
      {active && activeHasSub && (
        <div
          className="absolute inset-x-0 top-full z-50 border-t border-border bg-card shadow-card-hover"
          onMouseEnter={() => setOpenSlug(active.slug)}
        >
          <div className="container-klusr py-6">
            {/* Kleurenkiezer-funnel uitgelicht in het verf-menu */}
            {active.slug === "verf" && (
              <Link
                href="/kleurenkiezer"
                className="group mb-5 flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 transition-colors hover:bg-primary/10"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary text-white">
                  <Palette className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-foreground">
                    Kleurenkiezer — kies eerst je kleur, dan je verf
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    In 3 stappen naar verf die wij exact op jouw kleur mengen
                  </span>
                </span>
                <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
              </Link>
            )}
            {activeGroups && activeGroups.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3 lg:grid-cols-[repeat(auto-fit,minmax(15rem,1fr))]">
                  {activeGroups.map((group) => (
                    <div key={group.slug}>
                      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                        {group.title}
                      </p>
                      <ul className="space-y-1">
                        {group.subCategories.map((sub) => (
                          <li key={sub.slug}>
                            <Link
                              href={`/categorie/${active.slug}/${sub.slug}`}
                              className="block rounded px-1.5 py-1 text-sm text-foreground hover:bg-secondary hover:text-primary"
                            >
                              {sub.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <Link
                  href={`/categorie/${active.slug}`}
                  className="mt-5 inline-flex text-sm font-semibold text-primary hover:underline"
                >
                  Bekijk alle {active.title.toLowerCase()} →
                </Link>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-x-8 gap-y-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {activeSubs.slice(0, 15).map((sub) => (
                    <Link
                      key={sub.slug}
                      href={`/categorie/${active.slug}/${sub.slug}`}
                      className="block rounded px-1.5 py-1.5 text-sm text-foreground hover:bg-secondary hover:text-primary"
                    >
                      {sub.title}
                    </Link>
                  ))}
                </div>
                <Link
                  href={`/categorie/${active.slug}`}
                  className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline"
                >
                  Bekijk alle {active.title.toLowerCase()} →
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
