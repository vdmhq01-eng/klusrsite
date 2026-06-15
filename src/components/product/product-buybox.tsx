"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ShoppingCart,
  Heart,
  Truck,
  RotateCcw,
  Sparkles,
  CreditCard,
  Palette,
} from "lucide-react";
import { toast } from "sonner";
import type { Product, ProductVariant, SelectedColor } from "@/types";
import type { GlansVariant } from "@/lib/data/products";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { StarRating } from "./star-rating";
import { StockStatus } from "./stock-status";
import { QuantityStepper } from "@/components/cart/quantity-stepper";
import { ColorPickerDialog } from "@/components/color/color-picker-dialog";
import { useCart } from "@/lib/store/cart";
import { useFavorites } from "@/lib/store/favorites";
import { useUI } from "@/lib/store/ui";
import { useMounted } from "@/lib/hooks/use-mounted";
import { baseStockByStore, paintBases } from "@/lib/paint-bases";
import { isLightColor } from "@/lib/data/colors";
import { trackEvent, toAnalyticsItem } from "@/lib/tracking";
import { formatPrice, discountPercent, cn } from "@/lib/utils";

const usps = [
  { icon: Truck, label: "Gratis verzending vanaf €50" },
  { icon: RotateCcw, label: "Gratis retouren in de winkel" },
  { icon: Sparkles, label: "Advies van ex-schilders" },
  { icon: CreditCard, label: "Achteraf betalen mogelijk" },
];

