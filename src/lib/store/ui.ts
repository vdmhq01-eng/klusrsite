"use client";

import { create } from "zustand";

interface UIState {
  cartOpen: boolean;
  aiChatOpen: boolean;
  searchOpen: boolean;
  setCartOpen: (open: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
  setAiChatOpen: (open: boolean) => void;
  toggleAiChat: () => void;
  setSearchOpen: (open: boolean) => void;
}

export const useUI = create<UIState>((set) => ({
  cartOpen: false,
  aiChatOpen: false,
  searchOpen: false,
  setCartOpen: (open) => set({ cartOpen: open }),
  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),
  setAiChatOpen: (open) => set({ aiChatOpen: open }),
  toggleAiChat: () => set((s) => ({ aiChatOpen: !s.aiChatOpen })),
  setSearchOpen: (open) => set({ searchOpen: open }),
}));
