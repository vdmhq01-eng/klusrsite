"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Sparkles,
  Loader2,
  Check,
  X,
  FileText,
  ListChecks,
  HelpCircle,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import type { AiContentStatus, Product } from "@/types";
import { products } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type ContentType = "description" | "specifications" | "faqs" | "seo";

const CONTENT_META: Record<
  ContentType,
  { label: string; short: string; icon: typeof FileText }
> = {
  description: { label: "Genereer beschrijving", short: "Beschrijving", icon: FileText },
  specifications: { label: "Genereer specs", short: "Specs", icon: ListChecks },
  faqs: { label: "Genereer FAQ", short: "FAQ", icon: HelpCircle },
  seo: { label: "Genereer SEO", short: "SEO", icon: Search },
};

const ALL_TYPES: ContentType[] = ["description", "specifications", "faqs", "seo"];

/** A field "needs attention" when it is missing or only suggested. */
function needsAttention(status?: AiContentStatus): boolean {
  return status === "missing" || status === "suggested";
}

function missingTypes(product: Product): ContentType[] {
  const flags = product.contentFlags ?? {};
  return ALL_TYPES.filter((t) => needsAttention(flags[t]));
}

/** Products that need attention: overall status missing OR any flag missing/suggested. */
function attentionProducts(): Product[] {
  return products.filter(
    (p) => p.aiGeneratedContentStatus === "missing" || missingTypes(p).length > 0,
  );
}

type SuggestionState = {
  loading: boolean;
  content?: string;
  source?: "ai" | "mock";
  status: "idle" | "generated" | "approved" | "rejected";
  error?: string;
};

type SuggestionMap = Record<string, SuggestionState>; // key: `${productId}:${type}`

function keyFor(productId: string, type: ContentType) {
  return `${productId}:${type}`;
}

const STATUS_BADGE: Record<
  AiContentStatus,
  { label: string; variant: "stock" | "muted" | "outline" | "action" }
> = {
  complete: { label: "Compleet", variant: "stock" },
  approved: { label: "Goedgekeurd", variant: "stock" },
  suggested: { label: "Voorgesteld", variant: "action" },
  missing: { label: "Ontbreekt", variant: "outline" },
};

