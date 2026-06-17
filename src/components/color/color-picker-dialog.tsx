"use client";

import { useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Palette, X } from "lucide-react";
import type { SelectedColor } from "@/types";
import { ColorPicker } from "./color-picker";
import { trackEvent } from "@/lib/tracking";

interface ColorPickerDialogProps {
  value?: SelectedColor;
  onConfirm: (color: SelectedColor) => void;
  trigger: React.ReactNode;
}

/**
 * KLUSR-kleurkiezer in een responsieve modal: full-screen op mobiel, gecentreerd
 * venster op desktop. De kiezer vult de hoogte en scrollt intern, met een vaste
 * onderbalk voor de gekozen kleur.
 */
export function ColorPickerDialog({ value, onConfirm, trigger }: ColorPickerDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) trackEvent("color_picker_opened", {});
      }}
    >
      <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-fade-in" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-card shadow-card-hover focus:outline-none data-[state=open]:animate-slide-up sm:inset-auto sm:left-1/2 sm:top-1/2 sm:h-[88vh] sm:max-h-[760px] sm:w-[calc(100%-2rem)] sm:max-w-3xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:border sm:border-border"
        >
          {/* Header */}
          <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-4 py-3.5">
            <div className="min-w-0">
              <DialogPrimitive.Title className="flex items-center gap-2 text-base font-bold">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-primary text-white">
                  <Palette className="h-4 w-4" />
                </span>
                Kies je kleur
              </DialogPrimitive.Title>
              <p className="mt-1 text-xs text-muted-foreground">
                Kies uit onze collecties — wij mengen de verf exact op kleur.
              </p>
            </div>
            <DialogPrimitive.Close
              aria-label="Sluiten"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </DialogPrimitive.Close>
          </div>

          <ColorPicker
            value={value}
            onSelect={() => {}}
            onConfirm={(c) => {
              onConfirm(c);
              setOpen(false);
            }}
            confirmLabel="Kies deze kleur"
            className="min-h-0 flex-1"
          />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
