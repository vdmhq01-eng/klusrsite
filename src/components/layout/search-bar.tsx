"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { searchProducts } from "@/lib/data/products";
import { trackEvent } from "@/lib/tracking";
import { formatPrice, cn } from "@/lib/utils";

export function SearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = query.length >= 2 ? searchProducts(query).slice(0, 6) : [];

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    trackEvent("search", { search_term: query });
    router.push(`/zoeken?q=${encodeURIComponent(query)}`);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <form onSubmit={submit} className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Waar ben je naar op zoek?"
          className="h-11 w-full rounded-full border border-border bg-card pl-10 pr-10 text-sm outline-none ring-primary/20 transition focus:border-primary focus:ring-2"
          aria-label="Zoeken"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Wissen"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-lg border border-border bg-card shadow-card-hover">
          <ul className="max-h-[60vh] overflow-y-auto py-1">
            {results.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/product/${p.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-secondary"
                >
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-white">
                    <Image src={p.images[0]} alt={p.title} fill sizes="40px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{p.brand}</p>
                  </div>
                  <span className="text-sm font-bold text-primary">
                    {formatPrice(p.kluspasPrice)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <button
            onClick={submit}
            className="block w-full border-t border-border bg-secondary/50 px-3 py-2.5 text-center text-sm font-semibold text-primary hover:bg-secondary"
          >
            Alle resultaten voor &ldquo;{query}&rdquo;
          </button>
        </div>
      )}
    </div>
  );
}
