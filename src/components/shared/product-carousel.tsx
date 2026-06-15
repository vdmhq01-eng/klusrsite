"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/types";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProductCarouselProps {
  products: Product[];
  listName?: string;
}

export function ProductCarousel({ products, listName }: ProductCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    dragFree: true,
    containScroll: "trimSnaps",
  });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const onSelect = useCallback((api: NonNullable<typeof emblaApi>) => {
    setCanPrev(api.canScrollPrev());
    setCanNext(api.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on("select", onSelect).on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-3 sm:gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="min-w-0 flex-[0_0_46%] sm:flex-[0_0_31%] lg:flex-[0_0_23%]"
            >
              <ProductCard product={product} listName={listName} />
            </div>
          ))}
        </div>
      </div>

      <CarouselButton
        direction="prev"
        disabled={!canPrev}
        onClick={() => emblaApi?.scrollPrev()}
      />
      <CarouselButton
        direction="next"
        disabled={!canNext}
        onClick={() => emblaApi?.scrollNext()}
      />
    </div>
  );
}

function CarouselButton({
  direction,
  disabled,
  onClick,
}: {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "prev" ? "Vorige" : "Volgende"}
      className={cn(
        "absolute top-1/2 z-10 hidden -translate-y-1/2 rounded-full shadow-card-hover disabled:opacity-0 lg:flex",
        direction === "prev" ? "-left-4" : "-right-4",
      )}
    >
      <Icon className="h-5 w-5" />
    </Button>
  );
}
