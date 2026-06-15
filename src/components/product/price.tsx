import { formatPrice, discountPercent, cn } from "@/lib/utils";

interface PriceProps {
  price: number;
  compareAtPrice?: number;
  kluspasPrice?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * KLUSR price block: struck adviesprijs + prominent red Kluspasprijs.
 */
export function Price({
  price,
  compareAtPrice,
  kluspasPrice,
  size = "md",
  className,
}: PriceProps) {
  const hasKluspas = kluspasPrice !== undefined && kluspasPrice < price;
  const reference = compareAtPrice && compareAtPrice > price ? compareAtPrice : price;
  const finalPrice = hasKluspas ? kluspasPrice! : price;
  const showStrike = reference > finalPrice;

  const mainSize = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-3xl",
  }[size];

  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      {showStrike && (
        <span className="text-xs text-muted-foreground">
          Adviesprijs{" "}
          <span className="line-through">{formatPrice(reference)}</span>
        </span>
      )}
      <div className="flex items-baseline gap-2">
        <span className={cn("font-extrabold leading-none text-primary", mainSize)}>
          {formatPrice(finalPrice)}
        </span>
        {hasKluspas && (
          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-primary">
            Kluspas
          </span>
        )}
      </div>
      {showStrike && (
        <span className="text-[11px] font-semibold text-klusr-stock">
          Je bespaart {formatPrice(reference - finalPrice)} (
          {discountPercent(reference, finalPrice)}%)
        </span>
      )}
    </div>
  );
}
