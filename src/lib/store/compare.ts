"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const MAX_COMPARE = 4;

interface CompareState {
  ids: string[];
  /** Voegt toe of verwijdert. Geeft "added" terug; false bij verwijderen of vol. */
  toggle: (productId: string) => boolean;
  remove: (productId: string) => void;
  clear: () => void;
}

export const useCompare = create<CompareState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (productId) => {
        const ids = get().ids;
        if (ids.includes(productId)) {
          set({ ids: ids.filter((id) => id !== productId) });
          return false;
        }
        if (ids.length >= MAX_COMPARE) return false;
        set({ ids: [...ids, productId] });
        return true;
      },
      remove: (productId) => set({ ids: get().ids.filter((id) => id !== productId) }),
      clear: () => set({ ids: [] }),
    }),
    { name: "klusr-compare" },
  ),
);
