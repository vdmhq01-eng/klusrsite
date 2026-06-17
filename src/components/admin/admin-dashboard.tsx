"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  BarChart3,
  Sparkles,
  Send,
  Euro,
  Package,
  TrendingUp,
  Search,
  MessageCircle,
  Eye,
  Radio,
  ShoppingCart,
  ShieldOff,
  Plus,
  Trash2,
} from "lucide-react";
import type { Order, OrderStatus } from "@/types";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrdersPanel } from "./orders-panel";
import { TicketsPanel } from "./tickets-panel";
import { CustomersPanel } from "./customers-panel";
import { AiContentManager } from "./ai-content-manager";
import { ChannableTestOrder } from "./channable-test-order";
import { MollieTest } from "./mollie-test";

type SectionId =
  | "overzicht"
  | "orders"
  | "tickets"
  | "klanten"
  | "rapportages"
  | "inzichten"
  | "content"
  | "channable";

const NAV: { id: SectionId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overzicht", label: "Overzicht", icon: LayoutDashboard },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "tickets", label: "Tickets", icon: MessageCircle },
  { id: "klanten", label: "Klanten", icon: Users },
  { id: "rapportages", label: "Rapportages", icon: BarChart3 },
  { id: "content", label: "AI-content", icon: Sparkles },
  { id: "channable", label: "Koppelingen", icon: Send },
];

const PAID: OrderStatus[] = ["paid", "authorized", "shipped", "delivered"];
const isPaid = (o: Order) => PAID.includes(o.paymentStatus);
const isOpen = (o: Order) =>
  (o.paymentStatus === "paid" || o.paymentStatus === "authorized") && !o.shipment;

