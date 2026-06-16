"use client";

import { useMemo, useState } from "react";
import type { Article } from "@/types";
import { ArticleCard } from "@/components/content/article-card";
import { cn } from "@/lib/utils";

interface ArticleFilterProps {
  articles: Article[];
}

/**
 * Client-side category filter for the advies hub.
 * Derives the unique categories from the provided articles and lets the
 * visitor narrow the grid without a full page navigation.
 */
export function ArticleFilter({ articles }: ArticleFilterProps) {
  const categories = useMemo(() => {
    const unique = Array.from(new Set(articles.map((a) => a.category)));
    return ["Alles", ...unique];
  }, [articles]);

  const [active, setActive] = useState("Alles");

  const filtered = useMemo(
    () =>
      active === "Alles"
        ? articles
        : articles.filter((a) => a.category === active),
    [articles, active],
  );

  return (
    <div>
      <div className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        {categories.map((category) => {
          const isActive = category === active;
          return (
            <button
              key={category}
              type="button"
              onClick={() => setActive(category)}
              aria-pressed={isActive}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-primary/40 hover:text-primary",
              )}
            >
              {category}
            </button>
          );
        })}
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
          Geen artikelen in deze categorie.
        </p>
      )}
    </div>
  );
}
