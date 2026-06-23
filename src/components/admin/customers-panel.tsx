"use client";

import { Fragment, useMemo, useState } from "react";
import {
  Users,
  UserPlus,
  Repeat,
  Crown,
  Briefcase,
  Moon,
  Search,
  Download,
  ChevronDown,
  Mail,
  Phone,
  MapPin,
  Euro,
  TrendingUp,
  Package,
} from "lucide-react";
import type { Order, OrderStatus } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice, formatDate, cn } from "@/lib/utils";

/**
 * Klantenbeheer — Shopify-stijl klantmodule, volledig afgeleid uit de orders
 * (uniek per e-mailadres). Geen extra backend nodig: alles wat de owner nodig
 * heeft (levenslange waarde, segmenten, bestelgeschiedenis, contact) komt uit de
 * orderlijst die het dashboard al ophaalt.
 *
 * Per klant: samengevoegde contactgegevens, # orders, bestede omzet (LTV), gem.
 * orderwaarde, KLUSRPAS-besparing, betaalmethoden, meest gekochte producten en
 * automatische segmenten (Nieuw / Terugkerend / VIP / Zakelijk / Sluimerend).
 */

const PAID: OrderStatus[] = ["paid", "authorized", "shipped", "delivered"];
const isPaidStatus = (s: OrderStatus) => PAID.includes(s);

const STATUS_LABEL: Record<OrderStatus, string> = {
  open: "Open",
  pending: "In behandeling",
  paid: "Betaald",
  authorized: "Geautoriseerd",
  shipped: "Verzonden",
  delivered: "Geleverd",
  canceled: "Geannuleerd",
  failed: "Mislukt",
  expired: "Verlopen",
  refunded: "Terugbetaald",
};

function statusPillClass(status: OrderStatus): string {
  if (status === "shipped" || status === "delivered" || status === "paid" || status === "authorized")
    return "bg-klusr-stock/10 text-klusr-stock";
  if (status === "open" || status === "pending") return "bg-primary/10 text-primary";
  if (status === "refunded") return "bg-amber-100 text-amber-800";
  return "bg-destructive/10 text-destructive";
}

// Drempels voor de automatische klantsegmenten (Shopify-achtig).
const VIP_SPEND = 250; // levenslange besteding (€) → VIP
const NEW_DAYS = 30; // eerste (en enige) bestelling < 30 dagen → Nieuw
const DORMANT_DAYS = 90; // laatste bestelling > 90 dagen → Sluimerend

type Segment = "nieuw" | "terugkerend" | "vip" | "zakelijk" | "sluimerend";

const SEGMENTS: Record<Segment, { label: string; icon: typeof Users; badge: string }> = {
  vip: { label: "VIP", icon: Crown, badge: "bg-amber-100 text-amber-800" },
  terugkerend: { label: "Terugkerend", icon: Repeat, badge: "bg-klusr-stock/10 text-klusr-stock" },
  nieuw: { label: "Nieuw", icon: UserPlus, badge: "bg-blue-100 text-blue-700" },
  zakelijk: { label: "Zakelijk", icon: Briefcase, badge: "bg-primary/10 text-primary" },
  sluimerend: { label: "Sluimerend", icon: Moon, badge: "bg-secondary text-muted-foreground" },
};
// Vaste weergavevolgorde van de badges (belangrijkste eerst).
const SEGMENT_ORDER: Segment[] = ["vip", "terugkerend", "nieuw", "zakelijk", "sluimerend"];

type SortKey = "spent" | "orders" | "recent" | "new" | "name";

interface CustomerOrder {
  id: string;
  reference: string;
  createdAt: string;
  status: OrderStatus;
  total: number;
  itemCount: number;
}

interface Customer {
  email: string;
  name: string;
  phone: string;
  street: string;
  postalCode: string;
  city: string;
  country: string;
  business: boolean;
  company?: string;
  cocNumber?: string;
  vatNumber?: string;
  orders: CustomerOrder[];
  orderCount: number;
  paidCount: number;
  spent: number;
  aov: number;
  itemsBought: number;
  kluspasSavings: number;
  firstOrder: string;
  lastOrder: string;
  paymentMethods: string[];
  topProducts: { title: string; qty: number }[];
  segments: Segment[];
}

