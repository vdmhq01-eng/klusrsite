"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Palette,
  Check,
  ArrowRight,
  ArrowLeft,
  Home,
  Building2,
  DoorOpen,
  Layers,
  PanelTop,
  Sparkles,
  Info,
} from "lucide-react";
import type { Product, SelectedColor } from "@/types";
import { colorCollections, isLightColor } from "@/lib/data/colors";
import { withBase } from "@/lib/paint-bases";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn, formatPrice } from "@/lib/utils";
import { trackEvent } from "@/lib/tracking";

interface Klus {
  id: string;
  label: string;
  sub: string;
  icon: typeof Home;
  include: string[];
  exclude?: string[];
}

// Klus → producttype. Match op categorie/subcategorie/titel (lowercased).
const KLUSSEN: Klus[] = [
  { id: "binnenmuur", label: "Binnenmuur", sub: "Woonkamer, slaapkamer, gang", icon: Home, include: ["binnenmuur", "binnen", "muurverf", "muur", "latex"], exclude: ["buiten", "gevel"] },
  { id: "buitenmuur", label: "Buitenmuur & gevel", sub: "Buitenwerk dat tegen weer moet", icon: Building2, include: ["buitenmuur", "buiten", "gevel"] },
  { id: "hout", label: "Hout, kozijn & deur", sub: "Lak en beits voor houtwerk", icon: DoorOpen, include: ["lak", "beits", "hout", "kozijn", "deur", "meubel", "grondverf", "primer"] },
  { id: "vloer", label: "Vloer & beton", sub: "Vloeren, trappen en garage", icon: Layers, include: ["vloer", "beton", "garage", "trap"] },
  { id: "plafond", label: "Plafond", sub: "Strak en mat naar boven", icon: PanelTop, include: ["plafond"] },
];

function matchesKlus(product: Product, klus: Klus): boolean {
  const hay = `${product.category} ${product.subCategory ?? ""} ${product.title}`.toLowerCase();
  if (klus.exclude?.some((k) => hay.includes(k))) return false;
  return klus.include.some((k) => hay.includes(k));
}

/** Goedkoopste prijs per liter-variant + eventuele basistoeslag. */
function fromPrice(product: Product, color: SelectedColor): number {
  const cheapest = Math.min(...product.variants.map((v) => v.kluspasPrice));
  return cheapest + (color.base?.surcharge ?? 0);
}

interface Props {
  colorProducts: Product[];
}