export function ProductBuybox({
  product,
  glansVariants = [],
}: {
  product: Product;
  glansVariants?: GlansVariant[];
}) {
  const [variant, setVariant] = useState<ProductVariant>(product.variants[0]);
  const [color, setColor] = useState<SelectedColor | undefined>();
  const [quantity, setQuantity] = useState(1);

  const addItem = useCart((s) => s.addItem);
  const saveForLater = useCart((s) => s.saveForLater);
  const openCart = useUI((s) => s.openCart);
  const toggleFavorite = useFavorites((s) => s.toggle);
  const favoriteIds = useFavorites((s) => s.ids);
  const mounted = useMounted();
  const isFavorite = mounted && favoriteIds.includes(product.id);

  // Tinting base (from the chosen colour) adds a surcharge and has its own stock.
  const surcharge = color?.base?.surcharge ?? 0;
  const effectiveKLUSRPAS = variant.kluspasPrice + surcharge;
  const effectivePrice = variant.price + surcharge;
  const effectiveStock =
    color?.base && product.colorMatchable
      ? baseStockByStore(variant.stockByStore, color.base.id)
      : variant.stockByStore;

  const reference = (variant.compareAtPrice ?? variant.price) + surcharge;
  const showStrike = reference > effectiveKLUSRPAS;

  // "Voordeliger per liter" upsell — compare cheapest €/L variant.
  const perLiter = useMemo(() => {
    if (!variant.size) return null;
    return variant.kluspasPrice / variant.size;
  }, [variant]);

  const bestPerLiter = useMemo(() => {
    const sized = product.variants.filter((v) => v.size);
    if (sized.length < 2) return null;
    return Math.min(...sized.map((v) => v.kluspasPrice / (v.size ?? 1)));
  }, [product.variants]);

  function buildItem() {
    return addItem({ product, variant, quantity, color });
  }

  function handleAdd() {
    if (product.colorMatchable && !color) {
      toast("Kies eerst een kleur", {
        description: "Selecteer een kleur voordat je deze verf toevoegt.",
      });
      return;
    }
    buildItem();
    trackEvent("add_to_cart", {
      value: variant.kluspasPrice * quantity,
      items: [
        {
          ...toAnalyticsItem({
            id: product.id,
            title: product.title,
            brand: product.brand,
            category: product.category,
            price: variant.kluspasPrice,
            quantity,
          }),
          item_variant: variant.label,
        },
      ],
    });
    toast.success("Toegevoegd aan winkelwagen", {
      description: `${product.title} · ${variant.label}${color ? ` · ${color.name}` : ""}`,
    });
    openCart();
  }

  function handleSaveForLater() {
    const item = buildItem();
    saveForLater(item.key);
    trackEvent("save_for_later", { item_id: product.id });
    toast("Bewaard voor later", { description: product.title });
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
          {product.brand}
        </p>
        <h1 className="mt-1 text-2xl font-extrabold leading-tight sm:text-3xl">
          {product.title}
        </h1>
        <div className="mt-2 flex items-center gap-3">
          <StarRating rating={product.rating} size="md" showCount={false} />
          <a href="#reviews" className="text-sm font-medium text-muted-foreground hover:text-primary">
            {product.rating.toFixed(1)} · {product.reviewCount} reviews
          </a>
        </div>
      </div>

      {/* Highlights */}
      <ul className="grid gap-1.5">
        {product.highlights.map((h) => (
          <li key={h} className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 shrink-0 text-klusr-stock" strokeWidth={3} />
            {h}
          </li>
        ))}
      </ul>

      <Separator />

      {/* Price */}
      <div>
        {showStrike && (
          <p className="text-sm text-muted-foreground">
            Adviesprijs <span className="line-through">{formatPrice(reference)}</span>
          </p>
        )}
        <div className="flex items-end gap-3">
          <span className="text-4xl font-black leading-none text-primary">
            {formatPrice(effectiveKLUSRPAS)}
          </span>
          <span className="mb-1 rounded bg-primary/10 px-2 py-0.5 text-xs font-bold uppercase text-primary">
            KLUSRPAS-prijs
          </span>
        </div>
        {showStrike && (
          <p className="mt-1 text-sm font-semibold text-klusr-stock">
            Je bespaart {formatPrice(reference - effectiveKLUSRPAS)} (
            {discountPercent(reference, effectiveKLUSRPAS)}%)
          </p>
        )}
        {surcharge > 0 && (
          <p className="mt-1 text-xs text-muted-foreground">
            Incl. {color?.base?.label.toLowerCase()} (+{formatPrice(surcharge)} voor
            donkere kleur)
          </p>
        )}
        {perLiter && (
          <p className="mt-1 text-xs text-muted-foreground">
            {formatPrice(perLiter)} per liter
            {bestPerLiter && perLiter > bestPerLiter + 0.01 && (
              <span className="ml-1 font-medium text-primary">
                · grotere bus is voordeliger per liter
              </span>
            )}
          </p>
        )}
      </div>

      {/* Stock + delivery (base-specific when a colour is chosen) */}
      <StockStatus
        stockByStore={effectiveStock}
        showScarcity
        showDelivery
        className="text-sm"
      />
      {color?.base && (
        <p className="-mt-2 text-xs text-muted-foreground">
          Voorraad getoond voor <strong>{color.base.label}</strong> — elke basis
          heeft een eigen voorraad.
        </p>
      )}

      <Separator />

      {/* Variant selector — dropdown bij veel maten (bv. schroeven), anders knoppen */}
      {product.variants.length > 1 && (
        <div>
          <p className="mb-2 text-sm font-semibold">
            Maat / inhoud: <span className="text-muted-foreground">{variant.label}</span>
          </p>
          {product.variants.length > 8 ? (
            <select
              value={variant.id}
              onChange={(e) =>
                setVariant(
                  product.variants.find((v) => v.id === e.target.value) ?? product.variants[0],
                )
              }
              className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm font-semibold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {product.variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          ) : (
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVariant(v)}
                  className={cn(
                    "min-w-[64px] rounded-md border px-3 py-2 text-sm font-semibold transition-all",
                    v.id === variant.id
                      ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                      : "border-input bg-card hover:border-primary/40",
                  )}
                >
                  {v.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Glansgraad — andere glansvarianten van dezelfde verflijn */}
      {glansVariants.length > 1 && (
        <div>
          <p className="mb-2 text-sm font-semibold">Glansgraad</p>
          <div className="flex flex-wrap gap-2">
            {glansVariants.map((g) =>
              g.active ? (
                <span
                  key={g.id}
                  className="min-w-[64px] rounded-md border border-primary bg-primary/5 px-3 py-2 text-center text-sm font-semibold text-primary ring-1 ring-primary"
                >
                  {g.label}
                </span>
              ) : (
                <Link
                  key={g.id}
                  href={`/product/${g.slug}`}
                  className="min-w-[64px] rounded-md border border-input bg-card px-3 py-2 text-center text-sm font-semibold transition-all hover:border-primary/40"
                >
                  {g.label}
                </Link>
              ),
            )}
          </div>
        </div>
      )}

      {/* Mengverf — kleur kiezen + preview op de muur */}
      {product.colorMatchable && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Kleur</p>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-primary">
              <Palette className="h-3 w-3" />
              Mengverf
            </span>
          </div>

          <ColorPickerDialog
            value={color}
            onConfirm={setColor}
            trigger={
              <Button variant={color ? "outline" : "default"} className="w-full gap-2 sm:w-auto">
                <Palette className="h-4 w-4" />
                {color ? "Kleur wijzigen" : "Kies je kleur"}
              </Button>
            }
          />

          {color ? (
            <div className="overflow-hidden rounded-xl border border-border">
              {/* Kleur op de muur */}
              <div
                className="relative flex aspect-[5/2] items-end p-4"
                style={{ backgroundColor: color.hex }}
              >
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/10 to-transparent" />
                <span
                  className={cn(
                    "relative rounded-md px-2 py-1 text-xs font-bold backdrop-blur",
                    isLightColor(color.hex) ? "bg-black/5 text-black/80" : "bg-white/20 text-white",
                  )}
                >
                  {color.name}
                  {color.code ? ` · ${color.code}` : ""}
                </span>
              </div>
              <div className="flex items-start gap-2 bg-secondary/40 p-3 text-xs text-muted-foreground">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <span>
                  Wordt{" "}
                  <strong className="text-foreground">professioneel op kleur gemengd</strong>
                  {color.base ? ` in ${color.base.label.toLowerCase()}` : ""}. Exacte match,
                  klaar voor gebruik.
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Elke kleur mogelijk — wij mengen de verf exact op jouw gekozen tint. Kies een
              kleur om &apos;m op de muur te zien.
            </p>
          )}
        </div>
      )}

      {/* Quantity + CTAs */}
      <div className="flex flex-col gap-3">
        <div className="flex items-stretch gap-3">
          <QuantityStepper value={quantity} onChange={setQuantity} />
          <Button onClick={handleAdd} size="lg" className="flex-1">
            <ShoppingCart className="h-5 w-5" />
            In winkelwagen
          </Button>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handleSaveForLater}>
            <Heart className={cn("h-4 w-4", isFavorite && "fill-primary text-primary")} />
            Bewaar voor later
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Favoriet"
            onClick={() => {
              toggleFavorite(product.id);
              toast(isFavorite ? "Verwijderd uit favorieten" : "Toegevoegd aan favorieten");
            }}
          >
            <Heart className={cn("h-5 w-5", isFavorite && "fill-primary text-primary")} />
          </Button>
        </div>
      </div>

      {/* USPs */}
      <ul className="grid grid-cols-1 gap-2 rounded-lg border border-border bg-secondary/40 p-3 sm:grid-cols-2">
        {usps.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-2 text-xs font-medium">
            <Icon className="h-4 w-4 shrink-0 text-primary" />
            {label}
          </li>
        ))}
      </ul>

      {/* Mobile sticky add-to-cart */}
      <MobileStickyBar
        price={effectiveKLUSRPAS}
        onAdd={handleAdd}
        label={
          color?.base ? `${variant.label} · ${paintBases[color.base.id].short}` : variant.label
        }
      />
    </div>
  );
}

function MobileStickyBar({
  price,
  label,
  onAdd,
}: {
  price: number;
  label: string;
  onAdd: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 420);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-16 z-30 border-t border-border bg-card/95 p-3 shadow-card-hover backdrop-blur transition-transform lg:hidden",
        visible ? "translate-y-0" : "translate-y-[150%]",
      )}
    >
      <div className="container-klusr flex items-center gap-3">
        <div className="leading-tight">
          <p className="text-[11px] text-muted-foreground">{label}</p>
          <p className="text-lg font-black text-primary">{formatPrice(price)}</p>
        </div>
        <Button onClick={onAdd} size="lg" className="flex-1">
          <ShoppingCart className="h-5 w-5" />
          In winkelwagen
        </Button>
      </div>
    </div>
  );
}
