"use client";

import { create } from "zustand";

interface UIState {
  cartOpen: boolean;
  aiChatOpen: boolean;
  /** Vraag die direct gesteld moet worden zodra de AI-chat opent (bv. vanuit de hero). */
  aiPendingQuestion: string | null;
  searchOpen: boolean;
  setCartOpen: (open: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
  setAiChatOpen: (open: boolean) => void;
  toggleAiChat: () => void;
  /** Open de AI-chat en (optioneel) stuur meteen een vraag in. */
  askAi: (question?: string) => void;
  clearAiPending: () => void;
  setSearchOpen: (open: boolean) => void;
}

export const useUI = create<UIState>((set) => ({
  cartOpen: false,
  aiChatOpen: false,
  aiPendingQuestion: null,
  searchOpen: false,
  setCartOpen: (open) => set({ cartOpen: open }),
  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),
  setAiChatOpen: (open) => set({ aiChatOpen: open }),
  toggleAiChat: () => set((s) => ({ aiChatOpen: !s.aiChatOpen })),
  askAi: (question) =>
    set({ aiPendingQuestion: question?.trim() || null, aiChatOpen: true }),
  clearAiPending: () => set({ aiPendingQuestion: null }),
  setSearchOpen: (open) => set({ searchOpen: open }),
}));
