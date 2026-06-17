"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, ShoppingCart, Scale, Star } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types";
import { useCompare } from "@/lib/store/compare";
import { useCart } from "@/lib/store/cart";
import { Price } from "@/components/product/price";
import { Button } from "@/components/ui/button";

function specMap(p: Product): Map<string, string> {
  const m = new Map<string, string>();
  for (const g of p.specifications ?? []) {
    for (const it of g.items) if (!m.has(it.label)) m.set(it.label, it.value);
  }
  return m;
}

export default function VergelijkPage() {
  const ids = useCompare((s) => s.ids);
  const remove = useCompare((s) => s.remove);
  const clear = useCompare((s) => s.clear);
  const addItem = useCart((s) => s.addItem);
  const [items, setItems] = useState<Product[] | null>(null);

  useEffect(() => {
    if (ids.length === 0) {
      setItems([]);
      return;
    }
    let active = true;
    fetch(`/api/products?ids=${ids.join(",")}`)
      .then((r) => r.json())
      .then((d) => active && setItems(d.products ?? []))
      .catch(() => active && setItems([]));
    return () => {
      active = false;
    };
  }, [ids]);

  const maps = (items ?? []).map(specMap);
  const specLabels: string[] = [];
  for (const m of maps) {
    for (const label of m.keys()) if (!specLabels.includes(label)) specLabels.push(label);
  }
  const shownLabels = specLabels.slice(0, 16);

  return (
    <div className="container-klusr py-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="inline-flex items-center gap-2 text-2xl font-black tracking-tight">
          <Scale className="h-6 w-6 text-primary" />
          Vergelijken
        </h1>
        {(items?.length ?? 0) > 0 && (
          <button
            type="button"
            onClick={clear}
            className="text-sm font-medium text-muted-foreground hover:text-primary"
          >
            Alles wissen
          </button>
        )}
      </div>

      {items === null ? (
        <p className="text-sm text-muted-foreground">Laden…</p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <Scale className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 font-semibold">Nog niets om te vergelijken</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Voeg producten toe met de vergelijk-knop op een product.
          </p>
          <Button asChild className="mt-4">
            <Link href="/categorie/verf">Bekijk verf</Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="w-32 align-bottom" />
                {items.map((p) => (
                  <th key={p.id} className="border-b border-border p-3 align-top">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => remove(p.id)}
                        aria-label="Verwijder uit vergelijking"
                        className="absolute right-0 top-0 grid h-6 w-6 place-items-center rounded-full bg-secondary text-muted-foreground hover:text-primary"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <Link href={`/product/${p.slug}`} className="block">
                        <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-lg bg-white">
                          {p.images[0] && (
                            <Image src={p.images[0]} alt={p.title} fill sizes="112px" className="object-contain p-2" />
                          )}
                        </div>
                        <p className="mt-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                          {p.brand}
                        </p>
                        <p className="line-clamp-2 text-sm font-bold leading-snug hover:text-primary">
                          {p.title}
                        </p>
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <Row label="Prijs">
                {items.map((p) => (
                  <td key={p.id} className="border-b border-border p-3 align-top">
                    <Price price={p.price} kluspasPrice={p.kluspasPrice} compareAtPrice={p.compareAtPrice} from={p.variants.length > 1} />
                  </td>
                ))}
              </Row>
              <Row label="Beoordeling">
                {items.map((p) => (
                  <td key={p.id} className="border-b border-border p-3 align-top">
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      {p.rating?.toFixed(1) ?? "—"}{" "}
                      <span className="text-xs text-muted-foreground">({p.reviewCount ?? 0})</span>
                    </span>
                  </td>
                ))}
              </Row>
              <Row label="Maat / inhoud">
                {items.map((p) => (
                  <td key={p.id} className="border-b border-border p-3 align-top text-muted-foreground">
                    {p.variants.map((v) => v.label).join(", ")}
                  </td>
                ))}
              </Row>
              <Row label="Op kleur mengbaar">
                {items.map((p) => (
                  <td key={p.id} className="border-b border-border p-3 align-top">
                    {p.colorMatchable ? (
                      <span className="font-semibold text-klusr-stock">Ja</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                ))}
              </Row>
              {shownLabels.map((label) => (
                <Row key={label} label={label}>
                  {items.map((p, i) => (
                    <td key={p.id} className="border-b border-border p-3 align-top text-muted-foreground">
                      {maps[i].get(label) ?? "—"}
                    </td>
                  ))}
                </Row>
              ))}
              <tr>
                <td />
                {items.map((p) => (
                  <td key={p.id} className="p-3 align-top">
                    <Button
                      className="w-full"
                      onClick={() => {
                        addItem({ product: p, variant: p.variants[0], quantity: 1 });
                        toast.success("Toegevoegd aan winkelwagen", { description: p.title });
                      }}
                    >
                      <ShoppingCart className="h-4 w-4" /> In winkelwagen
                    </Button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr>
      <th className="border-b border-border p-3 text-left align-top text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </th>
      {children}
    </tr>
  );
}
