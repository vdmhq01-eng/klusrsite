"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

/** 15-minuten "nabestel"-venster: voeg na een bestelling nog iets toe zonder
 *  extra verzendkosten (de checkout rekent dan 0 verzendkosten). */
export const REORDER_WINDOW_MS = 15 * 60 * 1000;

interface ReorderState {
  until: number;
  start: () => void;
  clear: () => void;
}

export const useReorder = create<ReorderState>()(
  persist(
    (set) => ({
      until: 0,
      start: () => set({ until: Date.now() + REORDER_WINDOW_MS }),
      clear: () => set({ until: 0 }),
    }),
    { name: "klusr-reorder" },
  ),
);

/** Reactief: of het venster nog loopt + de resterende seconden (tikt per seconde). */
export function useReorderActive(): { active: boolean; secondsLeft: number } {
  const until = useReorder((s) => s.until);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const secondsLeft = Math.max(0, Math.floor((until - now) / 1000));
  return { active: secondsLeft > 0, secondsLeft };
}
