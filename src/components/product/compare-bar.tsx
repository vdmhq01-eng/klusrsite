"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Scale, ArrowRight } from "lucide-react";
import type { Product } from "@/types";
import { useCompare, MAX_COMPARE } from "@/lib/store/compare";
import { useMounted } from "@/lib/hooks/use-mounted";
import { Button } from "@/components/ui/button";

/** Zwevende balk onderaan zodra er producten in de vergelijking staan. */
export function CompareBar() {
  const ids = useCompare((s) => s.ids);
  const remove = useCompare((s) => s.remove);
  const clear = useCompare((s) => s.clear);
  const mounted = useMounted();
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    if (ids.length === 0) {
      setItems([]);
      return;
    }
    let active = true;
    fetch(`/api/products?ids=${ids.join(",")}`)
      .then((r) => r.json())
      .then((d) => active && setItems(d.products ?? []))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [ids]);

  if (!mounted || ids.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur">
      <div className="container-klusr flex items-center gap-3">
        <span className="hidden shrink-0 items-center gap-1.5 text-sm font-bold sm:inline-flex">
          <Scale className="h-4 w-4 text-primary" />
          Vergelijken
        </span>
        <div className="flex flex-1 items-center gap-2 overflow-x-auto">
          {items.map((p) => (
            <div key={p.id} className="relative h-12 w-12 shrink-0 overflow-hidden rounded border border-border bg-white">
              {p.images[0] && (
                <Image src={p.images[0]} alt={p.title} fill sizes="48px" className="object-contain p-1" />
              )}
              <button
                type="button"
                onClick={() => remove(p.id)}
                aria-label={`Verwijder ${p.title}`}
                className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-foreground text-background"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          ))}
          {Array.from({ length: Math.max(0, MAX_COMPARE - ids.length) }).map((_, i) => (
            <div
              key={`ph-${i}`}
              className="hidden h-12 w-12 shrink-0 rounded border border-dashed border-border sm:block"
              aria-hidden
            />
          ))}
        </div>
        <button
          type="button"
          onClick={clear}
          className="hidden shrink-0 text-xs text-muted-foreground hover:text-primary sm:block"
        >
          Wissen
        </button>
        {ids.length < 2 ? (
          <Button disabled className="shrink-0">
            Vergelijk ({ids.length})
          </Button>
        ) : (
          <Button asChild className="shrink-0">
            <Link href="/vergelijk">
              Vergelijk ({ids.length})
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
