"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Image as ImageIcon, Loader2, Sparkles, KeyRound, AlertTriangle, Check } from "lucide-react";
import { categories } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Admin-kaart "Hero-afbeeldingen": genereer per categorie (of in één keer voor
 * alles) een brand-fitting sfeerbeeld via fal.ai en bewaar de URL in KV. Toont
 * de huidige afbeelding als thumbnail + per-categorie fouten/status.
 *
 * Degradeert netjes: zonder FAL_API_KEY toont 'ie een hint en blijven de knoppen
 * uitgeschakeld; de categoriepagina valt dan terug op de bestaande gradient.
 */

interface HeroResult {
  slug: string;
  ok: boolean;
  url?: string;
  message?: string;
}

interface HeroResponse {
  ok: boolean;
  results?: HeroResult[];
  message?: string;
}

/** Hoofdcategorieën waarvoor we hero's beheren ("acties" heeft een eigen blok). */
const HERO_CATEGORIES = categories
  .filter((c) => c.slug !== "acties")
  .map((c) => ({ slug: c.slug, title: c.title }));

export function HeroImages() {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [images, setImages] = useState<Record<string, string>>({});
  // Per-slug status; "all" is gereserveerd voor de "Genereer alle"-knop.
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/hero", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { configured?: boolean; images?: Record<string, string> };
      setConfigured(Boolean(data.configured));
      setImages(data.images ?? {});
    } catch {
      /* stil: niet de admin breken */
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const anyBusy = useMemo(() => Object.values(busy).some(Boolean), [busy]);

  /** Verstuur een generate-opdracht; `slug` weglaten = alles. */
  async function generate(slug?: string) {
    const busyKey = slug ?? "all";
    setBusy((p) => ({ ...p, [busyKey]: true }));
    // Wis eerdere fout(en) voor de betrokken categorie(ën).
    setErrors((p) => {
      const next = { ...p };
      if (slug) delete next[slug];
      else for (const c of HERO_CATEGORIES) delete next[c.slug];
      return next;
    });

    try {
      const res = await fetch("/api/admin/hero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(slug ? { slug } : {}),
      });
      const data = (await res.json()) as HeroResponse;

      if (data.message && (!data.results || data.results.length === 0)) {
        // Globale melding (bijv. niet geconfigureerd).
        const failMsg = data.message;
        setErrors((p) => {
          const next = { ...p };
          for (const c of slug ? [{ slug }] : HERO_CATEGORIES) next[c.slug] = failMsg;
          return next;
        });
      } else {
        for (const r of data.results ?? []) {
          if (!r.ok) {
            setErrors((p) => ({ ...p, [r.slug]: r.message ?? "Genereren mislukt." }));
          }
        }
      }
    } catch {
      const failMsg = "Kon de hero-generator niet bereiken.";
      setErrors((p) => {
        const next = { ...p };
        for (const c of slug ? [{ slug }] : HERO_CATEGORIES) next[c.slug] = failMsg;
        return next;
      });
    } finally {
      setBusy((p) => ({ ...p, [busyKey]: false }));
      // Ververs de opgeslagen URL's na afloop.
      await refresh();
    }
  }

  const allBusy = !!busy["all"];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ImageIcon className="h-4 w-4 text-primary" />
          Hero-afbeeldingen
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Genereer per categorie een brand-fitting sfeerbeeld (fal.ai) voor de hero-band op de
          categoriepagina. De afbeelding verschijnt achter de donkere gradient, zodat de witte
          tekst leesbaar blijft.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Status fal-configuratie */}
        {configured === false && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            <KeyRound className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              fal.ai is nog niet geconfigureerd. Zet <code className="font-mono">FAL_API_KEY</code> in
              de omgeving (Vercel). Zolang dat ontbreekt valt de hero terug op de bestaande gradient.
            </p>
          </div>
        )}

        {/* Hoofdacties */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => generate()}
            disabled={configured === false || anyBusy}
            variant="dark"
          >
            {allBusy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Bezig met alle…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Genereer alle
              </>
            )}
          </Button>
          <span className="text-xs text-muted-foreground">
            Genereert elke hoofdcategorie opnieuw (kan even duren).
          </span>
        </div>

        {/* Per-categorie rijen */}
        <ul className="grid gap-3 sm:grid-cols-2">
          {HERO_CATEGORIES.map((cat) => {
            const url = images[cat.slug];
            const isBusy = !!busy[cat.slug] || allBusy;
            const error = errors[cat.slug];
            return (
              <li
                key={cat.slug}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
              >
                {/* Thumbnail van de huidige hero, of een placeholder. */}
                <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-md bg-secondary">
                  {url ? (
                    // Plain <img>: vermijdt remote-domain config voor de fal CDN.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={url} alt={cat.title} className="h-full w-full object-cover" />
                  ) : (
                    <span className="grid h-full w-full place-items-center text-muted-foreground">
                      <ImageIcon className="h-5 w-5" />
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-semibold">{cat.title}</p>
                    {url && !error && <Check className="h-3.5 w-3.5 shrink-0 text-klusr-stock" />}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {url ? "Afbeelding ingesteld" : "Nog geen afbeelding"}
                  </p>
                  {error && (
                    <p className="mt-1 flex items-start gap-1 text-xs text-destructive">
                      <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                      <span className="break-words">{error}</span>
                    </p>
                  )}
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0"
                  disabled={configured === false || isBusy}
                  onClick={() => generate(cat.slug)}
                >
                  {isBusy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  Genereer
                </Button>
              </li>
            );
          })}
        </ul>

        <p className="text-xs text-muted-foreground">
          De afbeeldingen worden gecachet in KV. Verlopen fal.media-URL&apos;s? Genereer ze hier
          opnieuw. Zet KV aan voor persistentie over deploys.
        </p>
      </CardContent>
    </Card>
  );
}
