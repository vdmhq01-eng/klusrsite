"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  ShoppingCart,
  XCircle,
  Euro,
  ExternalLink,
  Info,
  CreditCard,
  Clock,
  FlaskConical,
  Mail,
} from "lucide-react";
import type { OrderStatus } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice, cn } from "@/lib/utils";

/* ----------------------------- types (mirror API) ----------------------------- */

interface AbandonedOrderRow {
  id: string;
  reference: string;
  createdAt: string;
  status: OrderStatus;
  isTest?: boolean;
  customerName: string;
  email: string;
  paymentMethod?: string;
  molliePaymentId?: string;
  mollieDashboardUrl?: string;
  items: { title: string; quantity: number }[];
  total: number;
}

interface AbandonedResponse {
  rows: AbandonedOrderRow[];
  counts: Record<OrderStatus, number>;
  total: number;
  lostValue: number;
}

interface AbandonedCartRow {
  email: string;
  name?: string;
  items: { title: string; quantity: number; price: number }[];
  total: number;
  updatedAt: string;
  reminded: boolean;
}

interface AbandonedCartsResponse {
  rows: AbandonedCartRow[];
  total: number;
  value: number;
}

/* --------------------------------- helpers ----------------------------------- */

/** Niet-betaalde statussen die als "afgebroken checkout" gelden. */
const ABANDONED_STATUSES: OrderStatus[] = [
  "open",
  "pending",
  "expired",
  "canceled",
  "failed",
];

const STATUS_LABEL: Record<string, string> = {
  open: "Open",
  pending: "In behandeling",
  expired: "Verlopen",
  canceled: "Geannuleerd",
  failed: "Mislukt",
};

/** Tint per status: open/pending = nog 'warm' (kan nog betalen), rest = koud. */
const STATUS_TONE: Record<string, string> = {
  open: "bg-klusr-action/20 text-klusr-black",
  pending: "bg-klusr-action/20 text-klusr-black",
  expired: "bg-secondary text-muted-foreground",
  canceled: "bg-primary/10 text-primary",
  failed: "bg-primary/10 text-primary",
};

const ALL = "__all__";
type StatusFilter = OrderStatus | typeof ALL;

