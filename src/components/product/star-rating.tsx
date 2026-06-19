import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  className?: string;
  /**
   * Tekst voor de "nog geen reviews"-status. Wordt getoond i.p.v. (nep) 0-sterren
   * wanneer er geen reviews zijn. Default Nederlands — net als de aria-label
   * hieronder — zodat de component zowel in server- als client-bomen werkt
   * zonder i18n-hook. Roepers met een locale geven hier de vertaalde tekst door.
   */
  noReviewsLabel?: string;
}

const sizeMap = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

const textSizeMap = {
  sm: "text-xs",
  md: "text-xs",
  lg: "text-sm",
};

export function StarRating({
  rating,
  reviewCount,
  size = "sm",
  showCount = true,
  className,
  noReviewsLabel = "Nog geen reviews",
}: StarRatingProps) {
  // Nog geen reviews → geen (nep) 0-sterren, maar een nette muted regel. We
  // beslissen dit op reviewCount (0) of een ontbrekende rating (0).
  const noReviews = reviewCount === 0 || rating <= 0;
  if (noReviews) {
    return (
      <span
        className={cn(
          "font-medium text-muted-foreground",
          textSizeMap[size],
          className,
        )}
      >
        {noReviewsLabel}
      </span>
    );
  }

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex items-center" aria-label={`${rating} van 5 sterren`}>
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i < Math.round(rating);
          return (
            <Star
              key={i}
              className={cn(
                sizeMap[size],
                filled
                  ? "fill-klusr-action text-klusr-action"
                  : "fill-black/10 text-black/10",
              )}
            />
          );
        })}
      </div>
      {showCount && (
        <span className="text-xs font-medium text-muted-foreground">
          {rating.toFixed(1)}
          {reviewCount !== undefined && ` (${reviewCount})`}
        </span>
      )}
    </div>
  );
}
