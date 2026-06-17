"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      // Boven-midden: blokkeert op mobiel niet de sticky checkout-knop / winkelwagen-drawer.
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-card-hover group-[.toaster]:rounded-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:font-semibold",
          cancelButton:
            "group-[.toast]:bg-secondary group-[.toast]:text-muted-foreground",
        },
      }}
    />
  );
}
