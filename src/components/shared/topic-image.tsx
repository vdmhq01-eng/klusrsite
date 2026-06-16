import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandedVisual } from "./branded-visual";
import { topicImageUrl } from "@/lib/topic-images";

/**
 * Klus-relevante afbeelding per categorie/onderwerp (keyword-foto) met een
 * on-brand KLUSR-gradient eronder als fallback — zo past het beeld bij het
 * onderwerp én is het nooit leeg als de fotodienst niet laadt. Bewust een
 * gewone <img> (geen next/image) zodat externe placeholders zonder extra
 * config en met nette fallback werken.
 */
export function TopicImage({
  keywords,
  seed,
  icon,
  className,
}: {
  keywords: string;
  seed: string;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <>
      <BrandedVisual seed={seed} icon={icon} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={topicImageUrl(keywords, seed)}
        alt=""
        loading="lazy"
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105",
          className,
        )}
      />
    </>
  );
}
