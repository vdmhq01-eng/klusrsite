"use client";

import Link from "next/link";
import { Check, X, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { ProductImage } from "@/components/product/product-image";

/**
 * Bol.com-stijl bevestiging na "in winkelwagen": een nette kaart met een groene
 * bevestigingsbalk, de productregel en twee acties ("Naar winkelwagen" +
 * "Verder winkelen"). Bewust GEEN toast rechtsboven over het winkelwagen-icoon —
 * de Toaster staat op `top-center` (zie ui/sonner.tsx), zodat de winkelwagen
 * altijd klikbaar blijft.
 */
function AddedToCartToast({
  id,
  title,
  brand,
  image,
  meta,
  labels,
}: {
  id: string | number;
  title: string;
  brand?: string;
  image?: string;
  meta?: string;
  labels: { added: string; toCart: string; continue: string };
}) {
  const dismiss = () => toast.dismiss(id);

  return (
    <div className="pointer-events-auto w-[min(92vw,380px)] overflow-hidden rounded-xl border border-border bg-card shadow-card-hover">
      {/* Groene bevestigingsbalk + sluitkruisje */}
      <div className="flex items-center gap-2.5 bg-green-50 px-4 py-3">
        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-green-600 text-white">
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </span>
        <p className="text-sm font-bold leading-snug text-green-900">{labels.added}</p>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Sluiten"
          className="ml-auto grid h-6 w-6 shrink-0 place-items-center rounded-full text-green-800/70 transition-colors hover:bg-green-100 hover:text-green-900"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Productregel */}
      <div className="flex gap-3 px-4 py-3">
        {image && (
          <span className="relative block h-14 w-14 shrink-0 overflow-hidden rounded-md border border-border bg-white">
            <ProductImage src={image} alt={title} sizes="56px" className="object-cover" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          {brand && (
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              {brand}
            </p>
          )}
          <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">{title}</p>
          {meta && <p className="mt-0.5 truncate text-xs text-muted-foreground">{meta}</p>}
        </div>
      </div>

      {/* Acties */}
      <div className="flex gap-2 px-4 pb-4">
        <Link
          href="/winkelwagen"
          onClick={dismiss}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <ShoppingCart className="h-4 w-4" />
          {labels.toCart}
        </Link>
        <button
          type="button"
          onClick={dismiss}
          className="inline-flex flex-1 items-center justify-center rounded-md border border-input bg-card px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary/40"
        >
          {labels.continue}
        </button>
      </div>
    </div>
  );
}

/**
 * Toon de bevestigingskaart. Labels worden door de aanroeper (die `useT()` heeft)
 * meegegeven, zodat de kaart taalonafhankelijk werkt binnen het sonner-portal.
 */
export function showAddedToCartToast(opts: {
  title: string;
  brand?: string;
  image?: string;
  meta?: string;
  labels: { added: string; toCart: string; continue: string };
}) {
  toast.custom((id) => <AddedToCartToast id={id} {...opts} />, {
    unstyled: true,
    duration: 6000,
  });
}
