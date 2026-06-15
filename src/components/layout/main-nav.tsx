"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Tag } from "lucide-react";
import { navCategories } from "@/lib/data/categories";
import { cn } from "@/lib/utils";

export function MainNav() {
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  return (
    <nav className="hidden border-t border-border bg-card lg:block">
      <div className="container-klusr">
        <ul className="flex items-center gap-1">
          {navCategories.map((cat) => {
            const isActie = cat.slug === "acties";
            const hasSub = (cat.subCategories?.length ?? 0) > 0;
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
                  <div className="absolute left-0 top-full z-50 w-64 overflow-hidden rounded-b-lg border border-border bg-card shadow-card-hover">
                    <ul className="py-1">
                      {cat.subCategories!.map((sub) => (
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
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
