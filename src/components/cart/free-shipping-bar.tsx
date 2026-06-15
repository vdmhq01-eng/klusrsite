import { Truck, PartyPopper } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { freeShippingProgress } from "@/lib/store/cart";
import { formatPrice, cn } from "@/lib/utils";

export function FreeShippingBar({
  subtotal,
  className,
}: {
  subtotal: number;
  className?: string;
}) {
  const { remaining, percent, reached } = freeShippingProgress(subtotal);

  return (
    <div className={cn("rounded-lg bg-secondary/60 p-3", className)}>
      <div className="mb-2 flex items-center gap-2 text-sm">
        {reached ? (
          <>
            <PartyPopper className="h-4 w-4 text-klusr-stock" />
            <span className="font-semibold text-klusr-stock">
              Gefeliciteerd! Je krijgt <strong>gratis verzending</strong>.
            </span>
          </>
        ) : (
          <>
            <Truck className="h-4 w-4 text-primary" />
            <span className="font-medium">
              Nog <strong className="text-primary">{formatPrice(remaining)}</strong> tot
              gratis verzending
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