export function AdminDashboard() {
  const [section, setSection] = useState<SectionId>("overzicht");
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetch("/api/admin/orders", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setOrders(d.orders ?? []))
      .catch(() => {});
  }, []);

  return (
    <div className="grid gap-6 lg:grid-cols-[210px_1fr]">
      {/* Zijbalk / tabs */}
      <nav className="flex gap-1.5 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setSection(id)}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors lg:w-full",
              section === id
                ? "bg-klusr-black text-white"
                : "text-muted-foreground hover:bg-secondary",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </nav>

      {/* Inhoud */}
      <div className="min-w-0">
        {section === "overzicht" && <Overview orders={orders} onGo={setSection} />}
        {section === "orders" && <OrdersPanel />}
        {section === "tickets" && <TicketsPanel />}
        {section === "klanten" && <CustomersPanel orders={orders} />}
        {(section === "rapportages" || section === "inzichten") && (
          <div className="space-y-8">
            <Insights />
            <Reports orders={orders} />
          </div>
        )}
        {section === "content" && <AiContentManager />}
        {section === "channable" && (
          <div className="space-y-6">
            <MollieTest />
            <ChannableTestOrder />
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Euro;
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
      <div className="mt-2 text-2xl font-black">{value}</div>
      {hint && <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

function Overview({ orders, onGo }: { orders: Order[]; onGo: (s: SectionId) => void }) {
  const stats = useMemo(() => {
    const paid = orders.filter(isPaid);
    const omzet = paid.reduce((s, o) => s + o.total, 0);
    const klanten = new Set(orders.map((o) => o.customer.email.toLowerCase())).size;
    const open = orders.filter(isOpen).length;
    return {
      omzet,
      orders: orders.length,
      klanten,
      open,
      gem: paid.length ? omzet / paid.length : 0,
    };
  }, [orders]);

  const recent = orders.slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Euro} label="Omzet (betaald)" value={formatPrice(stats.omzet)} />
        <StatCard icon={ShoppingBag} label="Orders" value={String(stats.orders)} hint={`${stats.open} openstaand`} />
        <StatCard icon={Users} label="Klanten" value={String(stats.klanten)} />
        <StatCard icon={TrendingUp} label="Gem. orderwaarde" value={formatPrice(stats.gem)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recente orders</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border">
            {recent.map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <div className="min-w-0">
                  <span className="font-semibold">{o.reference}</span>{" "}
                  <span className="text-muted-foreground">
                    · {o.customer.firstName} {o.customer.lastName}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{formatDate(o.createdAt)}</span>
                  <span className="font-semibold">{formatPrice(o.total)}</span>
                </div>
              </li>
            ))}
            {recent.length === 0 && (
              <li className="py-4 text-center text-sm text-muted-foreground">Nog geen orders.</li>
            )}
          </ul>
          <button
            onClick={() => onGo("orders")}
            className="mt-3 text-sm font-semibold text-primary hover:underline"
          >
            Alle orders &amp; verzending →
          </button>
        </CardContent>
      </Card>
    </div>
  );
}

function Reports({ orders }: { orders: Order[] }) {
  const { byStatus, topProducts, maxStatus } = useMemo(() => {
    const byStatus = new Map<OrderStatus, { count: number; omzet: number }>();
    for (const o of orders) {
      const e = byStatus.get(o.paymentStatus) ?? { count: 0, omzet: 0 };
      e.count += 1;
      e.omzet += o.total;
      byStatus.set(o.paymentStatus, e);
    }
    const products = new Map<string, { title: string; qty: number; omzet: number }>();
    for (const o of orders) {
      if (!isPaid(o)) continue;
      for (const i of o.items) {
        const e = products.get(i.title) ?? { title: i.title, qty: 0, omzet: 0 };
        e.qty += i.quantity;
        e.omzet += i.kluspasPrice * i.quantity;
        products.set(i.title, e);
      }
    }
    const topProducts = [...products.values()].sort((a, b) => b.omzet - a.omzet).slice(0, 8);
    const maxStatus = Math.max(1, ...[...byStatus.values()].map((v) => v.omzet));
    return { byStatus: [...byStatus.entries()], topProducts, maxStatus };
  }, [orders]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Omzet per status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {byStatus.length === 0 && <p className="text-sm text-muted-foreground">Nog geen data.</p>}
          {byStatus.map(([status, v]) => (
            <div key={status} className="text-sm">
              <div className="flex justify-between">
                <span className="capitalize">{status} ({v.count})</span>
                <span className="font-semibold">{formatPrice(v.omzet)}</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${(v.omzet / maxStatus) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Best verkochte producten</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                <th className="py-2 font-semibold">Product</th>
                <th className="py-2 text-right font-semibold">Aantal</th>
                <th className="py-2 text-right font-semibold">Omzet</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p) => (
                <tr key={p.title} className="border-b border-border">
                  <td className="py-2 pr-2">{p.title}</td>
                  <td className="py-2 text-right">{p.qty}</td>
                  <td className="py-2 text-right font-semibold">{formatPrice(p.omzet)}</td>
                </tr>
              ))}
              {topProducts.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-4 text-center text-muted-foreground">
                    Nog geen betaalde orders.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Package className="h-3.5 w-3.5" /> Op basis van de huidige (demo) orders. Koppel een
            database of de Channable/Tilroy-orders voor volledige rapportage.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

interface InsightsData {
  total: number;
  searchCount: number;
  chatCount: number;
  pageviews: number;
  conversions: number;
  revenue: number;
  visitorsToday: number;
  live: number;
  topSearches: { query: string; count: number }[];
  topViewed: { title: string; count: number }[];
  recentChats: { question: string; ts: number }[];
}

interface LiveSession {
  path: string;
  secondsAgo: number;
  checkout: boolean;
}

interface LiveData {
  count: number;
  sessions: LiveSession[];
}

/** Maak een pad leesbaar voor de owner ("/" → "Home"). */
function prettyPath(path: string): string {
  if (!path || path === "/") return "Home";
  return path;
}

/**
 * Live-overzicht: aantal + lijst met actieve sessies (huidige pagina + of ze
 * afrekenen). Ververst elke 12s via één fetch.
 */
function LiveSessionsCard() {
  const [data, setData] = useState<LiveData | null>(null);

  useEffect(() => {
    let active = true;
    const load = () =>
      fetch("/api/admin/analytics/live", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => active && d && setData(d))
        .catch(() => {});
    load();
    const id = setInterval(load, 12_000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  const count = data?.count ?? 0;
  const sessions = data?.sessions ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="relative grid h-7 w-7 shrink-0 place-items-center rounded-md bg-klusr-stock/10 text-klusr-stock">
            <Radio className="h-4 w-4" />
            {count > 0 && (
              <span className="absolute right-1 top-1 h-1.5 w-1.5 animate-ping rounded-full bg-klusr-stock" />
            )}
          </span>
          Live nu ({count})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-border text-sm">
          {sessions.map((s, i) => (
            <li key={i} className="flex items-center justify-between gap-3 py-2">
              <span className="flex min-w-0 items-center gap-2">
                <span className="truncate font-medium">{prettyPath(s.path)}</span>
                {s.checkout && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
                    <ShoppingCart className="h-3 w-3" /> Rekent af
                  </span>
                )}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                {s.secondsAgo} sec geleden
              </span>
            </li>
          ))}
          {sessions.length === 0 && (
            <li className="py-3 text-center text-muted-foreground">
              Op dit moment geen actieve bezoekers.
            </li>
          )}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          Toont per actieve bezoeker de huidige pagina. Ververst elke 12s. Uitgesloten IP&apos;s
          verschijnen hier niet.
        </p>
      </CardContent>
    </Card>
  );
}

/**
 * IP-uitsluiting: IP's die je hier toevoegt tellen niet mee in rapportages en
 * live bezoekers (bijv. je eigen kantoor-IP).
 */
function IpExclusionCard() {
  const [env, setEnv] = useState<string[]>([]);
  const [custom, setCustom] = useState<string[]>([]);
  const [currentIp, setCurrentIp] = useState("");
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const apply = (d: { env?: string[]; custom?: string[]; currentIp?: string } | null) => {
    if (!d) return;
    setEnv(d.env ?? []);
    setCustom(d.custom ?? []);
    if (typeof d.currentIp === "string") setCurrentIp(d.currentIp);
  };

  useEffect(() => {
    let active = true;
    fetch("/api/admin/analytics/excluded-ips", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => active && apply(d))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const add = async (ip: string) => {
    const clean = ip.trim();
    if (!clean || busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/analytics/excluded-ips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip: clean }),
      });
      const d = await res.json().catch(() => null);
      if (!res.ok) {
        setError((d && d.error) || "Toevoegen mislukt.");
      } else {
        apply(d);
        setInput("");
      }
    } catch {
      setError("Toevoegen mislukt.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (ip: string) => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/analytics/excluded-ips", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip }),
      });
      const d = await res.json().catch(() => null);
      if (res.ok) apply(d);
    } catch {
      /* stilletjes: niet de UI breken */
    } finally {
      setBusy(false);
    }
  };

  const currentIpAlreadyExcluded =
    !!currentIp && (custom.includes(currentIp) || env.includes(currentIp));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldOff className="h-4 w-4 text-primary" />
          IP-uitsluiting
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          IP-adressen die je hier toevoegt tellen niet mee in de rapportages en live bezoekers
          (bijv. je eigen kantoor-IP).
        </p>

        <div className="rounded-lg border border-border bg-secondary/30 p-3">
          <p className="text-xs text-muted-foreground">Jouw huidige IP-adres</p>
          <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-sm font-semibold">{currentIp || "onbekend"}</span>
            <button
              type="button"
              disabled={!currentIp || currentIpAlreadyExcluded || busy}
              onClick={() => add(currentIp)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-klusr-black px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-klusr-black/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" />
              {currentIpAlreadyExcluded ? "Al uitgesloten" : "Mijn huidige IP toevoegen"}
            </button>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            add(input);
          }}
          className="flex flex-wrap items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Bijv. 84.12.34.56"
            inputMode="text"
            className="min-w-0 flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm font-mono focus:border-primary focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || busy}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> Toevoegen
          </button>
        </form>
        {error && <p className="text-sm font-medium text-destructive">{error}</p>}

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Uitgesloten IP-adressen
          </p>
          <ul className="mt-2 divide-y divide-border text-sm">
            {custom.map((ip) => (
              <li key={ip} className="flex items-center justify-between gap-3 py-2">
                <span className="font-mono">{ip}</span>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => remove(ip)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-destructive transition-colors hover:underline disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Verwijder
                </button>
              </li>
            ))}
            {custom.length === 0 && (
              <li className="py-3 text-center text-muted-foreground">
                Nog geen IP&apos;s uitgesloten.
              </li>
            )}
          </ul>
        </div>

        {env.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Vast ingesteld via omgeving (read-only): <span className="font-mono">{env.join(", ")}</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function Insights() {
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = () =>
      fetch("/api/admin/analytics", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => active && d && setData(d))
        .catch(() => {})
        .finally(() => active && setLoading(false));
    load();
    // Live-aantal + cijfers elke 15s verversen.
    const id = setInterval(load, 15_000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  if (loading) return <p className="text-sm text-muted-foreground">Inzichten laden…</p>;
  if (!data) return <p className="text-sm text-muted-foreground">Geen inzichten beschikbaar.</p>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black tracking-tight">Bezoekers &amp; statistieken</h2>
        <p className="text-sm text-muted-foreground">
          Live verkeer, paginaweergaven en IP-uitsluiting — ververst elke 15s.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-klusr-stock/10 text-klusr-stock">
              <Radio className="h-5 w-5" />
              {data.live > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 animate-ping rounded-full bg-klusr-stock" />
              )}
            </span>
            <div>
              <p className="text-2xl font-black tabular-nums">{data.live}</p>
              <p className="text-xs text-muted-foreground">Live bezoekers nu</p>
            </div>
          </CardContent>
        </Card>
        <StatCard icon={Users} label="Bezoekers vandaag" value={String(data.visitorsToday)} />
        <StatCard icon={Eye} label="Paginaweergaven" value={String(data.pageviews)} />
        <StatCard icon={ShoppingBag} label="Conversies" value={String(data.conversions)} />
      </div>

      <LiveSessionsCard />

      <IpExclusionCard />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Search} label="Zoekopdrachten" value={String(data.searchCount)} />
        <StatCard icon={MessageCircle} label="Chat-vragen" value={String(data.chatCount)} />
        <StatCard icon={Euro} label="Omzet (events)" value={formatPrice(data.revenue)} />
        <StatCard icon={TrendingUp} label="Events totaal" value={String(data.total)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top zoekopdrachten</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border text-sm">
            {data.topSearches.map((s) => (
              <li key={s.query} className="flex justify-between py-1.5">
                <span className="truncate">{s.query}</span>
                <span className="font-semibold">{s.count}×</span>
              </li>
            ))}
            {data.topSearches.length === 0 && (
              <li className="py-3 text-center text-muted-foreground">Nog geen zoekdata.</li>
            )}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Meest bekeken producten</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border text-sm">
            {data.topViewed.map((p, i) => (
              <li key={i} className="flex items-center justify-between gap-3 py-1.5">
                <span className="truncate">{p.title}</span>
                <span className="shrink-0 font-semibold">{p.count}×</span>
              </li>
            ))}
            {data.topViewed.length === 0 && (
              <li className="py-3 text-center text-muted-foreground">Nog geen productweergaven.</li>
            )}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recente chat-vragen</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1.5 text-sm">
            {data.recentChats.map((c, i) => (
              <li key={i} className="rounded-md bg-secondary/40 px-3 py-2">
                {c.question}
              </li>
            ))}
            {data.recentChats.length === 0 && (
              <li className="py-3 text-center text-muted-foreground">Nog geen chat-vragen.</li>
            )}
          </ul>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Live ververst elke 15s. Bezoekers/weergaven o.b.v. anonieme bezoeker-id; eigen verkeer
        filter je met <code>INTERNAL_IPS</code> in de omgeving of via &quot;IP-uitsluiting&quot;
        hierboven. Events in KV (zet KV aan voor persistentie over deploys).
      </p>
    </div>
  );
}
