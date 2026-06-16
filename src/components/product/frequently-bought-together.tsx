"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, ShoppingCart, Check } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useCart } from "@/lib/store/cart";
import { useUI } from "@/lib/store/ui";
import { trackEvent } from "@/lib/tracking";
import { formatPrice, cn } from "@/lib/utils";

/**
 * "Vaak samen gekocht" — the main product plus suggested companions, with a
 * one-click "add selected" bundle action.
 */
export function FrequentlyBoughtTogether({
  product,
  companions,
}: {
  product: Product;
  companions: Product[];
}) {
  const all = [product, ...companions];
  const [selected, setSelected] = useState<Record<string, boolean>>(
    Object.fromEntries(all.map((p) => [p.id, true])),
  );
  const addItem = useCart((s) => s.addItem);
  const openCart = useUI((s) => s.openCart);

  const chosen = all.filter((p) => selected[p.id]);
  const total = chosen.reduce((sum, p) => sum + p.kluspasPrice, 0);

  function addAll() {
    chosen.forEach((p) => addItem({ product: p, variant: p.variants[0], quantity: 1 }));
    trackEvent("add_to_cart", {
      value: total,
      item_list_name: "Vaak samen gekocht",
      items: chosen.map((p) => ({ item_id: p.id, item_name: p.title, price: p.kluspasPrice })),
    });
    toast.success(`${chosen.length} producten toegevoegd`, {
      description: "Vaak samen gekocht",
    });
    openCart();
  }

  if (companions.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <h3 className="mb-4 text-lg font-bold">Vaak samen gekocht</h3>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        {/* Visual row */}
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {all.map((p, i) => (
            <div key={p.id} className="flex items-center gap-2">
              <Link
                href={`/product/${p.slug}`}
                className="relative h-20 w-20 overflow-hidden rounded-lg border border-border bg-white"
              >
                <Image src={p.images[0]} alt={p.title} fill sizes="80px" className="object-cover" />
              </Link>
              {i < all.length - 1 && <Plus className="h-4 w-4 text-muted-foreground" />}
            </div>
          ))}
        </div>

        {/* Checklist + total */}
        <div className="lg:w-72">
          <ul className="space-y-1.5">
            {all.map((p, i) => (
              <li key={p.id} className="flex items-center gap-2">
                <Checkbox
                  id={`fbt-${p.id}`}
                  checked={selected[p.id]}
                  disabled={i === 0}
                  onCheckedChange={(v) =>
                    setSelected((s) => ({ ...s, [p.id]: Boolean(v) }))
                  }
                />
                <label htmlFor={`fbt-${p.id}`} className="flex-1 cursor-pointer text-xs">
                  <span className={cn(i === 0 && "font-semibold")}>{p.title}</span>
                  {i === 0 && <span className="ml-1 text-muted-foreground">(dit artikel)</span>}
                </label>
                <span className="text-xs font-bold text-primary">
                  {formatPrice(p.kluspasPrice)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Totaal ({chosen.length})</p>
              <p className="text-lg font-black text-primary">{formatPrice(total)}</p>
            </div>
            <Button onClick={addAll} disabled={chosen.length === 0}>
              <ShoppingCart className="h-4 w-4" />
              Voeg toe
            </Button>
          </div>
        </div>
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Check className="h-3.5 w-3.5 text-klusr-stock" strokeWidth={3} />
        Slim samengesteld — maak je klus in één keer compleet.
      </p>
    </div>
  );
}
