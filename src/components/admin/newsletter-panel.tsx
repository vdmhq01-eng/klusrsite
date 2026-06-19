"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Mail,
  Sparkles,
  Loader2,
  Send,
  Eye,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice, cn } from "@/lib/utils";

/** Compacte productvorm zoals de generate-route die teruggeeft. */
interface NewsletterProduct {
  id: string;
  title: string;
  brand: string;
  slug: string;
  image: string;
  price: number;
  kluspasPrice: number;
  compareAtPrice: number | null;
}

interface GenerateResult {
  subject: string;
  preheader: string;
  intro: string;
  products: NewsletterProduct[];
  source: "ai" | "mock";
}

type SendState =
  | { kind: "idle" }
  | { kind: "demo"; message: string }
  | { kind: "error"; message: string }
  | { kind: "success"; message: string };

export function NewsletterPanel() {
  const [generating, setGenerating] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [source, setSource] = useState<"ai" | "mock" | null>(null);

  // Bewerkbare velden.
  const [subject, setSubject] = useState("");
  const [preheader, setPreheader] = useState("");
  const [intro, setIntro] = useState("");
  const [theme, setTheme] = useState("");

  // Producten + selectie (ingesloten ids).
  const [products, setProducts] = useState<NewsletterProduct[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Preview.
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);

  // Versturen.
  const [testEmail, setTestEmail] = useState("");
  const [sendingTest, setSendingTest] = useState(false);
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [scheduleLater, setScheduleLater] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [sendState, setSendState] = useState<SendState>({ kind: "idle" });

  const selectedIds = useMemo(
    () => products.filter((p) => selected.has(p.id)).map((p) => p.id),
    [products, selected],
  );

  const canSend = subject.trim().length > 0 && selectedIds.length > 0;

  // --- Genereren ------------------------------------------------------------
  async function generate() {
    setGenerating(true);
    setSendState({ kind: "idle" });
    try {
      const res = await fetch("/api/admin/newsletter/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: theme.trim() || undefined }),
      });
      const data = (await res.json()) as GenerateResult & { error?: string };
      if (!res.ok) throw new Error(data?.error ?? "Genereren mislukt");

      setSubject(data.subject);
      setPreheader(data.preheader);
      setIntro(data.intro);
      setProducts(data.products);
      setSelected(new Set(data.products.map((p) => p.id))); // standaard allemaal aan
      setSource(data.source);
      setHasDraft(true);
      toast.success("Concept gegenereerd", {
        description:
          data.source === "ai"
            ? "Tekst door AI opgesteld — controleer en pas aan waar nodig."
            : "Demo-tekst (AI niet geconfigureerd) — pas aan waar nodig.",
      });
    } catch (err) {
      toast.error("Genereren mislukt", {
        description: err instanceof Error ? err.message : "Onbekende fout",
      });
    } finally {
      setGenerating(false);
    }
  }

  // --- Preview --------------------------------------------------------------
  const refreshPreview = useCallback(async () => {
    if (!hasDraft) return;
    setPreviewLoading(true);
    try {
      const res = await fetch("/api/admin/newsletter/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, preheader, intro, productIds: selectedIds }),
      });
      const data = (await res.json()) as { html?: string };
      if (data.html) setPreviewHtml(data.html);
    } catch {
      /* preview is best-effort */
    } finally {
      setPreviewLoading(false);
    }
  }, [hasDraft, subject, preheader, intro, selectedIds]);

  // Debounced auto-preview wanneer tekst/selectie wijzigt.
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!hasDraft) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void refreshPreview();
    }, 600);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [hasDraft, refreshPreview]);

  function toggleProduct(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // --- Testmail -------------------------------------------------------------
  async function sendTest() {
    setSendingTest(true);
    setSendState({ kind: "idle" });
    try {
      const res = await fetch("/api/admin/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          preheader,
          intro,
          productIds: selectedIds,
          mode: "test",
          testEmail: testEmail.trim() || undefined,
        }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        demo?: boolean;
        to?: string;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        if (data.demo) {
          setSendState({
            kind: "demo",
            message:
              "Resend niet geconfigureerd — in demomodus wordt niets echt verstuurd.",
          });
        } else {
          throw new Error(data.error ?? "Versturen mislukt");
        }
      } else if (data.demo) {
        setSendState({
          kind: "demo",
          message:
            "Resend niet geconfigureerd — in demomodus wordt niets echt verstuurd.",
        });
      } else {
        setSendState({
          kind: "success",
          message: `Testmail verstuurd naar ${data.to ?? "je inbox"}.`,
        });
        toast.success("Testmail verstuurd");
      }
    } catch (err) {
      setSendState({
        kind: "error",
        message: err instanceof Error ? err.message : "Versturen mislukt",
      });
    } finally {
      setSendingTest(false);
    }
  }

  // --- Broadcast (na bevestiging) -------------------------------------------
  async function sendBroadcast() {
    setSendingBroadcast(true);
    setSendState({ kind: "idle" });
    try {
      const res = await fetch("/api/admin/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          preheader,
          intro,
          productIds: selectedIds,
          mode: "broadcast",
          scheduledAt: scheduleLater && scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
        }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        demo?: boolean;
        recipients?: number | null;
        scheduled?: boolean;
        error?: string;
      };

      if (data.demo) {
        setSendState({
          kind: "demo",
          message:
            "Resend niet geconfigureerd — in demomodus wordt niets echt verstuurd.",
        });
      } else if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "Versturen mislukt");
      } else {
        const count =
          typeof data.recipients === "number" ? `± ${data.recipients}` : "alle";
        const msg = data.scheduled
          ? `Nieuwsbrief ingepland voor ${count} inschrijvers.`
          : `Nieuwsbrief verstuurd naar ${count} inschrijvers.`;
        setSendState({ kind: "success", message: msg });
        toast.success(data.scheduled ? "Nieuwsbrief ingepland" : "Nieuwsbrief verstuurd");
      }
    } catch (err) {
      setSendState({
        kind: "error",
        message: err instanceof Error ? err.message : "Versturen mislukt",
      });
    } finally {
      setSendingBroadcast(false);
      setConfirmOpen(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Intro + governance */}
      <div className="flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
        <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div className="text-sm">
          <p className="font-bold text-foreground">Nieuwsbrief naar inschrijvers</p>
          <p className="mt-0.5 text-muted-foreground">
            Genereer een promotionele nieuwsbrief met je deals, controleer en pas aan, en
            verstuur via Resend naar de audience &quot;KLUSR Nieuwsbrief&quot;. AI stelt
            alleen tekst voor — prijzen komen uit de catalogus, nooit uit de AI.
          </p>
        </div>
      </div>

      {/* Stap 1: genereren */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" /> 1. Genereer nieuwsbrief
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <Label htmlFor="nb-theme">Thema of aanleiding (optioneel)</Label>
              <Input
                id="nb-theme"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="Bijv. Voorjaarsacties, Black Friday…"
                className="mt-1"
              />
            </div>
            <Button onClick={generate} disabled={generating} variant="dark">
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Bezig…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Genereer nieuwsbrief
                </>
              )}
            </Button>
          </div>
          {source && (
            <Badge variant={source === "ai" ? "default" : "muted"}>
              {source === "ai" ? "AI-tekst" : "Demo-tekst (geen ANTHROPIC_API_KEY)"}
            </Badge>
          )}
        </CardContent>
      </Card>

      {hasDraft && (
        <>
          {/* Stap 2: bewerken + producten */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">2. Tekst &amp; producten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="nb-subject">Onderwerp</Label>
                <Input
                  id="nb-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="mt-1"
                  maxLength={120}
                />
              </div>
              <div>
                <Label htmlFor="nb-preheader">Preheader (preview-tekst)</Label>
                <Input
                  id="nb-preheader"
                  value={preheader}
                  onChange={(e) => setPreheader(e.target.value)}
                  className="mt-1"
                  maxLength={140}
                />
              </div>
              <div>
                <Label htmlFor="nb-intro">Intro</Label>
                <textarea
                  id="nb-intro"
                  value={intro}
                  onChange={(e) => setIntro(e.target.value)}
                  rows={5}
                  className="mt-1 flex w-full rounded-md border border-input bg-card px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                  placeholder="Warme intro… (lege regel = nieuwe alinea)"
                />
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold">
                  Uitgelichte producten{" "}
                  <span className="font-normal text-muted-foreground">
                    ({selectedIds.length} van {products.length} geselecteerd)
                  </span>
                </p>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {products.map((p) => {
                    const on = selected.has(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => toggleProduct(p.id)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg border p-2 text-left transition-colors",
                          on
                            ? "border-primary bg-primary/5"
                            : "border-border opacity-60 hover:opacity-100",
                        )}
                      >
                        {p.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.image}
                            alt=""
                            className="h-12 w-12 shrink-0 rounded-md border border-border object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 shrink-0 rounded-md border border-border bg-secondary" />
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-bold uppercase tracking-wide text-muted-foreground">
                            {p.brand}
                          </span>
                          <span className="block truncate text-sm font-semibold">{p.title}</span>
                          <span className="block text-sm font-bold text-primary">
                            {formatPrice(p.kluspasPrice || p.price)}
                          </span>
                        </span>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold",
                            on ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground",
                          )}
                        >
                          {on ? "Aan" : "Uit"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stap 3: preview */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2 text-base">
                <Eye className="h-4 w-4 text-primary" /> 3. Voorbeeld
              </CardTitle>
              <Button size="sm" variant="outline" onClick={() => void refreshPreview()} disabled={previewLoading}>
                {previewLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Ververs preview
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center rounded-lg border border-border bg-secondary/40 p-3">
                {previewHtml ? (
                  <iframe
                    title="Nieuwsbrief-voorbeeld"
                    srcDoc={previewHtml}
                    className="h-[640px] w-full max-w-[420px] rounded-md border border-border bg-white"
                  />
                ) : (
                  <p className="py-12 text-sm text-muted-foreground">Voorbeeld laden…</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stap 4: versturen */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Send className="h-4 w-4 text-primary" /> 4. Versturen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Test */}
              <div className="rounded-lg border border-border p-3">
                <p className="text-sm font-semibold">Stuur eerst een test naar jezelf</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
                  <div>
                    <Label htmlFor="nb-testemail">Testadres (leeg = jouw eigen e-mail)</Label>
                    <Input
                      id="nb-testemail"
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="jij@voorbeeld.nl"
                      className="mt-1"
                    />
                  </div>
                  <Button onClick={sendTest} disabled={sendingTest || !canSend} variant="outline">
                    {sendingTest ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                    Stuur test naar mij
                  </Button>
                </div>
              </div>

              {/* Broadcast */}
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Users className="h-4 w-4 text-primary" /> Verstuur naar alle inschrijvers
                </p>

                <label className="mt-2 flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={scheduleLater}
                    onChange={(e) => setScheduleLater(e.target.checked)}
                    className="h-4 w-4 rounded border-input"
                  />
                  <Clock className="h-4 w-4 text-muted-foreground" /> Plan voor later
                </label>
                {scheduleLater && (
                  <Input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="mt-2 max-w-xs"
                  />
                )}

                {!confirmOpen ? (
                  <Button
                    onClick={() => setConfirmOpen(true)}
                    disabled={!canSend || (scheduleLater && !scheduledAt)}
                    className="mt-3"
                  >
                    <Send className="h-4 w-4" /> Verstuur naar inschrijvers
                  </Button>
                ) : (
                  <div className="mt-3 rounded-lg border border-destructive/40 bg-destructive/5 p-3">
                    <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <AlertTriangle className="h-4 w-4 text-destructive" /> Weet je het zeker?
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Dit verstuurt de nieuwsbrief {scheduleLater && scheduledAt ? "(ingepland) " : ""}
                      naar de volledige &quot;KLUSR Nieuwsbrief&quot;-audience. Verstuur eerst een
                      test als je dat nog niet deed.
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Button onClick={sendBroadcast} disabled={sendingBroadcast} variant="destructive">
                        {sendingBroadcast ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        Ja, verstuur nu
                      </Button>
                      <Button
                        onClick={() => setConfirmOpen(false)}
                        disabled={sendingBroadcast}
                        variant="outline"
                      >
                        Annuleren
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Statusmelding */}
              {sendState.kind !== "idle" && (
                <div
                  className={cn(
                    "flex items-start gap-2 rounded-lg border p-3 text-sm",
                    sendState.kind === "success" && "border-klusr-stock/40 bg-klusr-stock/5 text-foreground",
                    sendState.kind === "demo" && "border-amber-300 bg-amber-50 text-amber-900",
                    sendState.kind === "error" && "border-destructive/40 bg-destructive/5 text-destructive",
                  )}
                >
                  {sendState.kind === "success" ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-klusr-stock" />
                  ) : (
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  )}
                  <span>{sendState.message}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
