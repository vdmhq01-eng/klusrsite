"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, Plus, Truck, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types";
import { useReorder, useReorderActive } from "@/lib/store/reorder";
import { useCart } from "@/lib/store/cart";
import { useUI } from "@/lib/store/ui";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useT } from "@/components/i18n/locale-provider";

/** "Iets vergeten?" — 15-min venster met aftelklok + bijbestel-suggesties. */
export function ReorderUpsell() {
  const start = useReorder((s) => s.start);
  const { active, secondsLeft } = useReorderActive();
  const addItem = useCart((s) => s.addItem);
  const setCartOpen = useUI((s) => s.setCartOpen);
  const t = useT();
  const [items, setItems] = useState<Product[]>([]);

  // Start het venster zodra de bedankpagina laadt.
  useEffect(() => {
    start();
  }, [start]);

  useEffect(() => {
    let a = true;
    fetch("/api/products?list=accessory&limit=4")
      .then((r) => r.json())
      .then((d) => a && setItems(d.products ?? []))
      .catch(() => {});
    return () => {
      a = false;
    };
  }, []);

  if (!active) return null;
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  function add(p: Product) {
    addItem({ product: p, variant: p.variants[0], quantity: 1 });
    toast.success(t("checkout.reorder.added"), { description: p.title });
    setCartOpen(true);
  }

  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-primary/30 bg-primary/5">
      <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="inline-flex items-center gap-1.5 text-sm font-bold text-primary">
            <Truck className="h-4 w-4" /> {t("checkout.reorder.title")}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("checkout.reorder.textPre")}
            <strong className="text-foreground">{t("checkout.reorder.textMinutes")}</strong>
            {t("checkout.reorder.textMid")}
            <strong className="text-foreground">{t("checkout.reorder.textBold")}</strong>
            {t("checkout.reorder.textPost")}
          </p>
        </div>
        <div className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full bg-primary px-4 py-2 font-mono text-lg font-black text-white">
          <Clock className="h-5 w-5" /> {mm}:{ss}
        </div>
      </div>

      {items.length > 0 && (
        <div className="grid grid-cols-2 gap-3 border-t border-primary/20 p-5 sm:grid-cols-4">
          {items.map((p) => (
            <div key={p.id} className="flex flex-col rounded-xl border border-border bg-card p-3">
              <Link
                href={`/product/${p.slug}`}
                className="relative mb-2 block aspect-square overflow-hidden rounded-lg bg-secondary/30"
              >
                {p.images[0] && (
                  <Image src={p.images[0]} alt={p.title} fill sizes="160px" className="object-contain p-2" />
                )}
              </Link>
              <p className="line-clamp-2 text-xs font-semibold leading-snug">{p.title}</p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="text-sm font-black">{formatPrice(p.kluspasPrice)}</span>
                <Button size="sm" variant="outline" onClick={() => add(p)} aria-label={t("checkout.reorder.addAria", { title: p.title })}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-3 border-t border-primary/20 p-5">
        <Button variant="outline" onClick={() => setCartOpen(true)}>
          <ShoppingCart className="h-4 w-4" /> {t("checkout.reorder.toCart")}
        </Button>
        <Button asChild variant="ghost">
          <Link href="/categorie/verf">{t("checkout.reorder.continueShopping")}</Link>
        </Button>
      </div>
    </div>
  );
}
