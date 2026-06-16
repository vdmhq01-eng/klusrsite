"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Wrench, Heart, ShoppingCart } from "lucide-react";
import { useCart, cartCount } from "@/lib/store/cart";
import { useFavorites } from "@/lib/store/favorites";
import { useUI } from "@/lib/store/ui";
import { useMounted } from "@/lib/hooks/use-mounted";
import { useBumpOnIncrease } from "@/lib/hooks/use-bump";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const pathname = usePathname();
  const items = useCart((s) => s.items);
  const favIds = useFavorites((s) => s.ids);
  const openCart = useUI((s) => s.openCart);
  const mounted = useMounted();

  const count = mounted ? cartCount(items) : 0;
  const favCount = mounted ? favIds.length : 0;
  const bump = useBumpOnIncrease(count);

  const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/zoeken", label: "Zoeken", icon: Search },
    { href: "/klushulp", label: "Klushulp", icon: Wrench },
    { href: "/account/favorieten", label: "Favorieten", icon: Heart, badge: favCount },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur lg:hidden">
      <ul className="grid grid-cols-5">
        {links.map(({ href, label, icon: Icon, badge }) => {
          const active = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <span className="relative">
                  <Icon className="h-5 w-5" />
                  {badge ? (
                    <span className="absolute -right-2 -top-1.5 grid h-3.5 min-w-3.5 place-items-center rounded-full bg-primary px-1 text-[9px] font-bold text-white">
                      {badge}
                    </span>
                  ) : null}
                </span>
                {label}
              </Link>
            </li>
          );
        })}
        <li>
          <button
            onClick={openCart}
            className="relative flex w-full flex-col items-center gap-0.5 py-2 text-[10px] font-medium text-muted-foreground"
          >
            <span className={cn("relative inline-flex", bump && "animate-cart-bump")}>
              <ShoppingCart className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -right-2 -top-1.5 grid h-3.5 min-w-3.5 place-items-center rounded-full bg-primary px-1 text-[9px] font-bold text-white">
                  {count}
                </span>
              )}
            </span>
            Winkelwagen
          </button>
        </li>
      </ul>
    </nav>
  );
}
