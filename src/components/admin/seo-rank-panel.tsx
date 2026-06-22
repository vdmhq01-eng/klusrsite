"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Loader2, ExternalLink, AlertTriangle, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface KeywordRank {
  keyword: string;
  position: number | null;
  url?: string;
  title?: string;
  source: "serpapi" | "mock";
}

function PositionBadge({ position }: { position: number | null }) {
  if (position == null) {
    return (
      <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-bold text-muted-foreground">
        Niet in top 50
      </span>
    );
  }
  const tone =
    position <= 3
      ? "bg-klusr-stock/15 text-klusr-stock"
      : position <= 10
        ? "bg-amber-100 text-amber-800"
        : "bg-secondary text-foreground";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-black tabular-nums",
        tone,
      )}
    >
      #{position}
    </span>
  );
}

export function SeoRankPanel() {
  const [text, setText] = useState("");
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [results, setResults] = useState<KeywordRank[] | null>(null);
  const [loading, setLoading] = useState(false);

  // Standaard-zoekwoorden + of er een live SERP-bron is, bij het openen ophalen.
  useEffect(() => {
    fetch("/api/admin/seo-rank", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { configured?: boolean; keywords?: string[] } | null) => {
        if (!d) return;
        setConfigured(Boolean(d.configured));
        if (d.keywords?.length) setText(d.keywords.join("\n"));
      })
      .catch(() => {});
  }, []);

  const keywords = useMemo(
    () => text.split("\n").map((k) => k.trim()).filter(Boolean),
    [text],
  );

  async function run() {
    if (loading || keywords.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/seo-rank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords }),
      });
      const d = await res.json();
      setConfigured(Boolean(d.configured));
      setResults(Array.isArray(d.results) ? d.results : []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  const isDemo = configured === false;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black tracking-tight">SEO-ranking</h2>
        <p className="text-sm text-muted-foreground">
          Check de Google-positie van klus-r.nl op je relevante zoekwoorden — en welke pagina rankt.
        </p>
      </div>

      {isDemo && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <p>
            <strong>Demo-data.</strong> Voor live posities: zet <code>SERPAPI_KEY</code> in de
            omgeving (SerpApi). Zonder sleutel toon ik deterministische voorbeeldposities.
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Search className="h-4 w-4 text-primary" /> Relevante zoekwoorden
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">Eén zoekwoord per regel (max. 20).</p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            className="w-full rounded-lg border border-border bg-card p-3 text-sm font-mono focus:border-primary focus:outline-none"
            placeholder={"muurverf kopen\nsikkens verf\n…"}
          />
          <Button onClick={run} disabled={loading || keywords.length === 0}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <TrendingUp className="h-4 w-4" />
            )}
            {loading
              ? "Posities ophalen…"
              : `Check ${keywords.length} zoekwoord${keywords.length === 1 ? "" : "en"}`}
          </Button>
        </CardContent>
      </Card>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resultaten</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                    <th className="py-2 pr-2 font-semibold">Zoekwoord</th>
                    <th className="py-2 pr-2 font-semibold">Positie</th>
                    <th className="py-2 font-semibold">Rankende pagina</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.keyword} className="border-b border-border align-top">
                      <td className="py-2.5 pr-2 font-medium">{r.keyword}</td>
                      <td className="py-2.5 pr-2">
                        <PositionBadge position={r.position} />
                      </td>
                      <td className="py-2.5">
                        {r.url ? (
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:underline"
                          >
                            <span className="block max-w-[280px] truncate">
                              {r.url.replace(/^https?:\/\//, "")}
                            </span>
                            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {results.some((r) => r.source === "mock")
                ? "Demo-posities (geen SERPAPI_KEY ingesteld)."
                : "Live via SerpApi · google.nl. Posities kunnen per regio en moment verschillen."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
