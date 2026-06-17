"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      // Rechtsboven — "onder" het winkelwagen-icoon. Lichtgroen bij succes
      // ("toegevoegd aan winkelwagen") met een altijd zichtbaar kruisje (X).
      position="top-right"
      closeButton
      duration={5000}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-card-hover group-[.toaster]:rounded-lg",
          // Succes = lichtgroen met groen vinkje.
          success:
            "group-[.toaster]:!border-green-300 group-[.toaster]:!bg-green-50 group-[.toaster]:!text-green-900 [&_[data-icon]]:!text-green-600",
          description: "group-[.toast]:text-muted-foreground",
          // Altijd zichtbaar, duidelijk kruisje.
          closeButton:
            "group-[.toast]:!border-green-400 group-[.toast]:!bg-white group-[.toast]:!text-green-800 group-[.toast]:!opacity-100",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:font-semibold",
          cancelButton:
            "group-[.toast]:bg-secondary group-[.toast]:text-muted-foreground",
        },
      }}
    />
  );
}
