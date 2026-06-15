"use client";

import { ProductImage } from "./product-image";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { StarRating } from "./star-rating";
import { Price } from "./price";
import { StockStatus } from "./stock-status";
import { ProductBadges } from "./product-badges";
import { useCart } from "@/lib/store/cart";
import { useFavorites } from "@/lib/store/favorites";
import { useMounted } from "@/lib/hooks/use-mounted";
import { trackEvent, toAnalyticsItem } from "@/lib/tracking";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  /** Analytics list context, e.g. "Populaire producten". */
  listName?: string;
  className?: string;
}

export function ProductCard({ product, listName, className }: ProductCardProps) {
  const addItem = useCart((s) => s.addItem);
  const toggleFavorite = useFavorites((s) => s.toggle);
  const favoriteIds = useFavorites((s) => s.ids);
  const mounted = useMounted();
  const isFavorite = mounted && favoriteIds.includes(product.id);

  const defaultVariant = product.variants[0];

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    addItem({ product, variant: defaultVariant, quantity: 1 });
    trackEvent("add_to_cart", {
      value: defaultVariant.kluspasPrice,
      items: [
        toAnalyticsItem({
          id: product.id,
          title: product.title,
          brand: product.brand,
          category: product.category,
          price: defaultVariant.kluspasPrice,
        }),
      ],
    });
    toast.success("Toegevoegd aan winkelwagen", {
      description: `${product.brand} ${product.title}`,
    });
  }

  function handleSelect() {
    trackEvent("select_item", {
      item_list_name: listName,
      items: [
        toAnalyticsItem({
          id: product.id,
          title: product.title,
          brand: product.brand,
          category: product.category,
          price: product.kluspasPrice,
        }),
      ],
    });
  }

  return (
    <div
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-card transition-shadow hover:shadow-card-hover",
        className,
      )}
    >
      {/* Badges + favorite */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between p-2.5">
        <ProductBadges badges={product.badges} />
        <button
          type="button"
          onClick={() => {
            toggleFavorite(product.id);
            toast(isFavorite ? "Verwijderd uit favorieten" : "Toegevoegd aan favorieten");
          }}
          aria-label="Bewaar als favoriet"
          className="pointer-events-auto grid h-8 w-8 place-items-center rounded-full bg-card/90 text-muted-foreground shadow-sm backdrop-blur transition-colors hover:text-primary"
        >
          <Heart className={cn("h-4 w-4", isFavorite && "fill-primary text-primary")} />
        </button>
      </div>

      <Link
        href={`/product/${product.slug}`}
        onClick={handleSelect}
        className="relative block aspect-square overflow-hidden bg-white"
      >
        <ProductImage
          src={product.images[0]}
          alt={`${product.brand} ${product.title}`}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            {product.brand}
          </span>
          <Link
            href={`/product/${product.slug}`}
            onClick={handleSelect}
            className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-tight text-foreground hover:text-primary"
          >
            {product.title}
          </Link>
          <span className="text-xs text-muted-foreground">
            {defaultVariant.label}
          </span>
        </div>

        <StarRating rating={product.rating} reviewCount={product.reviewCount} />

        <div className="mt-auto flex flex-col gap-2 pt-1">
          <Price
            price={product.price}
            compareAtPrice={product.compareAtPrice}
            kluspasPrice={product.kluspasPrice}
            size="md"
          />
          <StockStatus stockByStore={product.stockByStore} showScarcity />
          <Button onClick={handleAdd} className="w-full" size="sm">
            <ShoppingCart className="h-4 w-4" />
            In winkelwagen
          </Button>
        </div>
      </div>
    </div>
  );
}
