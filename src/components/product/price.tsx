"use client";

import { formatPrice, cn } from "@/lib/utils";
import { usePricingMode } from "@/lib/store/pricing-mode";
import { useMounted } from "@/lib/hooks/use-mounted";
import { priceView } from "@/lib/pricing";

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
 * KLUSR price block. Modusbewust: particulier toont de KLUSRPAS-prijs incl. btw
 * met de normale prijs doorgestreept; zakelijk toont de ProfPas-prijs excl. btw.
 * Tot hydratie tonen we particulier (voorkomt hydration-mismatch).
 */
export function Price({
  price,
  compareAtPrice,
  kluspasPrice,
  size = "md",
  className,
  from,
}: PriceProps) {
  const mode = usePricingMode((s) => s.mode);
  const mounted = useMounted();
  const view = priceView(
    { price, kluspasPrice, compareAtPrice },
    mounted ? mode : "particulier",
  );

  const mainSize = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-3xl",
  }[size];

  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      {view.reference && (
        <span className="text-xs text-muted-foreground">
          {view.referenceLabel}{" "}
          <span className="line-through">{formatPrice(view.reference)}</span>
        </span>
      )}
      <div className="flex items-baseline gap-1.5">
        {from && (
          <span className="text-xs font-medium text-muted-foreground">vanaf</span>
        )}
        <span className={cn("font-extrabold leading-none text-primary", mainSize)}>
          {formatPrice(view.amount)}
        </span>
        {view.badge && (
          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-primary">
            {view.badge}
          </span>
        )}
        <span className="text-[10px] font-medium text-muted-foreground">
          {view.vatSuffix}
        </span>
      </div>
      {view.savings !== undefined && view.savings > 0 && (
        <span className="text-[11px] font-semibold text-klusr-stock">
          Je bespaart {formatPrice(view.savings)}
          {view.savingsPct ? ` (${view.savingsPct}%)` : ""}
        </span>
      )}
    </div>
  );
}
