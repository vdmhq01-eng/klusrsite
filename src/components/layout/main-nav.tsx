"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Tag } from "lucide-react";
import { navCategories } from "@/lib/data/categories";
import { getSubCategories } from "@/lib/data/products";
import { cn } from "@/lib/utils";

export function MainNav() {
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  return (
    <nav className="hidden border-t border-border bg-card lg:block">
      <div className="container-klusr">
        <ul className="flex items-center gap-1">
          {navCategories.map((cat) => {
            const isActie = cat.slug === "acties";
            const groups = cat.subGroups;
            const subs = getSubCategories(cat.slug);
            const hasSub = (groups?.length ?? 0) > 0 || subs.length > 0;
            return (
              <li
                key={cat.slug}
                className="relative"
                onMouseEnter={() => setOpenSlug(cat.slug)}
                onMouseLeave={() => setOpenSlug(null)}
              >
                <Link
                  href={`/categorie/${cat.slug}`}
                  className={cn(
                    "inline-flex items-center gap-1 px-3 py-3 text-sm font-semibold transition-colors hover:text-primary",
                    isActie && "text-primary",
                  )}
                >
                  {isActie && <Tag className="h-4 w-4" />}
                  {cat.title}
                  {hasSub && <ChevronDown className="h-3.5 w-3.5 opacity-60" />}
                </Link>

                {hasSub && openSlug === cat.slug && (
                  <>
                    {groups && groups.length > 0 ? (
                      // Gegroepeerd mega-menu (SEO-structuur), bv. Verf.
                      <div className="absolute left-0 top-full z-50 w-[44rem] overflow-hidden rounded-b-lg border border-border bg-card p-5 shadow-card-hover">
                        <div className="grid grid-cols-3 gap-x-6 gap-y-5">
                          {groups.map((group) => (
                            <div key={group.slug}>
                              <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                                {group.title}
                              </p>
                              <ul className="space-y-0.5">
                                {group.subCategories.map((sub) => (
                                  <li key={sub.slug}>
                                    <Link
                                      href={`/categorie/${cat.slug}/${sub.slug}`}
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
                          href={`/categorie/${cat.slug}`}
                          className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline"
                        >
                          Bekijk alle {cat.title.toLowerCase()} →
                        </Link>
                      </div>
                    ) : (
                      // Eenvoudige lijst voor categorieën zonder groepen.
                      <div className="absolute left-0 top-full z-50 w-64 overflow-hidden rounded-b-lg border border-border bg-card shadow-card-hover">
                        <ul className="py-1">
                          {subs.slice(0, 8).map((sub) => (
                            <li key={sub.slug}>
                              <Link
                                href={`/categorie/${cat.slug}/${sub.slug}`}
                                className="block px-4 py-2 text-sm text-foreground hover:bg-secondary hover:text-primary"
                              >
                                {sub.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
