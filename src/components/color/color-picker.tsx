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

  const q = query.trim().toLowerCase();

  const matched = useMemo(() => {
    if (!q) return [];
    return allColors.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        (c.collection ?? "").toLowerCase().includes(q) ||
        (c.provider ?? "").toLowerCase().includes(q),
    );
  }, [q, allColors]);

  // Zoekresultaten gegroepeerd per collectie (met totaal-telling).
  const searchGroups = useMemo(() => {
    if (!q) return [];
    const map = new Map<
      string,
      { name: string; id: string; colors: SelectedColor[]; total: number }
    >();
    for (const c of matched) {
      const name = c.collection || "Overig";
      let g = map.get(name);
      if (!g) {
        const coll = collections.find((cc) => cc.name === name);
        g = { name, id: coll?.id ?? name, colors: [], total: 0 };
        map.set(name, g);
      }
      g.total++;
      if (g.colors.length < 48) g.colors.push(c);
    }
    return [...map.values()].sort((a, b) => b.total - a.total);
  }, [q, matched, collections]);

  const activeColors = useMemo(
    () => collections.find((c) => c.id === activeCollection)?.colors ?? [],
    [collections, activeCollection],
  );

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

  const gridStyle = { gridTemplateColumns: "repeat(auto-fill, minmax(3.25rem, 1fr))" };

  const renderSwatch = (color: SelectedColor, key: string) => {
    const active = selected?.code === color.code && selected?.hex === color.hex;
    return (
      <button
        key={key}
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
  };

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

      {/* Collection tabs (bladeren) */}
      {!q && (
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
              <span className="ml-1 opacity-60">{c.colors.length}</span>
            </button>
          ))}
        </div>
      )}

      {/* Bladeren: actieve collectie */}
      {!q && (
        <div className="grid max-h-[55vh] gap-2 overflow-y-auto pr-1" style={gridStyle}>
          {activeColors.map((color, i) =>
            renderSwatch(color, `${color.code}-${color.hex}-${i}`),
          )}
          {activeColors.length === 0 && (
            <p className="col-span-full py-6 text-center text-sm text-muted-foreground">
              Nog geen kleuren in deze collectie.
            </p>
          )}
        </div>
      )}

      {/* Zoeken: resultaten gegroepeerd per collectie */}
      {q &&
        (searchGroups.length > 0 ? (
          <div className="flex max-h-[58vh] flex-col gap-4 overflow-y-auto pr-1">
            {searchGroups.map((g) => (
              <div key={g.id}>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    {g.name} <span className="text-foreground">· {g.total}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCollection(g.id);
                      setQuery("");
                    }}
                    className="shrink-0 text-xs font-semibold text-primary hover:underline"
                  >
                    Toon collectie
                  </button>
                </div>
                <div className="grid gap-2" style={gridStyle}>
                  {g.colors.map((color, i) =>
                    renderSwatch(color, `${g.id}-${color.code}-${color.hex}-${i}`),
                  )}
                </div>
                {g.total > g.colors.length && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCollection(g.id);
                      setQuery("");
                    }}
                    className="mt-1.5 text-xs text-muted-foreground hover:text-primary"
                  >
                    +{g.total - g.colors.length} meer in {g.name}
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Geen kleuren gevonden voor &ldquo;{query}&rdquo;. Probeer een andere zoekterm.
          </p>
        ))}

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
