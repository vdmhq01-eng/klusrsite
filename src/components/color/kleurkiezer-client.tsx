"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Palette, Sparkles, ArrowRight, Info } from "lucide-react";
import type { Product, SelectedColor } from "@/types";
import { defaultColor, isLightColor } from "@/lib/data/colors";
import { ColorPicker } from "@/components/color/color-picker";
import { ProductGrid } from "@/components/product/product-grid";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trackEvent } from "@/lib/tracking";

interface KleurkiezerClientProps {
  /** Pre-filtered colour-matchable paint products (passed from the server). */
  colorProducts: Product[];
}

export function KleurkiezerClient({ colorProducts }: KleurkiezerClientProps) {
  const [color, setColor] = useState<SelectedColor>(defaultColor);

  // ColorPicker fires `color_selected` itself; we add the page-open event.
  useEffect(() => {
    trackEvent("color_picker_opened", { source: "kleurkiezer_page" });
  }, []);

  const onLight = isLightColor(color.hex);

  return (
    <div className="flex flex-col gap-12 py-6 sm:gap-16 sm:py-8">
      {/* Hero */}
      <section className="container-klusr">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">
          <Palette className="h-3.5 w-3.5" />
          KLEURKIEZER
        </span>
        <h1 className="mt-4 max-w-2xl text-3xl font-black tracking-tight text-balance sm:text-4xl lg:text-5xl">
          Vind jouw perfecte kleur
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Kies uit onze collecties of meng je eigen kleur. Bekijk hoe de kleur op
          je muur staat en bestel verf die wij exact op jouw kleur mengen.
        </p>
      </section>

      {/* Picker + preview */}
      <section className="container-klusr">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Picker */}
          <Card className="p-5 sm:p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
              <Palette className="h-5 w-5 text-primary" />
              Kies een kleur
            </h2>
            <ColorPicker value={color} onSelect={setColor} />
          </Card>

          {/* Room preview */}
          <div className="flex flex-col gap-4">
            <Card className="overflow-hidden">
              {/* Mock wall painted in the chosen colour */}
              <div
                className="relative flex aspect-[4/3] items-end justify-start p-6 transition-colors duration-300"
                style={{ backgroundColor: color.hex }}
              >
                {/* subtle "room" props for context */}
                <div
                  className="pointer-events-none absolute bottom-0 left-0 right-0 h-1/4"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.10), rgba(0,0,0,0))",
                  }}
                />
                <div
                  className="pointer-events-none absolute right-6 top-6 h-16 w-24 rounded-sm border-4 shadow-sm sm:h-24 sm:w-36"
                  style={{
                    borderColor: onLight ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.25)",
                    background: onLight ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.12)",
                  }}
                  aria-hidden
                />
                <div
                  className={
                    "relative rounded-lg px-4 py-3 backdrop-blur " +
                    (onLight ? "bg-black/5 text-klusr-black" : "bg-white/10 text-white")
                  }
                >
                  <p className="text-lg font-black leading-tight">{color.name}</p>
                  <p className="text-sm font-medium opacity-80">
                    {color.code}
                    {color.collection ? ` · ${color.collection}` : ""}
                  </p>
                </div>
              </div>
            </Card>

            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/categorie/verf">
                  <Sparkles className="h-4 w-4" />
                  Shop verf in deze kleur
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/klushulp/muur-verven">
                  Hulp bij muur verven
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="flex items-start gap-2 rounded-xl border border-border bg-secondary/40 p-3 text-sm text-muted-foreground">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              Kleuren op een beeldscherm kunnen licht afwijken van het echte
              resultaat. Vraag in de winkel naar een kleurstaal voor 100%
              zekerheid.
            </div>
          </div>
        </div>
      </section>

      {/* Colour-matchable paint products */}
      <section className="container-klusr">
        <SectionHeading
          title="Verf die wij op jouw kleur mengen"
          subtitle="Wij mengen deze verf exact op de kleur die jij kiest"
        />
        {colorProducts.length > 0 ? (
          <ProductGrid products={colorProducts} listName="Kleurkiezer — mengbare verf" />
        ) : (
          <p className="text-sm text-muted-foreground">
            Er zijn op dit moment geen mengbare verfproducten beschikbaar.
          </p>
        )}
      </section>
    </div>
  );
}
