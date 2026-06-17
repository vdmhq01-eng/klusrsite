"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      // Onderin met sluitknop (X); lichtgroen bij succes ("toegevoegd aan
      // winkelwagen"). De offset houdt 'm op mobiel boven de onderbalk.
      position="bottom-center"
      offset={80}
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-card-hover group-[.toaster]:rounded-lg",
          // Succes = lichtgroen met groen vinkje.
          success:
            "group-[.toaster]:!border-green-300 group-[.toaster]:!bg-green-50 group-[.toaster]:!text-green-900 [&_[data-icon]]:!text-green-600",
          description: "group-[.toast]:text-muted-foreground",
          closeButton:
            "group-[.toast]:!border-border group-[.toast]:!bg-card group-[.toast]:!text-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:font-semibold",
          cancelButton:
            "group-[.toast]:bg-secondary group-[.toast]:text-muted-foreground",
        },
      }}
    />
  );
}