/** Datum + tijd in NL-notatie (de tabel toont datum én tijdstip). */
function formatDateTime(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("nl-NL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function relativeTime(value: string): string {
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return "";
  const mins = Math.round((Date.now() - then) / 60000);
  if (mins < 1) return "zojuist";
  if (mins < 60) return `${mins} min geleden`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} uur geleden`;
  const days = Math.round(hrs / 24);
  return `${days} dag${days === 1 ? "" : "en"} geleden`;
}

/* --------------------------------- panel ------------------------------------- */

export function AbandonedPanel() {
  const [orders, setOrders] = useState<AbandonedResponse | null>(null);
  const [carts, setCarts] = useState<AbandonedCartsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [status, setStatus] = useState<StatusFilter>(ALL);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setExpanded((e) => ({ ...e, [id]: !e[id] }));

  async function load() {
    setLoading(true);
    setError(false);
    try {
      const [oRes, cRes] = await Promise.all([
        fetch("/api/admin/abandoned", { cache: "no-store" }),
        fetch("/api/admin/abandoned-carts", { cache: "no-store" }),
      ]);
      if (!oRes.ok) throw new Error(String(oRes.status));
      setOrders((await oRes.json()) as AbandonedResponse);
      // De carts-sectie is "nice-to-have": een fout daar mag de hoofdtabel niet breken.
      setCarts(cRes.ok ? ((await cRes.json()) as AbandonedCartsResponse) : { rows: [], total: 0, value: 0 });
    } catch {
      setError(true);
      setOrders(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const rows = orders?.rows ?? [];

  // Aandeel open/pending — sterke aanwijzing dat Mollie in TEST staat of de
  // webhook niet binnenkomt (betalingen blijven dan "hangen" op open/pending).
  const openPending = useMemo(() => {
    const c = orders?.counts;
    if (!c) return { count: 0, pct: 0 };
    const count = (c.open ?? 0) + (c.pending ?? 0);
    const pct = rows.length ? Math.round((count / rows.length) * 100) : 0;
    return { count, pct };
  }, [orders, rows.length]);

  // Zijn er test-orders tussen? Eveneens een signaal dat de winkel niet live staat.
  const hasTestOrders = useMemo(() => rows.some((r) => r.isTest), [rows]);

  const HINT_THRESHOLD = 50; // toon de hint zodra >50% op open/pending blijft hangen

  const filtered = useMemo(
    () => (status === ALL ? rows : rows.filter((r) => r.status === status)),
    [rows, status],
  );

  const filteredValue = useMemo(
    () => filtered.reduce((s, r) => s + r.total, 0),
    [filtered],
  );

  return (
    <div className="space-y-6">
      {/* ============================ Afgebroken checkouts ======================= */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <XCircle className="h-4 w-4 text-primary" /> Afgebroken checkouts
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Bestellingen waarvan de betaling is gestart maar nooit is afgerond. Hier zie je waar
                kopers in de betaalstap afhaken. Alleen-lezen.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              Ververs
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          {/* Samenvatting */}
          <div className="grid gap-3 sm:grid-cols-3">
            <SummaryStat
              icon={XCircle}
              label="Afgebroken"
              value={String(orders?.total ?? 0)}
              tone="red"
              hint={loading ? "laden…" : "niet-betaalde checkouts"}
            />
            <SummaryStat
              icon={Euro}
              label="Blijft liggen"
              value={formatPrice(orders?.lostValue ?? 0)}
              tone="amber"
              hint="totale waarde"
            />
            <SummaryStat
              icon={Clock}
              label="Open / in behandeling"
              value={String(openPending.count)}
              tone="neutral"
              hint={rows.length ? `${openPending.pct}% van het totaal` : "—"}
            />
          </div>

          {/* Open/pending-hint: waarschijnlijk TEST-modus of webhook komt niet binnen. */}
          {!loading && rows.length >= 3 && openPending.pct > HINT_THRESHOLD && (
            <div className="flex items-start gap-3 rounded-lg border border-klusr-action/40 bg-klusr-action/10 p-3 text-sm">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-klusr-black" />
              <div>
                <p className="font-semibold">
                  {openPending.pct}% van de afgebroken checkouts blijft op &ldquo;open/in
                  behandeling&rdquo; hangen.
                </p>
                <p className="mt-0.5 text-muted-foreground">
                  Dat is een sterke aanwijzing dat Mollie nog in <strong>TEST-modus</strong> staat of
                  dat de <strong>webhook niet binnenkomt</strong> — de betaalstatus wordt dan nooit
                  bijgewerkt naar &ldquo;betaald&rdquo;. Controleer je live Mollie-sleutel en de
                  webhook-URL (<code>/api/checkout/webhook</code>).
                </p>
              </div>
            </div>
          )}

          {/* Extra signaal: test-orders aanwezig. */}
          {!loading && hasTestOrders && (
            <div className="flex items-start gap-2 rounded-lg border border-border bg-secondary/40 p-3 text-xs text-muted-foreground">
              <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                Er staan <strong>test-bestellingen</strong> tussen (Mollie test-modus). Echte klanten
                kunnen in test-modus niet betalen — zet de live-sleutel aan om omzet te ontvangen.
              </span>
            </div>
          )}

          {/* Statusfilter */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-full sm:w-56">
              <Select value={status} onValueChange={(v) => setStatus(v as StatusFilter)}>
                <SelectTrigger aria-label="Status">
                  <SelectValue placeholder="Alle statussen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Alle statussen</SelectItem>
                  {ABANDONED_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABEL[s]}
                      {orders ? ` (${orders.counts[s] ?? 0})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {status !== ALL && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>
                  {filtered.length} resultaat{filtered.length === 1 ? "" : "en"} ·{" "}
                  {formatPrice(filteredValue)}
                </span>
                <button
                  onClick={() => setStatus(ALL)}
                  className="font-semibold text-primary hover:underline"
                >
                  Filter wissen
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" /> Kon de afgebroken checkouts niet laden.
              Probeer te verversen.
            </div>
          )}

          {/* Tabel */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                  <th className="py-2 pr-3 font-semibold">Bestelling</th>
                  <th className="py-2 pr-3 font-semibold">Klant</th>
                  <th className="py-2 pr-3 font-semibold">Betaalwijze</th>
                  <th className="py-2 pr-3 font-semibold">Status</th>
                  <th className="py-2 pr-3 text-right font-semibold">Totaal</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => {
                  const isOpen = expanded[o.id];
                  return (
                    <Fragment key={o.id}>
                      <tr
                        className={cn(
                          "border-b border-border align-top",
                          isOpen && "bg-secondary/30",
                        )}
                      >
                        <td className="py-3 pr-3">
                          <button
                            type="button"
                            onClick={() => toggle(o.id)}
                            className="flex items-start gap-1.5 text-left"
                          >
                            <ChevronDown
                              className={cn(
                                "mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                                isOpen && "rotate-180",
                              )}
                            />
                            <span>
                              <span className="flex items-center gap-1.5 font-semibold">
                                {o.reference}
                                {o.isTest && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                                    <FlaskConical className="h-2.5 w-2.5" /> test
                                  </span>
                                )}
                              </span>
                              <span className="block text-xs text-muted-foreground">
                                {formatDateTime(o.createdAt)}
                              </span>
                            </span>
                          </button>
                        </td>
                        <td className="py-3 pr-3">
                          <div>{o.customerName || "—"}</div>
                          <div className="break-all text-xs text-muted-foreground">{o.email}</div>
                        </td>
                        <td className="py-3 pr-3">
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <CreditCard className="h-3.5 w-3.5" />
                            {o.paymentMethod || "—"}
                          </span>
                        </td>
                        <td className="py-3 pr-3">
                          <span
                            className={cn(
                              "inline-block rounded-full px-2 py-0.5 text-xs font-semibold",
                              STATUS_TONE[o.status] ?? "bg-secondary text-muted-foreground",
                            )}
                          >
                            {STATUS_LABEL[o.status] ?? o.status}
                          </span>
                        </td>
                        <td className="py-3 pr-3 text-right font-semibold tabular-nums">
                          {formatPrice(o.total)}
                        </td>
                      </tr>
                      {isOpen && (
                        <tr className="border-b border-border bg-secondary/20">
                          <td colSpan={5} className="px-3 py-4">
                            <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
                              <div>
                                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                                  Producten in de afgebroken bestelling
                                </p>
                                <ul className="space-y-1.5 text-sm">
                                  {o.items.map((it, i) => (
                                    <li
                                      key={i}
                                      className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2"
                                    >
                                      <span className="min-w-0 truncate">{it.title}</span>
                                      <span className="shrink-0 font-semibold tabular-nums">
                                        {it.quantity}×
                                      </span>
                                    </li>
                                  ))}
                                  {o.items.length === 0 && (
                                    <li className="text-xs text-muted-foreground">
                                      Geen orderregels bekend.
                                    </li>
                                  )}
                                </ul>
                              </div>
                              <div>
                                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                                  Betaling
                                </p>
                                <div className="space-y-1.5 rounded-lg border border-border bg-card p-3 text-xs text-muted-foreground">
                                  <p>
                                    Status:{" "}
                                    <span className="font-semibold text-foreground">
                                      {STATUS_LABEL[o.status] ?? o.status}
                                    </span>
                                  </p>
                                  <p>Betaalwijze: {o.paymentMethod || "—"}</p>
                                  {o.molliePaymentId ? (
                                    <>
                                      <p className="break-all">
                                        Mollie-id:{" "}
                                        <span className="font-mono">{o.molliePaymentId}</span>
                                      </p>
                                      {o.mollieDashboardUrl && (
                                        <a
                                          href={o.mollieDashboardUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                                        >
                                          Bekijk in Mollie <ExternalLink className="h-3 w-3" />
                                        </a>
                                      )}
                                    </>
                                  ) : (
                                    <p>
                                      Geen Mollie-betaling gekoppeld (demo-modus of betaling nooit
                                      aangemaakt).
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                      <ShoppingCart className="mx-auto mb-2 h-6 w-6 opacity-50" />
                      {rows.length === 0
                        ? "Geen afgebroken checkouts — alle gestarte betalingen zijn afgerond."
                        : "Geen afgebroken checkouts voor deze status."}
                    </td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                      Afgebroken checkouts laden…
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* =========================== Verlaten winkelwagens ====================== */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShoppingCart className="h-4 w-4 text-primary" /> Verlaten winkelwagens
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Bezoekers die producten in het mandje hadden en op de checkout hun e-mailadres invulden,
            maar (nog) geen betaling startten. Mandjes die later tóch een betaalde order werden, zijn
            eruit gefilterd. Alleen-lezen.
          </p>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <SummaryStat
              icon={ShoppingCart}
              label="Verlaten mandjes"
              value={String(carts?.total ?? 0)}
              tone="amber"
            />
            <SummaryStat
              icon={Euro}
              label="Waarde in de mandjes"
              value={formatPrice(carts?.value ?? 0)}
              tone="neutral"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                  <th className="py-2 pr-3 font-semibold">Klant</th>
                  <th className="py-2 pr-3 font-semibold">Producten</th>
                  <th className="py-2 pr-3 font-semibold">Tijdstip</th>
                  <th className="py-2 pr-3 text-right font-semibold">Totaal</th>
                </tr>
              </thead>
              <tbody>
                {(carts?.rows ?? []).map((c, idx) => (
                  <tr key={`${c.email}-${idx}`} className="border-b border-border align-top">
                    <td className="py-3 pr-3">
                      <div>{c.name || "—"}</div>
                      <div className="break-all text-xs text-muted-foreground">{c.email}</div>
                      {c.reminded && (
                        <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-klusr-stock/10 px-2 py-0.5 text-[10px] font-semibold text-klusr-stock">
                          <Mail className="h-3 w-3" /> herinnering verstuurd
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-3">
                      <ul className="space-y-0.5 text-xs text-muted-foreground">
                        {c.items.slice(0, 5).map((it, i) => (
                          <li key={i}>
                            <span className="font-medium text-foreground">{it.quantity}×</span>{" "}
                            {it.title}
                          </li>
                        ))}
                        {c.items.length > 5 && (
                          <li className="text-muted-foreground">
                            +{c.items.length - 5} meer…
                          </li>
                        )}
                        {c.items.length === 0 && <li>—</li>}
                      </ul>
                    </td>
                    <td className="py-3 pr-3 text-xs text-muted-foreground">
                      <div>{formatDateTime(c.updatedAt)}</div>
                      <div>{relativeTime(c.updatedAt)}</div>
                    </td>
                    <td className="py-3 pr-3 text-right font-semibold tabular-nums">
                      {formatPrice(c.total)}
                    </td>
                  </tr>
                ))}
                {!loading && (carts?.rows.length ?? 0) === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                      <ShoppingCart className="mx-auto mb-2 h-6 w-6 opacity-50" />
                      Nog geen verlaten winkelwagens vastgelegd.
                    </td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                      Verlaten winkelwagens laden…
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-muted-foreground">
            Winkelwagens worden vastgelegd zodra een bezoeker op de checkout een geldig e-mailadres
            invult (fire-and-forget, raakt de betaling niet). Ze verlopen automatisch na 30 dagen.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryStat({
  icon: Icon,
  label,
  value,
  tone,
  hint,
}: {
  icon: typeof ShoppingCart;
  label: string;
  value: string;
  tone: "red" | "amber" | "neutral";
  hint?: string;
}) {
  const toneClasses =
    tone === "red"
      ? "bg-primary/10 text-primary"
      : tone === "amber"
        ? "bg-klusr-action/20 text-klusr-black"
        : "bg-secondary text-muted-foreground";
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-card">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <span className={cn("grid h-6 w-6 place-items-center rounded-md", toneClasses)}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        {label}
      </div>
      <div className="mt-2 text-2xl font-black tabular-nums">{value}</div>
      {hint && <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}
