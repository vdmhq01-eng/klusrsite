"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Check, X, ShoppingCart } from "lucide-react";
import { ProductImage } from "@/components/product/product-image";
import { cn } from "@/lib/utils";

/**
 * Bol.com-stijl bevestiging na "in winkelwagen": een nette kaart met groene
 * bevestigingsbalk, de productregel en twee acties. Bewust GÉÉN sonner-toast:
 * die centreerde (als `unstyled` custom-toast) niet betrouwbaar. Dit is een eigen
 * fixed overlay die altijd boven-midden in beeld staat — net als bij bol.
 */
export interface AddedToCartPayload {
  title: string;
  brand?: string;
  image?: string;
  meta?: string;
  labels: { added: string; toCart: string; continue: string };
}

// Mini event-bus (module-niveau): vanuit een willekeurige plek tonen we de
// bevestiging; de één keer gemounte overlay (in GlobalOverlays) reageert erop.
type Listener = (p: AddedToCartPayload) => void;
let listener: Listener | null = null;

export function showAddedToCartToast(payload: AddedToCartPayload) {
  listener?.(payload);
}

export function AddedToCartOverlay() {
  const [payload, setPayload] = useState<AddedToCartPayload | null>(null);
  const [visible, setVisible] = useState(false);

  const close = useCallback(() => setVisible(false), []);

  useEffect(() => {
    listener = (p) => {
      setPayload(p);
      setVisible(true);
    };
    return () => {
      listener = null;
    };
  }, []);

  // Auto-sluiten na 6s; reset de timer bij elke nieuwe melding.
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setVisible(false), 6000);
    return () => clearTimeout(timer);
  }, [visible, payload]);

  if (!payload) return null;

  return (
    <div
      aria-live="polite"
      className={cn(
        // Vast boven-midden in de viewport, over de volle breedte gecentreerd.
        "pointer-events-none fixed inset-x-0 top-20 z-[120] flex justify-center px-3 transition-all duration-200 sm:top-24",
        visible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0",
      )}
    >
      <div className="pointer-events-auto w-[min(92vw,400px)] overflow-hidden rounded-xl border border-border bg-card shadow-card-hover">
        {/* Groene bevestigingsbalk + sluitkruisje */}
        <div className="flex items-center gap-2.5 bg-green-50 px-4 py-3">
          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-green-600 text-white">
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </span>
          <p className="text-sm font-bold leading-snug text-green-900">{payload.labels.added}</p>
          <button
            type="button"
            onClick={close}
            aria-label="Sluiten"
            className="ml-auto grid h-6 w-6 shrink-0 place-items-center rounded-full text-green-800/70 transition-colors hover:bg-green-100 hover:text-green-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Productregel */}
        <div className="flex gap-3 px-4 py-3">
          {payload.image && (
            <span className="relative block h-14 w-14 shrink-0 overflow-hidden rounded-md border border-border bg-white">
              <ProductImage src={payload.image} alt={payload.title} sizes="56px" className="object-cover" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            {payload.brand && (
              <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                {payload.brand}
              </p>
            )}
            <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
              {payload.title}
            </p>
            {payload.meta && (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{payload.meta}</p>
            )}
          </div>
        </div>

        {/* Acties */}
        <div className="flex gap-2 px-4 pb-4">
          <Link
            href="/winkelwagen"
            onClick={close}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <ShoppingCart className="h-4 w-4" />
            {payload.labels.toCart}
          </Link>
          <button
            type="button"
            onClick={close}
            className="inline-flex flex-1 items-center justify-center rounded-md border border-input bg-card px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary/40"
          >
            {payload.labels.continue}
          </button>
        </div>
      </div>
    </div>
  );
}
