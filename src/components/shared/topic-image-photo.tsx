"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Alleen de externe foto-laag (client) bovenop de BrandedVisual-gradient.
 * Mislukt het laden, dan verbergen we de <img> zodat alleen de nette gradient
 * blijft — nooit meer een kapot-afbeelding-icoon.
 */
export function TopicImagePhoto({
  src,
  className,
}: {
  src?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn(
        "absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105",
        className,
      )}
    />
  );
}
