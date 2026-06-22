"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Alleen de externe foto-laag (client) bovenop de BrandedVisual-gradient.
 * Mislukt het laden, dan proberen we eerst een eventuele `fallbackSrc` en
 * verbergen we de <img> pas als ook dát faalt — zodat alleen de nette gradient
 * blijft en je nooit meer een kapot-afbeelding-icoon ziet.
 */
export function TopicImagePhoto({
  src,
  fallbackSrc,
  className,
}: {
  src?: string;
  fallbackSrc?: string;
  className?: string;
}) {
  // Begin bij de primaire bron en val bij een laadfout terug op `fallbackSrc`.
  const [current, setCurrent] = useState(src ?? fallbackSrc);

  function handleError() {
    setCurrent((active) =>
      active === src && fallbackSrc && fallbackSrc !== src ? fallbackSrc : undefined,
    );
  }

  if (!current) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={current}
      alt=""
      loading="lazy"
      onError={handleError}
      className={cn(
        "absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105",
        className,
      )}
    />
  );
}
