"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/** Particulier (consument, incl. btw) of Zakelijk (ProfPas, excl. btw). */
export type PricingMode = "particulier" | "zakelijk";

interface PricingModeState {
  mode: PricingMode;
  /** Of de bezoeker zich als zakelijke ProfPas-klant heeft geregistreerd. */
  profpasRegistered: boolean;
  setMode: (mode: PricingMode) => void;
  toggle: () => void;
  registerProfpas: () => void;
}

export const usePricingMode = create<PricingModeState>()(
  persist(
    (set, get) => ({
      mode: "particulier",
      profpasRegistered: false,
      setMode: (mode) => set({ mode }),
      toggle: () =>
        set({ mode: get().mode === "particulier" ? "zakelijk" : "particulier" }),
      registerProfpas: () => set({ profpasRegistered: true, mode: "zakelijk" }),
    }),
    { name: "klusr-pricing-mode" },
  ),
);