function daysAgo(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

function sinceLabel(iso: string): string {
  const d = daysAgo(iso);
  if (d <= 0) return "vandaag";
  if (d === 1) return "gisteren";
  if (d < 30) return `${d} dagen geleden`;
  if (d < 60) return "1 maand geleden";
  if (d < 365) return `${Math.floor(d / 30)} maanden geleden`;
  const y = Math.floor(d / 365);
  return y === 1 ? "1 jaar geleden" : `${y} jaar geleden`;
}

function prettyMethod(id: string): string {
  const map: Record<string, string> = {
    ideal: "iDEAL",
    creditcard: "Creditcard",
    paypal: "PayPal",
    bancontact: "Bancontact",
    klarna: "Klarna",
    applepay: "Apple Pay",
    googlepay: "Google Pay",
    banktransfer: "Overboeking",
    przelewy24: "Przelewy24",
  };
  return map[id] ?? id.charAt(0).toUpperCase() + id.slice(1);
}

function computeSegments(x: {
  orderCount: number;
  paidCount: number;
  spent: number;
  business: boolean;
  firstOrder: string;
  lastOrder: string;
}): Segment[] {
  const segs: Segment[] = [];
  if (x.spent >= VIP_SPEND) segs.push("vip");
  if (x.orderCount >= 2) segs.push("terugkerend");
  if (x.orderCount === 1 && daysAgo(x.firstOrder) <= NEW_DAYS) segs.push("nieuw");
  if (x.business) segs.push("zakelijk");
  if (x.paidCount >= 1 && daysAgo(x.lastOrder) > DORMANT_DAYS) segs.push("sluimerend");
  return segs;
}

function topProductsOf(list: Order[]): { title: string; qty: number }[] {
  const m = new Map<string, { title: string; qty: number }>();
  for (const o of list) {
    for (const it of o.items) {
      const e = m.get(it.title) ?? { title: it.title, qty: 0 };
      e.qty += it.quantity;
      m.set(it.title, e);
    }
  }
  return [...m.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);
}

/** Bouw de klantenlijst op uit de orders (uniek op e-mailadres). */
function buildCustomers(orders: Order[]): Customer[] {
  const byEmail = new Map<string, Order[]>();
  for (const o of orders) {
    const email = o.customer.email?.trim().toLowerCase();
    if (!email) continue;
    const arr = byEmail.get(email);
    if (arr) arr.push(o);
    else byEmail.set(email, [o]);
  }

  const customers: Customer[] = [];
  for (const [email, list] of byEmail) {
    list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)); // nieuwste eerst
    const newest = list[0];
    const oldest = list[list.length - 1];
    const paidOrders = list.filter((o) => isPaidStatus(o.paymentStatus));

    // Levenslange besteding = betaalde orders minus (deel)terugbetalingen.
    const spent = paidOrders.reduce((s, o) => s + o.total - (o.refundedAmount ?? 0), 0);
    const itemsBought = paidOrders.reduce(
      (s, o) => s + o.items.reduce((n, it) => n + it.quantity, 0),
      0,
    );
    const kluspasSavings = list.reduce((s, o) => s + (o.kluspasSavings || 0), 0);

    // Contact: neem de nieuwste order; vul ontbrekende velden aan uit oudere.
    const firstNonEmpty = (get: (o: Order) => string | undefined): string =>
      list.map(get).find((v) => v && v.trim())?.trim() ?? "";
    const c = newest.customer;
    const business = list.some(
      (o) => o.customer.company || o.customer.cocNumber || o.customer.vatNumber,
    );

    customers.push({
      email,
      name:
        `${c.firstName} ${c.lastName}`.trim() ||
        firstNonEmpty((o) => `${o.customer.firstName} ${o.customer.lastName}`.trim()) ||
        email,
      phone: firstNonEmpty((o) => o.customer.phone),
      street: c.street || firstNonEmpty((o) => o.customer.street),
      postalCode: c.postalCode || firstNonEmpty((o) => o.customer.postalCode),
      city: c.city || firstNonEmpty((o) => o.customer.city),
      country: (c.country || firstNonEmpty((o) => o.customer.country) || "NL").toUpperCase(),
      business,
      company: firstNonEmpty((o) => o.customer.company) || undefined,
      cocNumber: firstNonEmpty((o) => o.customer.cocNumber) || undefined,
      vatNumber: firstNonEmpty((o) => o.customer.vatNumber) || undefined,
      orders: list.map((o) => ({
        id: o.id,
        reference: o.reference,
        createdAt: o.createdAt,
        status: o.paymentStatus,
        total: o.total,
        itemCount: o.items.reduce((n, it) => n + it.quantity, 0),
      })),
      orderCount: list.length,
      paidCount: paidOrders.length,
      spent,
      aov: paidOrders.length ? spent / paidOrders.length : 0,
      itemsBought,
      kluspasSavings,
      firstOrder: oldest.createdAt,
      lastOrder: newest.createdAt,
      paymentMethods: [...new Set(list.map((o) => o.paymentMethod).filter(Boolean) as string[])],
      topProducts: topProductsOf(paidOrders.length ? paidOrders : list),
      segments: computeSegments({
        orderCount: list.length,
        paidCount: paidOrders.length,
        spent,
        business,
        firstOrder: oldest.createdAt,
        lastOrder: newest.createdAt,
      }),
    });
  }
  return customers;
}

