"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ShoppingCart,
  CreditCard,
  Printer,
  ArrowUpRight,
  Store,
  Globe,
  CheckCircle2,
  AlertCircle,
  History,
} from "lucide-react";
import type { Order, OrderStatus } from "@/types";
import { formatPrice, cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PAID: OrderStatus[] = ["paid", "authorized", "shipped", "delivered"];
const isPaid = (o: Order) => PAID.includes(o.paymentStatus);
const isPos = (o: Order) => o.channel === "pos";

interface StockMovement {
  orderId: string;
  reference: string;
  variantId: string;
  productId: string;
  title: string;
  qty: number;
  channel: "web" | "pos";
  ts: number;
}

interface KassaConfig {
  movements: StockMovement[];
  terminalConfigured: boolean;
  printAgentConfigured: boolean;
}

function sameDay(iso: string, ref: Date): boolean {
  const d = new Date(iso);
  return (
    d.getDate() === ref.getDate() &&
    d.getMonth() === ref.getMonth() &&
    d.getFullYear() === ref.getFullYear()
  );
}

export function KassaPanel({ orders }: { orders: Order[] }) {
  const [cfg, setCfg] = useState<KassaConfig | null>(null);

  useEffect(() => {
    fetch("/api/admin/kassa", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setCfg(d))
      .catch(() => {});
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const paid = orders.filter(isPaid);
    const posPaid = paid.filter(isPos);
    const posToday = posPaid.filter((o) => sameDay(o.createdAt, now));
    const webToday = paid.filter((o) => !isPos(o) && sameDay(o.createdAt, now));
    const sum = (arr: Order[]) => arr.reduce((s, o) => s + o.total, 0);
    return {
      posTodayCount: posToday.length,
      posTodayRevenue: sum(posToday),
      webTodayRevenue: sum(webToday),
      posTotalCount: posPaid.length,
      posTotalRevenue: sum(posPaid),
    };
  }, [orders]);

  return (
    <div className="space-y-6">
      {/* Launch */}
      <Card className="overflow-hidden border-klusr-black/10 bg-gradient-to-br from-klusr-black to-neutral-800 text-white">
        <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/10">
              <ShoppingCart className="h-7 w-7" />
            </span>
            <div>
              <h2 className="text-xl font-black tracking-tight">KLUSR Kassa</h2>
              <p className="max-w-md text-sm text-white/70">
                Omnichannel kassa: verkoop aan de toonbank, betaal met PIN (Mollie-terminal) of
                contant, print de bon en open de kassalade. Elke verkoop boekt direct af op dezelfde
                voorraad als de webshop.
              </p>
            </div>
          </div>
          <a
            href="/kassa"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-klusr-black hover:opacity-90"
          >
            Open kassa <ArrowUpRight className="h-4 w-4" />
          </a>
        </CardContent>
      </Card>

      {/* Omnichannel-omzet vandaag */}
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          icon={Store}
          label="Kassa vandaag"
          value={formatPrice(stats.posTodayRevenue)}
          hint={`${stats.posTodayCount} ${stats.posTodayCount === 1 ? "transactie" : "transacties"}`}
          tone="black"
        />
        <StatCard
          icon={Globe}
          label="Online vandaag"
          value={formatPrice(stats.webTodayRevenue)}
          hint="Webshop"
          tone="neutral"
        />
        <StatCard
          icon={ShoppingCart}
          label="Kassa totaal"
          value={formatPrice(stats.posTotalRevenue)}
          hint={`${stats.posTotalCount} verkopen`}
          tone="neutral"
        />
      </div>

      {/* Koppelingen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-4 w-4 text-primary" /> Kassakoppelingen
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          <ConfigRow
            icon={CreditCard}
            label="Mollie-betaalterminal (PIN)"
            ok={cfg?.terminalConfigured}
            okText="Gekoppeld"
            offText="Zet MOLLIE_TERMINAL_ID — anders is alleen contant/handmatig actief"
          />
          <ConfigRow
            icon={Printer}
            label="Bonprinter / kassalade-agent"
            ok={cfg?.printAgentConfigured}
            okText="Gekoppeld"
            offText="Zet NEXT_PUBLIC_POS_PRINT_AGENT_URL — anders print je de bon via de browser"
          />
        </CardContent>
      </Card>

      {/* Recente voorraadmutaties */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="h-4 w-4 text-primary" /> Recente voorraadmutaties
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Elke betaalde verkoop (kassa én webshop) boekt af op het gedeelde voorraad-grootboek.
          </p>
        </CardHeader>
        <CardContent>
          {!cfg ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Laden…</p>
          ) : cfg.movements.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nog geen mutaties. Reken een verkoop af om hier de afboeking te zien.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {cfg.movements.map((m, i) => (
                <li key={`${m.orderId}-${m.variantId}-${i}`} className="flex items-center gap-3 py-2">
                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold",
                      m.channel === "pos"
                        ? "bg-klusr-black text-white"
                        : "bg-secondary text-muted-foreground",
                    )}
                  >
                    {m.channel === "pos" ? <Store className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                    {m.channel === "pos" ? "Kassa" : "Online"}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm">{m.title}</span>
                  <span className="shrink-0 text-sm font-bold tabular-nums text-primary">
                    −{m.qty}
                  </span>
                  <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
                    {m.reference}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: typeof Store;
  label: string;
  value: string;
  hint?: string;
  tone: "black" | "neutral";
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4 shadow-card",
        tone === "black" ? "border-klusr-black bg-klusr-black text-white" : "border-border bg-card",
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2 text-xs font-semibold uppercase tracking-wide",
          tone === "black" ? "text-white/70" : "text-muted-foreground",
        )}
      >
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="mt-2 text-2xl font-black tabular-nums">{value}</div>
      {hint && (
        <div className={cn("mt-0.5 text-xs", tone === "black" ? "text-white/60" : "text-muted-foreground")}>
          {hint}
        </div>
      )}
    </div>
  );
}

function ConfigRow({
  icon: Icon,
  label,
  ok,
  okText,
  offText,
}: {
  icon: typeof CreditCard;
  label: string;
  ok?: boolean;
  okText: string;
  offText: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border p-3">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-secondary text-muted-foreground">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <div className="text-sm font-semibold">{label}</div>
        <div
          className={cn(
            "mt-0.5 flex items-center gap-1 text-xs",
            ok ? "text-klusr-stock" : "text-muted-foreground",
          )}
        >
          {ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
          {ok ? okText : offText}
        </div>
      </div>
    </div>
  );
}
