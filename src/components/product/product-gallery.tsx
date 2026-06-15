"use client";

import { useState } from "react";
import Image from "next/image";
import { ProductBadges } from "./product-badges";
import type { ProductBadge } from "@/types";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  title: string;
  badges?: ProductBadge[];
}

export function ProductGallery({ images, title, badges }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const safeImages = images.length ? images : ["https://picsum.photos/seed/klusr-fallback/900/900"];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-white">
        {badges && badges.length > 0 && (
          <div className="absolute left-3 top-3 z-10">
            <ProductBadges badges={badges} />
          </div>
        )}
        <Image
          src={safeImages[active]}
          alt={title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
      </div>

      {safeImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {safeImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Afbeelding ${i + 1}`}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-white transition-all sm:h-20 sm:w-20",
                active === i ? "border-primary ring-1 ring-primary" : "border-border hover:border-primary/40",
              )}
            >
              <Image src={img} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