function exportCsv(customers: Customer[]): void {
  const headers = [
    "Naam",
    "E-mail",
    "Telefoon",
    "Postcode",
    "Plaats",
    "Land",
    "Bedrijf",
    "Orders",
    "Betaalde orders",
    "Besteed (EUR)",
    "Gem. orderwaarde (EUR)",
    "Artikelen",
    "KLUSRPAS-besparing (EUR)",
    "Klant sinds",
    "Laatste bestelling",
    "Segmenten",
  ];
  const rows = customers.map((c) => [
    c.name,
    c.email,
    c.phone,
    c.postalCode,
    c.city,
    c.country,
    c.company ?? "",
    String(c.orderCount),
    String(c.paidCount),
    c.spent.toFixed(2),
    c.aov.toFixed(2),
    String(c.itemsBought),
    c.kluspasSavings.toFixed(2),
    c.firstOrder.slice(0, 10),
    c.lastOrder.slice(0, 10),
    c.segments.map((s) => SEGMENTS[s].label).join(" · "),
  ]);
  const esc = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [headers, ...rows].map((r) => r.map(esc).join(",")).join("\r\n");
  // BOM zodat Excel UTF-8 (€, accenten) correct toont.
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `klanten-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-card">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="h-4 w-4 text-primary" />
        {label}
      </div>
      <div className="mt-2 text-2xl font-black tabular-nums">{value}</div>
      {hint && <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

function SegmentBadges({ segments }: { segments: Segment[] }) {
  const ordered = SEGMENT_ORDER.filter((s) => segments.includes(s));
  if (ordered.length === 0) return null;
  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {ordered.map((s) => {
        const { label, icon: Icon, badge } = SEGMENTS[s];
        return (
          <span
            key={s}
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
              badge,
            )}
          >
            <Icon className="h-3 w-3" />
            {label}
          </span>
        );
      })}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-bold tabular-nums">{value}</p>
    </div>
  );
}

/** Klantenoverzicht, afgeleid uit de orders (uniek per e-mailadres). */
export function CustomersPanel({ orders }: { orders: Order[] }) {
  const customers = useMemo(() => buildCustomers(orders), [orders]);
  const [query, setQuery] = useState("");
  const [segment, setSegment] = useState<Segment | "alle">("alle");
  const [sort, setSort] = useState<SortKey>("spent");
  const [expanded, setExpanded] = useState<string | null>(null);

  const segmentCounts = useMemo(() => {
    const counts: Record<Segment, number> = {
      nieuw: 0,
      terugkerend: 0,
      vip: 0,
      zakelijk: 0,
      sluimerend: 0,
    };
    for (const c of customers) for (const s of c.segments) counts[s]++;
    return counts;
  }, [customers]);

  const summary = useMemo(() => {
    const total = customers.length;
    const paying = customers.filter((c) => c.paidCount > 0);
    const totalRevenue = customers.reduce((s, c) => s + c.spent, 0);
    const nieuw30 = customers.filter((c) => daysAgo(c.firstOrder) <= 30).length;
    const returning = customers.filter((c) => c.orderCount >= 2).length;
    return {
      total,
      totalRevenue,
      nieuw30,
      returning,
      returningPct: total ? Math.round((returning / total) * 100) : 0,
      avgLtv: paying.length ? totalRevenue / paying.length : 0,
    };
  }, [customers]);

  const filtered = useMemo(() => {
    let list = customers;
    if (segment !== "alle") list = list.filter((c) => c.segments.includes(segment));
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.postalCode.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          (c.company ?? "").toLowerCase().includes(q),
      );
    }
    return [...list].sort((a, b) => {
      switch (sort) {
        case "orders":
          return b.orderCount - a.orderCount;
        case "recent":
          return a.lastOrder < b.lastOrder ? 1 : -1;
        case "new":
          return a.firstOrder < b.firstOrder ? 1 : -1;
        case "name":
          return a.name.localeCompare(b.name, "nl");
        default:
          return b.spent - a.spent;
      }
    });
  }, [customers, segment, query, sort]);

  return (
    <div className="space-y-6">
      {/* Samenvatting */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <SummaryCard icon={Users} label="Klanten" value={String(summary.total)} />
        <SummaryCard
          icon={UserPlus}
          label="Nieuw (30 dgn)"
          value={String(summary.nieuw30)}
          hint="eerste bestelling"
        />
        <SummaryCard
          icon={Repeat}
          label="Terugkerend"
          value={String(summary.returning)}
          hint={`${summary.returningPct}% van klanten`}
        />
        <SummaryCard
          icon={TrendingUp}
          label="Gem. klantwaarde"
          value={formatPrice(summary.avgLtv)}
          hint="per betalende klant"
        />
        <SummaryCard icon={Euro} label="Totale klantomzet" value={formatPrice(summary.totalRevenue)} />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base">Klanten</CardTitle>
              <p className="text-sm text-muted-foreground">
                {customers.length} klant(en), afgeleid uit de orders. Klik een klant aan voor de
                volledige bestelgeschiedenis en gegevens.
              </p>
            </div>
            <button
              type="button"
              onClick={() => exportCsv(filtered)}
              disabled={filtered.length === 0}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-4 w-4" /> Exporteer CSV
            </button>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          {/* Zoeken + sorteren */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Zoek op naam, e-mail, plaats, telefoon of bedrijf…"
                className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none"
              aria-label="Sorteren"
            >
              <option value="spent">Meeste besteed</option>
              <option value="orders">Meeste orders</option>
              <option value="recent">Recentste bestelling</option>
              <option value="new">Nieuwste klant</option>
              <option value="name">Naam (A–Z)</option>
            </select>
          </div>

          {/* Segmentfilters */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSegment("alle")}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                segment === "alle"
                  ? "bg-klusr-black text-white"
                  : "bg-secondary text-muted-foreground hover:text-foreground",
              )}
            >
              Alle ({customers.length})
            </button>
            {SEGMENT_ORDER.map((s) => {
              const { label, icon: Icon } = SEGMENTS[s];
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSegment(s)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                    segment === s
                      ? "bg-klusr-black text-white"
                      : "bg-secondary text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label} ({segmentCounts[s]})
                </button>
              );
            })}
          </div>

          {/* Tabel */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                  <th className="py-2 pr-3 font-semibold">Klant</th>
                  <th className="py-2 pr-3 font-semibold">Contact</th>
                  <th className="py-2 pr-3 font-semibold">Locatie</th>
                  <th className="py-2 pr-3 text-right font-semibold">Orders</th>
                  <th className="py-2 pr-3 text-right font-semibold">Besteed</th>
                  <th className="py-2 pr-3 font-semibold">Laatste</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const isOpen = expanded === c.email;
                  return (
                    <Fragment key={c.email}>
                      <tr
                        className={cn(
                          "border-b border-border align-top",
                          isOpen && "bg-secondary/30",
                        )}
                      >
                        <td className="py-3 pr-3">
                          <button
                            type="button"
                            onClick={() => setExpanded(isOpen ? null : c.email)}
                            className="flex items-start gap-1.5 text-left"
                          >
                            <ChevronDown
                              className={cn(
                                "mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                                isOpen && "rotate-180",
                              )}
                            />
                            <span className="font-semibold">{c.name}</span>
                          </button>
                          <SegmentBadges segments={c.segments} />
                        </td>
                        <td className="py-3 pr-3 text-xs text-muted-foreground">
                          <div className="break-all">{c.email}</div>
                          {c.phone && <div>{c.phone}</div>}
                        </td>
                        <td className="py-3 pr-3 text-xs text-muted-foreground">
                          <div>{c.city || "—"}</div>
                          {c.postalCode && <div>{c.postalCode}</div>}
                        </td>
                        <td className="py-3 pr-3 text-right">
                          <div className="font-semibold tabular-nums">{c.orderCount}</div>
                          {c.paidCount !== c.orderCount && (
                            <div className="text-xs text-muted-foreground">{c.paidCount} betaald</div>
                          )}
                        </td>
                        <td className="py-3 pr-3 text-right">
                          <div className="font-semibold tabular-nums">{formatPrice(c.spent)}</div>
                          <div className="text-xs text-muted-foreground">
                            gem. {formatPrice(c.aov)}
                          </div>
                        </td>
                        <td className="py-3 pr-3 text-xs text-muted-foreground">
                          <div>{formatDate(c.lastOrder)}</div>
                          <div>{sinceLabel(c.lastOrder)}</div>
                        </td>
                      </tr>

                      {isOpen && (
                        <tr className="border-b border-border bg-secondary/20">
                          <td colSpan={6} className="px-3 py-4">
                            <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
                              {/* Bestelgeschiedenis */}
                              <div>
                                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                                  Bestelgeschiedenis ({c.orderCount})
                                </p>
                                <ul className="space-y-2">
                                  {c.orders.map((ord) => (
                                    <li
                                      key={ord.id}
                                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card p-2.5 text-xs"
                                    >
                                      <div className="min-w-0">
                                        <span className="font-semibold">{ord.reference}</span>
                                        <span className="ml-2 text-muted-foreground">
                                          {formatDate(ord.createdAt)}
                                        </span>
                                        <span className="block text-muted-foreground">
                                          {ord.itemCount} artikel(en)
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <span
                                          className={cn(
                                            "inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold",
                                            statusPillClass(ord.status),
                                          )}
                                        >
                                          {STATUS_LABEL[ord.status]}
                                        </span>
                                        <span className="font-semibold tabular-nums">
                                          {formatPrice(ord.total)}
                                        </span>
                                        <a
                                          href={`/pakbon/${ord.id}`}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="font-medium text-primary hover:underline"
                                        >
                                          Pakbon
                                        </a>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Profiel + statistieken */}
                              <div className="space-y-3">
                                <div className="rounded-lg border border-border bg-card p-3 text-xs text-muted-foreground">
                                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                                    Contact
                                  </p>
                                  <p className="text-sm font-semibold text-foreground">{c.name}</p>
                                  <p className="mt-1 flex items-center gap-1.5 break-all">
                                    <Mail className="h-3.5 w-3.5 shrink-0" /> {c.email}
                                  </p>
                                  {c.phone && (
                                    <p className="flex items-center gap-1.5">
                                      <Phone className="h-3.5 w-3.5 shrink-0" /> {c.phone}
                                    </p>
                                  )}
                                  <p className="mt-1 flex items-start gap-1.5">
                                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                    <span>
                                      {c.street && (
                                        <>
                                          {c.street}
                                          <br />
                                        </>
                                      )}
                                      {c.postalCode} {c.city}
                                      <br />
                                      {c.country}
                                    </span>
                                  </p>
                                  {c.business && (
                                    <div className="mt-2 border-t border-border pt-2">
                                      <p className="flex items-center gap-1 font-semibold text-primary">
                                        <Briefcase className="h-3.5 w-3.5" /> Zakelijk · ProfPas
                                      </p>
                                      {c.company && <p>{c.company}</p>}
                                      {c.cocNumber && <p>KvK: {c.cocNumber}</p>}
                                      {c.vatNumber && <p>Btw: {c.vatNumber}</p>}
                                    </div>
                                  )}
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  <Stat label="Klant sinds" value={formatDate(c.firstOrder)} />
                                  <Stat label="Laatste" value={sinceLabel(c.lastOrder)} />
                                  <Stat label="Gem. orderwaarde" value={formatPrice(c.aov)} />
                                  <Stat label="Artikelen" value={String(c.itemsBought)} />
                                  <Stat
                                    label="KLUSRPAS bespaard"
                                    value={formatPrice(c.kluspasSavings)}
                                  />
                                  <Stat
                                    label="Betaalwijze"
                                    value={
                                      c.paymentMethods.map(prettyMethod).join(", ") || "—"
                                    }
                                  />
                                </div>

                                {c.topProducts.length > 0 && (
                                  <div className="rounded-lg border border-border bg-card p-3">
                                    <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                                      <Package className="h-3.5 w-3.5" /> Meest gekocht
                                    </p>
                                    <ul className="space-y-1 text-xs">
                                      {c.topProducts.map((p) => (
                                        <li
                                          key={p.title}
                                          className="flex items-center justify-between gap-2"
                                        >
                                          <span className="truncate">{p.title}</span>
                                          <span className="shrink-0 font-semibold">{p.qty}×</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-muted-foreground">
                      <Users className="mx-auto mb-2 h-6 w-6 opacity-50" />
                      {customers.length === 0
                        ? "Nog geen klanten."
                        : "Geen klanten voor deze zoekopdracht of filter."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-muted-foreground">
            Afgeleid uit de (niet-test) orders. Segmenten: <strong>VIP</strong> vanaf{" "}
            {formatPrice(VIP_SPEND)} besteed · <strong>Terugkerend</strong> vanaf 2 orders ·{" "}
            <strong>Nieuw</strong> eerste order &lt; {NEW_DAYS} dagen · <strong>Sluimerend</strong>{" "}
            geen order &gt; {DORMANT_DAYS} dagen. Koppel een database of de Channable/Tilroy-orders
            voor volledige historie.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
