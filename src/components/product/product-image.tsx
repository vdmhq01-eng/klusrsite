"use client";

import Image from "next/image";
import { useState } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductImageProps {
  src?: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  /** Toon de productnaam in de terugval (uit voor thumbnails). */
  showLabel?: boolean;
}

/**
 * Productafbeelding met nette terugval. De feed-afbeeldingen komen van een
 * externe CDN (prosteps.cloudimg.io) die de Vercel-image-optimizer niet
 * betrouwbaar kan ophalen; we laden ze daarom onbewerkt (unoptimized) zodat de
 * browser ze direct laadt. Mislukt het laden alsnog, dan tonen we een nette
 * placeholder i.p.v. een kapot-afbeelding-icoon. Gebruik binnen een `relative`
 * ouder (rendert met `fill`).
 */
export function ProductImage({
  src,
  alt,
  sizes,
  priority,
  className,
  showLabel = true,
}: ProductImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="absolute inset-0 grid place-items-center bg-secondary/60 p-2 text-muted-foreground">
        <span className="flex max-w-full flex-col items-center gap-1">
          <ImageOff className="h-7 w-7 shrink-0" />
          {showLabel && (
            <span className="line-clamp-2 text-center text-[11px] font-medium">{alt}</span>
          )}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      unoptimized
      sizes={sizes}
      priority={priority}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
