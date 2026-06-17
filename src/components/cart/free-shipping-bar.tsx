"use client";

import { Truck, PartyPopper } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { freeShippingProgress } from "@/lib/store/cart";
import { formatPrice, cn } from "@/lib/utils";
import { useT } from "@/components/i18n/locale-provider";

export function FreeShippingBar({
  subtotal,
  className,
}: {
  subtotal: number;
  className?: string;
}) {
  const t = useT();
  const { remaining, percent, reached } = freeShippingProgress(subtotal);

  return (
    <div className={cn("rounded-lg bg-secondary/60 p-3", className)}>
      <div className="mb-2 flex items-center gap-2 text-sm">
        {reached ? (
          <>
            <PartyPopper className="h-4 w-4 text-klusr-stock" />
            <span className="font-semibold text-klusr-stock">
              {t("cart.freeShipping.reachedPre")}
              <strong>{t("cart.freeShipping.reachedBold")}</strong>
              {t("cart.freeShipping.reachedPost")}
            </span>
          </>
        ) : (
          <>
            <Truck className="h-4 w-4 text-primary" />
            <span className="font-medium">
              {t("cart.freeShipping.remainingPre")}
              <strong className="text-primary">{formatPrice(remaining)}</strong>
              {t("cart.freeShipping.remainingPost")}
            </span>
          </>
        )}
      </div>
      <Progress
        value={percent}
        indicatorClassName={reached ? "bg-klusr-stock" : "bg-primary"}
      />
    </div>
  );
}
