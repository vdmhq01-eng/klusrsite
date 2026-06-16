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
} from "lucide-react";
import type { Order, OrderStatus } from "@/types";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrdersPanel } from "./orders-panel";
import { CustomersPanel } from "./customers-panel";
import { AiContentManager } from "./ai-content-manager";
import { ChannableTestOrder } from "./channable-test-order";

type SectionId = "overzicht" | "orders" | "klanten" | "rapportages" | "content" | "channable";

const NAV: { id: SectionId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overzicht", label: "Overzicht", icon: LayoutDashboard },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "klanten", label: "Klanten", icon: Users },
  { id: "rapportages", label: "Rapportages", icon: BarChart3 },
  { id: "content", label: "AI-content", icon: Sparkles },
  { id: "channable", label: "Channable", icon: Send },
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
        {section === "klanten" && <CustomersPanel orders={orders} />}
        {section === "rapportages" && <Reports orders={orders} />}
        {section === "content" && <AiContentManager />}
        {section === "channable" && <ChannableTestOrder />}
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
