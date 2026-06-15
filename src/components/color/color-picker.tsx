"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Search, Pipette } from "lucide-react";
import type { SelectedColor } from "@/types";
import { colorCollections, isLightColor } from "@/lib/data/colors";
import { fetchPortalColors } from "@/lib/portal-colors";
import { withBase } from "@/lib/paint-bases";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/tracking";
import { formatPrice, cn } from "@/lib/utils";

interface ColorPickerProps {
  value?: SelectedColor;
  onSelect: (color: SelectedColor) => void;
  /** Show the confirm button (used in dialog mode). */
  onConfirm?: (color: SelectedColor) => void;
  confirmLabel?: string;
}

export function ColorPicker({
  value,
  onSelect,
  onConfirm,
  confirmLabel = "Kies deze kleur",
}: ColorPickerProps) {
  const [collections, setCollections] = useState(colorCollections);
  const [activeCollection, setActiveCollection] = useState(colorCollections[0].id);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<SelectedColor | undefined>(value);
  const [customHex, setCustomHex] = useState(value?.hex ?? "#C90000");

  // Live kleuren uit de portal (Gamma/AkzoNobel/RAL); terugval op gecureerde set.
  useEffect(() => {
    let active = true;
    fetchPortalColors().then((cols) => {
      if (!active || !cols.length) return;
      setCollections(cols);
      setActiveCollection((cur) => (cols.some((c) => c.id === cur) ? cur : cols[0].id));
    });
    return () => {
      active = false;
    };
  }, []);

  const allColors = useMemo(() => collections.flatMap((c) => c.colors), [collections]);

  const visibleColors = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = q
      ? allColors.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.code.toLowerCase().includes(q) ||
            (c.collection ?? "").toLowerCase().includes(q) ||
            (c.provider ?? "").toLowerCase().includes(q),
        )
      : collections.find((c) => c.id === activeCollection)?.colors ?? [];
    return pool.slice(0, 200);
  }, [query, activeCollection, collections, allColors]);

  function pick(color: SelectedColor) {
    const enriched = withBase(color);
    setSelected(enriched);
    onSelect(enriched);
    trackEvent("color_selected", {
      color_code: enriched.code,
      color_name: enriched.name,
      paint_base: enriched.base?.id,
    });
  }

  function applyCustom() {
    const hex = customHex.startsWith("#") ? customHex : `#${customHex}`;
    if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return;
    pick({ name: "Eigen kleur", code: hex.toUpperCase(), hex, collection: "Op maat" });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Zoek op kleurnaam of code (bijv. RAL 9010)"
          className="pl-9"
        />
      </div>

      {/* Collection tabs */}
      {!query.trim() && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {collections.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCollection(c.id)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                activeCollection === c.id
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40",
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {/* Swatch grid */}
      <div className="grid max-h-[44vh] grid-cols-4 gap-2 overflow-y-auto pr-1 sm:grid-cols-6">
        {visibleColors.map((color) => {
          const active = selected?.code === color.code;
          return (
            <button
              key={color.code}
              onClick={() => pick(color)}
              title={`${color.name} (${color.code})`}
              className={cn(
                "group relative aspect-square rounded-md border transition-all",
                active ? "ring-2 ring-primary ring-offset-2" : "border-black/10 hover:scale-105",
              )}
              style={{ backgroundColor: color.hex }}
            >
              {active && (
                <Check
                  className={cn(
                    "absolute inset-0 m-auto h-5 w-5",
                    isLightColor(color.hex) ? "text-black" : "text-white",
                  )}
                  strokeWidth={3}
                />
              )}
            </button>
          );
        })}
        {visibleColors.length === 0 && (
          <p className="col-span-full py-6 text-center text-sm text-muted-foreground">
            Geen kleuren gevonden. Probeer een andere zoekterm.
          </p>
        )}
      </div>

      {/* Custom colour */}
      <div className="rounded-lg border border-border bg-secondary/40 p-3">
        <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
          <Pipette className="h-4 w-4 text-primary" />
          Eigen kleur mengen
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="color"
            value={customHex}
            onChange={(e) => setCustomHex(e.target.value)}
            className="h-10 w-12 shrink-0 cursor-pointer rounded border border-border bg-card"
            aria-label="Kleurkiezer"
          />
          <Input
            value={customHex}
            onChange={(e) => setCustomHex(e.target.value)}
            placeholder="#C90000"
            className="min-w-0 flex-1 font-mono uppercase"
          />
          <Button variant="outline" onClick={applyCustom}>
            Toepassen
          </Button>
        </div>
      </div>

      {/* Selected preview + confirm */}
      {selected && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-3">
          <div className="flex items-center gap-3">
            <span
              className="h-12 w-12 rounded-md border border-black/10"
              style={{ backgroundColor: selected.hex }}
            />
            <div>
              <p className="text-sm font-bold">{selected.name}</p>
              <p className="text-xs text-muted-foreground">
                {selected.code}
                {selected.collection ? ` · ${selected.collection}` : ""}
              </p>
              {selected.base && (
                <p className="mt-0.5 text-xs font-medium text-primary">
                  {selected.base.label}
                  {selected.base.surcharge > 0
                    ? ` · +${formatPrice(selected.base.surcharge)}`
                    : " · inbegrepen"}
                </p>
              )}
            </div>
          </div>
          {onConfirm && (
            <Button onClick={() => onConfirm(selected)}>{confirmLabel}</Button>
          )}
        </div>
      )}
    </div>
  );
}
