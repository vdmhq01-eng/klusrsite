"use client";

import { useState } from "react";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FinderFacet {
  key: string;
  title: string;
  values: { id: string; label: string }[];
}
export interface AiSelections {
  attrs: Record<string, string[]>;
  subCategories: string[];
  brands: string[];
}

/**
 * AI-productzoeker bovenaan de productlijst: de klant vertelt in gewone taal
 * wat de klus is, Claude vertaalt dat naar filters en de lijst filtert direct.
 */
export function AiFinder({
  category,
  options,
  examples = [],
  onApply,
  className,
}: {
  category?: string;
  options: { subCategories: string[]; brands: string[]; attrs: FinderFacet[] };
  examples?: string[];
  onApply: (sel: AiSelections, summary: string) => void;
  className?: string;
}) {
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  async function run(query: string) {
    const text = query.trim();
    if (!text || busy) return;
    setBusy(true);
    setSummary(null);
    try {
      const res = await fetch("/api/ai/product-finder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text, category, options }),
      });
      const d = (await res.json()) as { selections?: AiSelections; summary?: string };
      const sel = d.selections ?? { attrs: {}, subCategories: [], brands: [] };
      onApply(sel, d.summary ?? "");
      const n =
        Object.values(sel.attrs).reduce((s, v) => s + v.length, 0) +
        sel.subCategories.length +
        sel.brands.length;
      setSummary(
        d.summary || (n > 0 ? "Filters toegepast op je klus." : "Geen specifiek filter gevonden — verfijn je vraag of gebruik de filters."),
      );
    } catch {
      setSummary("Dat lukte even niet. Probeer het opnieuw of gebruik de filters links.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/40 p-4 sm:p-5",
        className,
      )}
    >
      <p className="flex items-center gap-2 text-sm font-bold sm:text-base">
        <Sparkles className="h-4 w-4 shrink-0 text-primary" />
        Niet zeker wat je nodig hebt?
      </p>
      <p className="mt-0.5 text-sm text-muted-foreground">
        Vertel kort je klus, dan zoeken we meteen de juiste producten voor je.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(q);
        }}
        className="mt-3 flex gap-2"
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Bijv. verf voor mijn houten kozijnen buiten"
          className="min-w-0 flex-1 rounded-full border border-input bg-card px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          aria-label="Beschrijf je klus"
        />
        <button
          type="submit"
          disabled={busy || !q.trim()}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          <span className="hidden sm:inline">Vind producten</span>
          <span className="sm:hidden">Vind</span>
        </button>
      </form>

      {examples.length > 0 && !summary && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {examples.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => {
                setQ(ex);
                run(ex);
              }}
              className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              {ex}
            </button>
          ))}
        </div>
      )}

      {summary && (
        <p className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-klusr-stock/10 px-3 py-1 text-xs font-medium text-klusr-stock">
          <Sparkles className="h-3.5 w-3.5 shrink-0" />
          {summary}
        </p>
      )}
    </div>
  );
}
