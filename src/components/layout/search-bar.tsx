"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, X, TrendingUp, CornerDownLeft } from "lucide-react";
import { searchProducts } from "@/lib/data/products";
import { categories } from "@/lib/data";
import { ProductImage } from "@/components/product/product-image";
import { trackEvent } from "@/lib/tracking";
import { formatPrice, cn } from "@/lib/utils";
import { useT } from "@/components/i18n/locale-provider";

const POPULAR_SEARCHES = [
  "muurverf",
  "sikkens",
  "grondverf",
  "kwast",
  "schroeven",
  "ral 9010",
  "tape",
  "lijm",
];

function catTitle(slug: string): string {
  return categories.find((c) => c.slug === slug)?.title ?? slug;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Markeer de zoektermen in een tekst. */
function Highlight({ text, query }: { text: string; query: string }) {
  const tokens = query
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 1)
    .map((t) => t.toLowerCase());
  if (!tokens.length) return <>{text}</>;
  const re = new RegExp(`(${tokens.map(escapeRegExp).join("|")})`, "ig");
  const parts = text.split(re);
  return (
    <>
      {parts.map((part, i) =>
        tokens.includes(part.toLowerCase()) ? (
          <mark key={i} className="rounded-sm bg-primary/15 px-0.5 text-primary">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

export function SearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const t = useT();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce zodat we niet op elke toetsaanslag over de hele catalogus scoren.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 110);
    return () => clearTimeout(t);
  }, [query]);

  const allResults = useMemo(
    () => (debounced.length >= 2 ? searchProducts(debounced, 48) : []),
    [debounced],
  );
  const results = allResults.slice(0, 7);

  // Categorie-suggesties afgeleid uit de treffers (max 3).
  const categoryChips = useMemo(() => {
    const seen = new Map<string, number>();
    for (const p of allResults) seen.set(p.category, (seen.get(p.category) ?? 0) + 1);
    return [...seen.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([slug]) => slug);
  }, [allResults]);

  // Sluit bij klik buiten + reset highlight bij nieuwe query.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);
  useEffect(() => setActiveIndex(-1), [debounced]);

  function go(to: string) {
    setOpen(false);
    router.push(to);
  }

  function submit(term?: string) {
    const q = (term ?? query).trim();
    if (!q) return;
    trackEvent("search", { search_term: q });
    go(`/zoeken?q=${encodeURIComponent(q)}`);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && results[activeIndex]) {
        go(`/product/${results[activeIndex].slug}`);
      } else {
        submit();
      }
    }
  }

  const showDropdown = open;
  const showResults = debounced.length >= 2;

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={t("search.placeholder")}
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls="search-results"
          aria-autocomplete="list"
          className="h-11 w-full rounded-full border border-border bg-card pl-10 pr-10 text-sm outline-none ring-primary/20 transition focus:border-primary focus:ring-2 [&::-webkit-search-cancel-button]:hidden"
          aria-label="Zoeken"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setOpen(true);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Wissen"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div
          id="search-results"
          className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-xl border border-border bg-card shadow-card-hover"
        >
          {/* Populaire zoekopdrachten (lege of korte query) */}
          {!showResults && (
            <div className="p-3">
              <p className="mb-2 flex items-center gap-1.5 px-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5" /> Populair
              </p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setQuery(term);
                      submit(term);
                    }}
                    className="rounded-full border border-border bg-secondary/50 px-3 py-1.5 text-xs font-semibold capitalize text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Resultaten */}
          {showResults && results.length > 0 && (
            <>
              {categoryChips.length > 0 && (
                <div className="flex flex-wrap gap-2 border-b border-border bg-secondary/30 px-3 py-2.5">
                  {categoryChips.map((slug) => (
                    <Link
                      key={slug}
                      href={`/categorie/${slug}`}
                      onClick={() => setOpen(false)}
                      className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                    >
                      {catTitle(slug)}
                    </Link>
                  ))}
                </div>
              )}
              <ul className="max-h-[56vh] overflow-y-auto py-1">
                {results.map((p, i) => (
                  <li key={p.id}>
                    <Link
                      href={`/product/${p.slug}`}
                      onClick={() => setOpen(false)}
                      onMouseEnter={() => setActiveIndex(i)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2",
                        activeIndex === i ? "bg-secondary" : "hover:bg-secondary/60",
                      )}
                    >
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md border border-border bg-white">
                        <ProductImage
                          src={p.images[0]}
                          alt={p.title}
                          showLabel={false}
                          sizes="44px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          <Highlight text={p.title} query={debounced} />
                        </p>
                        <p className="truncate text-xs text-muted-foreground">{p.brand}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="block text-sm font-bold text-primary">
                          {formatPrice(p.kluspasPrice)}
                        </span>
                        {p.price > p.kluspasPrice && (
                          <span className="block text-[11px] text-muted-foreground line-through">
                            {formatPrice(p.price)}
                          </span>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => submit()}
                className="flex w-full items-center justify-center gap-1.5 border-t border-border bg-secondary/50 px-3 py-2.5 text-sm font-semibold text-primary hover:bg-secondary"
              >
                Alle {allResults.length} resultaten voor &ldquo;{debounced}&rdquo;
                <CornerDownLeft className="h-3.5 w-3.5" />
              </button>
            </>
          )}

          {/* Geen resultaten */}
          {showResults && results.length === 0 && (
            <div className="p-4 text-center">
              <p className="text-sm font-semibold">Geen resultaten voor &ldquo;{debounced}&rdquo;</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Controleer de spelling of probeer een algemenere term.
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {POPULAR_SEARCHES.slice(0, 5).map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setQuery(term);
                      submit(term);
                    }}
                    className="rounded-full border border-border bg-secondary/50 px-3 py-1.5 text-xs font-semibold capitalize hover:border-primary/40 hover:text-primary"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