export function KleurenkiezerFunnel({ colorProducts }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [activeCollection, setActiveCollection] = useState(colorCollections[0].id);
  const [color, setColor] = useState<SelectedColor | null>(null);
  const [klus, setKlus] = useState<Klus | null>(null);

  const collection =
    colorCollections.find((c) => c.id === activeCollection) ?? colorCollections[0];

  function pickColor(c: SelectedColor) {
    const withBaseColor = withBase(c);
    setColor(withBaseColor);
    trackEvent("color_selected", { color: c.name, code: c.code, source: "kleurenkiezer" });
    setStep(2);
  }

  function pickKlus(k: Klus) {
    setKlus(k);
    trackEvent("kleurenkiezer_klus", { klus: k.id });
    setStep(3);
  }

  const matches = useMemo(() => {
    if (!klus) return [];
    const filtered = colorProducts.filter((p) => matchesKlus(p, klus));
    return filtered.length > 0 ? filtered : colorProducts;
  }, [klus, colorProducts]);

  const usedFallback = klus
    ? colorProducts.filter((p) => matchesKlus(p, klus)).length === 0
    : false;

  const steps = [
    { n: 1 as const, label: "Kies je kleur" },
    { n: 2 as const, label: "Wat ga je verven?" },
    { n: 3 as const, label: "Kies je verf" },
  ];

  return (
    <div className="flex flex-col gap-8 py-6 sm:py-8">
      {/* Hero */}
      <section className="container-klusr">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">
          <Palette className="h-3.5 w-3.5" />
          KLEURENKIEZER
        </span>
        <h1 className="mt-4 max-w-2xl text-3xl font-black tracking-tight text-balance sm:text-4xl">
          Eerst je kleur, dan je verf
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Kies in drie simpele stappen de juiste verf — wij mengen &apos;m exact op
          jouw kleur. Voor 19:00 besteld, morgen in huis.
        </p>
      </section>

      {/* Stepper */}
      <section className="container-klusr">
        <ol className="flex flex-wrap items-center gap-x-3 gap-y-2">
          {steps.map((s, i) => {
            const done = step > s.n;
            const current = step === s.n;
            const reachable = s.n < step || (s.n === 2 && color) || (s.n === 3 && color && klus);
            return (
              <li key={s.n} className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={!reachable && !current}
                  onClick={() => reachable && setStep(s.n)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors",
                    current && "bg-primary text-white",
                    done && "bg-primary/10 text-primary hover:bg-primary/20",
                    !current && !done && "bg-secondary text-muted-foreground",
                    reachable && !current && "cursor-pointer",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-5 w-5 place-items-center rounded-full text-xs",
                      current ? "bg-white text-primary" : done ? "bg-primary text-white" : "bg-card",
                    )}
                  >
                    {done ? <Check className="h-3 w-3" /> : s.n}
                  </span>
                  {s.label}
                </button>
                {i < steps.length - 1 && <span className="h-px w-5 bg-border" aria-hidden />}
              </li>
            );
          })}
        </ol>

        {/* Keuze-samenvatting */}
        {(color || klus) && (
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            {color && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 font-medium hover:border-primary/40"
              >
                <span
                  className="h-4 w-4 rounded-full border border-black/10"
                  style={{ backgroundColor: color.hex }}
                />
                {color.name}
                <span className="text-xs text-muted-foreground">wijzig</span>
              </button>
            )}
            {klus && (
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 font-medium hover:border-primary/40"
              >
                <klus.icon className="h-4 w-4 text-primary" />
                {klus.label}
                <span className="text-xs text-muted-foreground">wijzig</span>
              </button>
            )}
          </div>
        )}
      </section>

      {/* STAP 1 — Kleur */}
      {step === 1 && (
        <section className="container-klusr">
          <div className="mb-4 flex flex-wrap gap-2">
            {colorCollections.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveCollection(c.id)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors",
                  activeCollection === c.id
                    ? "bg-foreground text-background"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/70",
                )}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {collection.colors.map((c) => {
              const light = isLightColor(c.hex);
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => pickColor(c)}
                  className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-xl border border-black/5 p-3 text-left shadow-sm ring-primary transition-all hover:scale-[1.02] hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2"
                  style={{ backgroundColor: c.hex }}
                >
                  <span
                    className={cn(
                      "rounded-md px-2 py-1 text-xs font-bold backdrop-blur",
                      light ? "bg-black/5 text-black/80" : "bg-white/15 text-white",
                    )}
                  >
                    {c.name}
                    <span className="block text-[10px] font-medium opacity-70">{c.code}</span>
                  </span>
                  <span
                    className={cn(
                      "absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full opacity-0 transition-opacity group-hover:opacity-100",
                      light ? "bg-black/10 text-black/70" : "bg-white/20 text-white",
                    )}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* STAP 2 — Klus */}
      {step === 2 && (
        <section className="container-klusr">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {KLUSSEN.map((k) => (
              <button
                key={k.id}
                type="button"
                onClick={() => pickKlus(k)}
                className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 text-left transition-all hover:border-primary/40 hover:shadow-card-hover"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <k.icon className="h-6 w-6" />
                </span>
                <span className="min-w-0">
                  <span className="block font-bold">{k.label}</span>
                  <span className="block text-sm text-muted-foreground">{k.sub}</span>
                </span>
                <ArrowRight className="ml-auto h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Terug naar kleur
          </button>
        </section>
      )}

      {/* STAP 3 — Verf */}
      {step === 3 && color && klus && (
        <section className="container-klusr">
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-border bg-secondary/40 p-4">
            <span
              className="h-12 w-12 shrink-0 rounded-xl border border-black/10 shadow-inner"
              style={{ backgroundColor: color.hex }}
            />
            <div className="min-w-0">
              <p className="font-bold">
                {color.name} <span className="font-medium text-muted-foreground">· {color.code}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                {matches.length} verfsoort{matches.length === 1 ? "" : "en"} voor{" "}
                {klus.label.toLowerCase()} — op kleur gemengd
              </p>
            </div>
          </div>

          {usedFallback && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-border bg-card p-3 text-sm text-muted-foreground">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              Geen exacte match voor deze klus — we tonen al onze mengbare verf in
              jouw kleur.
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {matches.map((p) => (
              <Card key={p.id} className="flex flex-col overflow-hidden">
                <div className="relative aspect-square bg-secondary/30">
                  {p.images[0] && (
                    <Image
                      src={p.images[0]}
                      alt={p.title}
                      fill
                      sizes="(max-width: 640px) 50vw, 33vw"
                      className="object-contain p-4"
                    />
                  )}
                  {/* Gekozen kleur als swatch op de kaart */}
                  <span
                    className="absolute bottom-2 left-2 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2 py-1 text-[11px] font-bold shadow-sm backdrop-blur"
                    style={{ color: "#1a1a1a" }}
                  >
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-black/10"
                      style={{ backgroundColor: color.hex }}
                    />
                    {color.name}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {p.brand}
                  </p>
                  <p className="mt-0.5 line-clamp-2 font-bold leading-snug">{p.title}</p>
                  <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Sparkles className="h-3 w-3 text-primary" />
                    Professioneel op kleur gemengd
                  </p>
                  <div className="mt-3 flex items-end justify-between">
                    <span className="text-sm text-muted-foreground">
                      vanaf{" "}
                      <span className="text-base font-black text-foreground">
                        {formatPrice(fromPrice(p, color))}
                      </span>
                    </span>
                  </div>
                  <Button asChild className="mt-3 w-full">
                    <Link
                      href={`/product/${p.slug}?kleur=${encodeURIComponent(color.code)}`}
                      onClick={() =>
                        trackEvent("select_item", { item_id: p.id, source: "kleurenkiezer" })
                      }
                    >
                      Kies deze verf
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setStep(2)}
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Andere klus kiezen
          </button>
        </section>
      )}
    </div>
  );
}
