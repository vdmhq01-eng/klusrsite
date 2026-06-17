"use client";

import { TrailerIcon } from "@/components/shared/trailer-icon";
import { useCart, cartCount } from "@/lib/store/cart";
import { useUI } from "@/lib/store/ui";
import { useMounted } from "@/lib/hooks/use-mounted";
import { useBumpOnIncrease } from "@/lib/hooks/use-bump";
import { cn } from "@/lib/utils";

export function CartButton({ className }: { className?: string }) {
  const items = useCart((s) => s.items);
  const openCart = useUI((s) => s.openCart);
  const mounted = useMounted();
  const count = mounted ? cartCount(items) : 0;
  const bump = useBumpOnIncrease(count);

  return (
    <button
      onClick={openCart}
      aria-label={`Winkelwagen, ${count} artikelen`}
      className={cn(
        "relative inline-flex flex-col items-center justify-center gap-0.5 text-xs font-medium text-foreground transition-colors hover:text-primary",
        className,
      )}
    >
      <span className={cn("relative inline-flex", bump && "animate-cart-bump")}>
        <TrailerIcon className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
            {count}
          </span>
        )}
      </span>
      <span className="hidden lg:inline">Winkelwagen</span>
    </button>
  );
}
