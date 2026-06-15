"use client";

import { useState } from "react";
import { Palette } from "lucide-react";
import type { SelectedColor } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ColorPicker } from "./color-picker";
import { trackEvent } from "@/lib/tracking";

interface ColorPickerDialogProps {
  value?: SelectedColor;
  onConfirm: (color: SelectedColor) => void;
  trigger: React.ReactNode;
}

export function ColorPickerDialog({ value, onConfirm, trigger }: ColorPickerDialogProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<SelectedColor | undefined>(value);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) trackEvent("color_picker_opened", {});
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Kies je kleur
          </DialogTitle>
          <DialogDescription>
            Kies uit onze collecties of meng je eigen kleur. Wij mengen de verf
            exact op de gekozen kleur.
          </DialogDescription>
        </DialogHeader>
        <ColorPicker
          value={value}
          onSelect={setDraft}
          onConfirm={(c) => {
            onConfirm(c);
            setDraft(c);
            setOpen(false);
          }}
          confirmLabel="Kleur kiezen"
        />
      </DialogContent>
    </Dialog>
  );
}
