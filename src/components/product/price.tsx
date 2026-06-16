import { formatPrice, discountPercent, cn } from "@/lib/utils";

interface PriceProps {
  price: number;
  compareAtPrice?: number;
  kluspasPrice?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Toon "vanaf" voor de prijs (bij meerdere varianten). */
  from?: boolean;
}

/**
 * KLUSR price block: struck adviesprijs + prominent red KLUSRPAS-prijs.
 */
export function Price({
  price,
  compareAtPrice,
  kluspasPrice,
  size = "md",
  className,
  from,
}: PriceProps) {
  const hasKLUSRPAS = kluspasPrice !== undefined && kluspasPrice < price;
  const reference = compareAtPrice && compareAtPrice > price ? compareAtPrice : price;
  const finalPrice = hasKLUSRPAS ? kluspasPrice! : price;
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
      <div className="flex items-baseline gap-1.5">
        {from && (
          <span className="text-xs font-medium text-muted-foreground">vanaf</span>
        )}
        <span className={cn("font-extrabold leading-none text-primary", mainSize)}>
          {formatPrice(finalPrice)}
        </span>
        {hasKLUSRPAS && (
          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-primary">
            KLUSRPAS
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
