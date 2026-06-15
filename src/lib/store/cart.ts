"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product, ProductVariant, SelectedColor } from "@/types";

const FREE_SHIPPING_THRESHOLD = 50;
const SHIPPING_COST = 4.95;

interface AddArgs {
  product: Product;
  variant: ProductVariant;
  quantity?: number;
  color?: SelectedColor;
  useKluspas?: boolean;
}

interface CartState {
  items: CartItem[];
  savedForLater: CartItem[];
  kluspasActive: boolean;
  /** Recently viewed product ids (most recent first). */
  recentlyViewed: string[];

  addItem: (args: AddArgs) => CartItem;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  setColor: (key: string, color: SelectedColor) => void;
  saveForLater: (key: string) => void;
  moveToCart: (key: string) => void;
  toggleKluspas: () => void;
  clear: () => void;
  pushRecentlyViewed: (productId: string) => void;
}

function lineKey(productId: string, variantId: string, color?: SelectedColor): string {
  return [productId, variantId, color?.code ?? "default"].join("__");
}

/** Unit price for a line, honouring the Kluspas toggle. */
export function linePrice(item: CartItem, kluspasActive: boolean): number {
  return kluspasActive ? item.kluspasPrice : item.price;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      savedForLater: [],
      kluspasActive: true,
      recentlyViewed: [],

      addItem: ({ product, variant, quantity = 1, color, useKluspas }) => {
        const key = lineKey(product.id, variant.id, color);
        const existing = get().items.find((i) => i.key === key);

        if (useKluspas !== undefined) {
          set({ kluspasActive: useKluspas });
        }

        if (existing) {
          set({
            items: get().items.map((i) =>
              i.key === key ? { ...i, quantity: i.quantity + quantity } : i,
            ),
          });
          return { ...existing, quantity: existing.quantity + quantity };
        }

        const item: CartItem = {
          key,
          productId: product.id,
          variantId: variant.id,
          title: product.title,
          brand: product.brand,
          image: product.images[0],
          variantLabel: variant.label,
          slug: product.slug,
          quantity,
          price: variant.price,
          kluspasPrice: variant.kluspasPrice,
          selectedColor: color,
        };
        set({ items: [...get().items, item] });
        return item;
      },

      removeItem: (key) => set({ items: get().items.filter((i) => i.key !== key) }),

      updateQuantity: (key, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.key !== key) });
          return;
        }
        set({
          items: get().items.map((i) => (i.key === key ? { ...i, quantity } : i)),
        });
      },

      setColor: (key, color) =>
        set({
          items: get().items.map((i) =>
            i.key === key ? { ...i, selectedColor: color } : i,
          ),
        }),

      saveForLater: (key) => {
        const item = get().items.find((i) => i.key === key);
        if (!item) return;
        set({
          items: get().items.filter((i) => i.key !== key),
          savedForLater: [...get().savedForLater.filter((i) => i.key !== key), item],
        });
      },

      moveToCart: (key) => {
        const item = get().savedForLater.find((i) => i.key === key);
        if (!item) return;
        set({
          savedForLater: get().savedForLater.filter((i) => i.key !== key),
          items: [...get().items.filter((i) => i.key !== key), item],
        });
      },

      toggleKluspas: () => set({ kluspasActive: !get().kluspasActive }),

      clear: () => set({ items: [] }),

      pushRecentlyViewed: (productId) =>
        set({
          recentlyViewed: [
            productId,
            ...get().recentlyViewed.filter((id) => id !== productId),
          ].slice(0, 8),
        }),
    }),
    {
      name: "klusr-cart",
      partialize: (state) => ({
        items: state.items,
        savedForLater: state.savedForLater,
        kluspasActive: state.kluspasActive,
        recentlyViewed: state.recentlyViewed,
      }),
    },
  ),
);

/* ----------------------------------------------------------------- selectors */

export const cartConfig = {
  freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
  shippingCost: SHIPPING_COST,
};

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

export function cartSubtotal(items: CartItem[], kluspasActive: boolean): number {
  return items.reduce((sum, i) => sum + linePrice(i, kluspasActive) * i.quantity, 0);
}

export function cartRegularSubtotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

export function kluspasSavings(items: CartItem[]): number {
  return items.reduce(
    (sum, i) => sum + Math.max(0, i.price - i.kluspasPrice) * i.quantity,
    0,
  );
}

export function shippingFor(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
}

export function freeShippingProgress(subtotal: number): {
  remaining: number;
  percent: number;
  reached: boolean;
} {
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const percent = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  return { remaining, percent, reached: remaining === 0 };
}
