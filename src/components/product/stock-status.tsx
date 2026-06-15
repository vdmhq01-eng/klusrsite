import { Check, MapPin, Truck } from "lucide-react";
import type { StoreStock } from "@/types";
import { getStoreName, flagshipStore } from "@/lib/data/stores";
import { cn } from "@/lib/utils";

interface StockStatusProps {
  stockByStore: StoreStock[];
  /** Preferred store to highlight (defaults to flagship Nijverdal). */
  storeId?: string;
  showScarcity?: boolean;
  showDelivery?: boolean;
  className?: string;
}

const SCARCITY_THRESHOLD = 5;

export function StockStatus({
  stockByStore,
  storeId = flagshipStore.id,
  showScarcity = true,
  showDelivery = false,
  className,
}: StockStatusProps) {
  const store = stockByStore.find((s) => s.storeId === storeId);
  const qty = store?.quantity ?? 0;
  const inStock = qty > 0;
  const totalElsewhere = stockByStore
    .filter((s) => s.storeId !== storeId)
    .reduce((sum, s) => sum + s.quantity, 0);

  return (
    <div className={cn("flex flex-col gap-1 text-xs", className)}>
      {inStock ? (
        <span className="inline-flex items-center gap-1 font-semibold text-klusr-stock">
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
          Op voorraad in {getStoreName(storeId)}
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 font-medium text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          {totalElsewhere > 0
            ? `Niet in ${getStoreName(storeId)} — wel in andere winkels`
            : "Tijdelijk uitverkocht"}
        </span>
      )}
      {showScarcity && inStock && qty <= SCARCITY_THRESHOLD && (
        <span className="font-semibold text-primary">
          Nog {qty} op voorraad in {getStoreName(storeId)}
        </span>
      )}
      {showDelivery && (
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          <Truck className="h-3.5 w-3.5" />
          Voor 16:00 besteld, morgen in huis
        </span>
      )}
    </div>
  );
}