export function AiContentManager() {
  const items = useMemo(attentionProducts, []);
  const [suggestions, setSuggestions] = useState<SuggestionMap>({});
  const [bulk, setBulk] = useState<{ running: boolean; done: number; total: number }>({
    running: false,
    done: 0,
    total: 0,
  });

  async function generate(product: Product, type: ContentType): Promise<SuggestionState> {
    const k = keyFor(product.id, type);
    setSuggestions((prev) => ({
      ...prev,
      [k]: { ...prev[k], loading: true, status: prev[k]?.status ?? "idle", error: undefined },
    }));

    try {
      const res = await fetch("/api/ai/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          type,
          title: product.title,
          brand: product.brand,
          category: product.category,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Genereren mislukt");

      const next: SuggestionState = {
        loading: false,
        content: data.content as string,
        source: data.source as "ai" | "mock",
        status: "generated",
      };
      setSuggestions((prev) => ({ ...prev, [k]: next }));
      return next;
    } catch (err) {
      const next: SuggestionState = {
        loading: false,
        status: "idle",
        error: err instanceof Error ? err.message : "Genereren mislukt",
      };
      setSuggestions((prev) => ({ ...prev, [k]: next }));
      toast.error("Genereren mislukt", {
        description: `${product.brand} ${product.title} — ${CONTENT_META[type].short}`,
      });
      return next;
    }
  }

  function approve(product: Product, type: ContentType) {
    const k = keyFor(product.id, type);
    setSuggestions((prev) => ({ ...prev, [k]: { ...prev[k], status: "approved" } }));
    toast.success("Suggestie goedgekeurd", {
      description: `${CONTENT_META[type].short} voor ${product.title} is gemarkeerd als goedgekeurd. (Demo — niet gepubliceerd)`,
    });
  }

  function reject(product: Product, type: ContentType) {
    const k = keyFor(product.id, type);
    setSuggestions((prev) => ({ ...prev, [k]: { ...prev[k], status: "rejected" } }));
    toast("Suggestie afgewezen", {
      description: `${CONTENT_META[type].short} voor ${product.title} is afgewezen.`,
    });
  }

  async function bulkGenerateDescriptions() {
    const targets = items.filter((p) => missingTypes(p).includes("description"));
    if (targets.length === 0) {
      toast("Niets te genereren", {
        description: "Er ontbreken geen productbeschrijvingen.",
      });
      return;
    }
    setBulk({ running: true, done: 0, total: targets.length });
    for (let i = 0; i < targets.length; i++) {
      await generate(targets[i], "description");
      setBulk((prev) => ({ ...prev, done: i + 1 }));
    }
    setBulk((prev) => ({ ...prev, running: false }));
    toast.success("Bulk genereren voltooid", {
      description: `${targets.length} beschrijving(en) gegenereerd. Beoordeel ze hieronder.`,
    });
  }

  const seoTargets = items.filter((p) => missingTypes(p).includes("seo"));
  const faqTargets = items.filter((p) => missingTypes(p).includes("faqs"));

  return (
    <div className="flex flex-col gap-6">
      {/* Governance warning */}
      <div className="flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div className="text-sm">
          <p className="font-bold text-foreground">AI doet alleen suggesties</p>
          <p className="mt-0.5 text-muted-foreground">
            Gevoelige velden zoals prijs, voorraad en betaalinformatie worden
            nooit automatisch aangepast. Elke suggestie moet door een mens worden
            goedgekeurd voordat deze gepubliceerd zou worden.
          </p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Producten met aandacht" value={items.length} />
        <StatCard
          label="Ontbrekende beschrijvingen"
          value={items.filter((p) => missingTypes(p).includes("description")).length}
        />
        <StatCard label="Ontbrekende SEO" value={seoTargets.length} />
        <StatCard label="Ontbrekende FAQ" value={faqTargets.length} />
      </div>

      <Tabs defaultValue="ontbrekend">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="ontbrekend">Ontbrekende content</TabsTrigger>
          <TabsTrigger value="seo">SEO genereren</TabsTrigger>
          <TabsTrigger value="faq">FAQ genereren</TabsTrigger>
        </TabsList>

        {/* Ontbrekende content */}
        <TabsContent value="ontbrekend" className="mt-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {items.length} producten met ontbrekende of voorgestelde content.
            </p>
            <Button
              onClick={bulkGenerateDescriptions}
              disabled={bulk.running}
              variant="dark"
            >
              {bulk.running ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Bezig… {bulk.done}/{bulk.total}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Bulk genereren (beschrijvingen)
                </>
              )}
            </Button>
          </div>

          {bulk.running && (
            <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${bulk.total ? (bulk.done / bulk.total) * 100 : 0}%` }}
              />
            </div>
          )}

          <div className="flex flex-col gap-4">
            {items.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                types={ALL_TYPES}
                suggestions={suggestions}
                onGenerate={generate}
                onApprove={approve}
                onReject={reject}
              />
            ))}
            {items.length === 0 && <EmptyState />}
          </div>
        </TabsContent>

        {/* SEO */}
        <TabsContent value="seo" className="mt-5">
          <p className="mb-4 text-sm text-muted-foreground">
            Genereer meta titel, meta beschrijving en SEO-tekst voor producten
            zonder SEO-content.
          </p>
          <div className="flex flex-col gap-4">
            {seoTargets.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                types={["seo"]}
                suggestions={suggestions}
                onGenerate={generate}
                onApprove={approve}
                onReject={reject}
              />
            ))}
            {seoTargets.length === 0 && <EmptyState label="Alle producten hebben SEO-content." />}
          </div>
        </TabsContent>

        {/* FAQ */}
        <TabsContent value="faq" className="mt-5">
          <p className="mb-4 text-sm text-muted-foreground">
            Genereer veelgestelde vragen voor producten zonder FAQ.
          </p>
          <div className="flex flex-col gap-4">
            {faqTargets.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                types={["faqs"]}
                suggestions={suggestions}
                onGenerate={generate}
                onApprove={approve}
                onReject={reject}
              />
            ))}
            {faqTargets.length === 0 && <EmptyState label="Alle producten hebben FAQ-content." />}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-2xl font-black tabular-nums">{value}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

function EmptyState({ label = "Geen producten die aandacht nodig hebben." }: { label?: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-2 p-8 text-center">
        <Check className="h-8 w-8 text-klusr-stock" />
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

interface ProductRowProps {
  product: Product;
  types: ContentType[];
  suggestions: SuggestionMap;
  onGenerate: (product: Product, type: ContentType) => Promise<SuggestionState>;
  onApprove: (product: Product, type: ContentType) => void;
  onReject: (product: Product, type: ContentType) => void;
}

function ProductRow({
  product,
  types,
  suggestions,
  onGenerate,
  onApprove,
  onReject,
}: ProductRowProps) {
  const flags = product.contentFlags ?? {};

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="text-base">{product.title}</CardTitle>
          <p className="mt-0.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            {product.brand} · {product.category}
          </p>
        </div>
        {/* Status badges per content field */}
        <div className="flex flex-wrap gap-1.5">
          {ALL_TYPES.map((t) => {
            const status = flags[t] ?? "missing";
            const meta = STATUS_BADGE[status];
            return (
              <Badge key={t} variant={meta.variant} className="gap-1">
                {CONTENT_META[t].short}: {meta.label}
              </Badge>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {/* Generate buttons */}
        <div className="flex flex-wrap gap-2">
          {types.map((type) => {
            const k = keyFor(product.id, type);
            const state = suggestions[k];
            const Icon = CONTENT_META[type].icon;
            return (
              <Button
                key={type}
                size="sm"
                variant="outline"
                disabled={state?.loading}
                onClick={() => onGenerate(product, type)}
              >
                {state?.loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
                {CONTENT_META[type].label}
              </Button>
            );
          })}
        </div>

        {/* Suggestion panels */}
        {types.map((type) => {
          const k = keyFor(product.id, type);
          const state = suggestions[k];
          if (!state || (!state.content && !state.error)) return null;
          return (
            <SuggestionPanel
              key={type}
              type={type}
              state={state}
              onApprove={() => onApprove(product, type)}
              onReject={() => onReject(product, type)}
            />
          );
        })}
      </CardContent>
    </Card>
  );
}

function SuggestionPanel({
  type,
  state,
  onApprove,
  onReject,
}: {
  type: ContentType;
  state: SuggestionState;
  onApprove: () => void;
  onReject: () => void;
}) {
  if (state.error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
        {state.error}
      </div>
    );
  }

  const decided = state.status === "approved" || state.status === "rejected";

  return (
    <div
      className={cn(
        "rounded-lg border bg-secondary/30 p-3",
        state.status === "approved" && "border-klusr-stock/40 bg-klusr-stock/5",
        state.status === "rejected" && "border-border opacity-60",
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Suggestie · {CONTENT_META[type].short}
          </span>
          {state.source && (
            <Badge variant={state.source === "ai" ? "default" : "muted"}>
              {state.source === "ai" ? "AI" : "Demo-tekst"}
            </Badge>
          )}
          {state.status === "approved" && <Badge variant="stock">Goedgekeurd</Badge>}
          {state.status === "rejected" && <Badge variant="outline">Afgewezen</Badge>}
        </div>
      </div>

      <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
        {state.content}
      </p>

      {!decided && (
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={onApprove}>
            <Check className="h-4 w-4" />
            Goedkeuren
          </Button>
          <Button size="sm" variant="outline" onClick={onReject}>
            <X className="h-4 w-4" />
            Afwijzen
          </Button>
        </div>
      )}
    </div>
  );
}
