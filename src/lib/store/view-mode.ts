"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/** Weergave van het productoverzicht: raster (kaarten) of lijst (rijen). */
export type ViewMode = "grid" | "list";

interface ViewModeState {
  mode: ViewMode;
  setMode: (mode: ViewMode) => void;
}

export const useViewMode = create<ViewModeState>()(
  persist(
    (set) => ({
      mode: "grid",
      setMode: (mode) => set({ mode }),
    }),
    { name: "klusr-view-mode" },
  ),
);
