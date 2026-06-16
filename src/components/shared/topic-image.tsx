import type { LucideIcon } from "lucide-react";
import { BrandedVisual } from "./branded-visual";
import { TopicImagePhoto } from "./topic-image-photo";
import { topicImageUrl } from "@/lib/topic-images";

/**
 * Klus-relevante afbeelding per categorie/onderwerp met een on-brand KLUSR-
 * gradient (+ optioneel categorie-icoon) eronder als fallback. De foto-laag is
 * een aparte client-component die zichzelf verbergt als het laden mislukt, dus
 * de tegel is nooit leeg of kapot. Server-component, zodat het icoon (een
 * functie-component) hier veilig aan BrandedVisual gegeven kan worden.
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
      <TopicImagePhoto src={topicImageUrl(keywords, seed)} className={className} />
    </>
  );
}
