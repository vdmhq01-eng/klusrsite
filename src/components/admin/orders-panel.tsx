"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  Truck,
  Package,
  ExternalLink,
  Download,
  RefreshCw,
  KeyRound,
  AlertTriangle,
  FileText,
  ListChecks,
} from "lucide-react";
import type { Order, OrderStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice, formatDate, cn } from "@/lib/utils";

interface LabelResult {
  ok: boolean;
  configured: boolean;
  demo?: boolean;
  status: number;
  message: string;
  barcode?: string;
  trackTrace?: string;
  labelBase64?: string;
  response?: unknown;
}

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
};

const needsLabel = (o: Order) =>
  (o.paymentStatus === "paid" || o.paymentStatus === "authorized") && !o.shipment;

export function OrdersPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [postnlConfigured, setPostnlConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, LabelResult>>({});

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders", { cache: "no-store" });
      const data = await res.json();
      setOrders(data.orders ?? []);
      setPostnlConfigured(Boolean(data.postnlConfigured));
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function makeLabel(order: Order) {
    setBusy(order.id);
    try {
      const res = await fetch("/api/admin/postnl-label", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });
      const result = (await res.json()) as LabelResult;
      setResults((r) => ({ ...r, [order.id]: result }));
      if (result.ok && result.barcode) {
        setOrders((list) =>
          list.map((o) =>
            o.id === order.id
              ? {
                  ...o,
                  paymentStatus: "shipped",
                  shipment: {
                    carrier: "postnl",
                    barcode: result.barcode!,
                    trackTrace: result.trackTrace,
                    labelCreatedAt: new Date().toISOString(),
                  },
                }
              : o,
          ),
        );
      }
    } catch {
      setResults((r) => ({
        ...r,
        [order.id]: { ok: false, configured: postnlConfigured, status: 0, message: "Labelroute onbereikbaar." },
      }));
    } finally {
      setBusy(null);
    }
  }

  const open = orders.filter(needsLabel);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">Orders</CardTitle>
            <p className="text-sm text-muted-foreground">
              Openstaande orders en verzending. Maak per betaalde order een PostNL-verzendlabel aan.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="dark" size="sm" asChild>
              <a href="/looplijst" target="_blank" rel="noreferrer">
                <ListChecks className="h-4 w-4" />
                Looplijst
              </a>
            </Button>
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              Ververs
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {!postnlConfigured && (
          <div className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
            <KeyRound className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p>
              PostNL is nog niet geconfigureerd — labels worden als <strong>demo</strong> aangemaakt
              (geen echte verzending). Zet <code>POSTNL_API_KEY</code>,{" "}
              <code>POSTNL_CUSTOMER_CODE</code> en <code>POSTNL_CUSTOMER_NUMBER</code> in de omgeving.
            </p>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm font-semibold">
          <Package className="h-4 w-4 text-primary" />
          {loading ? "Laden…" : `${open.length} openstaande order(s) · ${orders.length} totaal`}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                <th className="py-2 pr-3 font-semibold">Order</th>
                <th className="py-2 pr-3 font-semibold">Klant</th>
                <th className="py-2 pr-3 font-semibold">Status</th>
                <th className="py-2 pr-3 font-semibold">Totaal</th>
                <th className="py-2 pr-3 font-semibold">Verzending</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const res = results[o.id];
                return (
                  <tr key={o.id} className={cn("border-b border-border align-top", needsLabel(o) && "bg-primary/5")}>
                    <td className="py-3 pr-3">
                      <div className="font-semibold">{o.reference}</div>
                      <div className="text-xs text-muted-foreground">{formatDate(o.createdAt)}</div>
                      <a
                        href={`/pakbon/${o.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        <FileText className="h-3 w-3" /> Print pakbon
                      </a>
                    </td>
                    <td className="py-3 pr-3">
                      <div>{o.customer.firstName} {o.customer.lastName}</div>
                      <div className="text-xs text-muted-foreground">
                        {o.customer.postalCode} {o.customer.city}
                      </div>
                    </td>
                    <td className="py-3 pr-3">
                      <span
                        className={cn(
                          "inline-block rounded-full px-2 py-0.5 text-xs font-semibold",
                          o.paymentStatus === "shipped" || o.paymentStatus === "delivered"
                            ? "bg-klusr-stock/10 text-klusr-stock"
                            : needsLabel(o)
                              ? "bg-primary/10 text-primary"
                              : "bg-secondary text-muted-foreground",
                        )}
                      >
                        {STATUS_LABEL[o.paymentStatus]}
                      </span>
                    </td>
                    <td className="py-3 pr-3 font-semibold">{formatPrice(o.total)}</td>
                    <td className="py-3 pr-3">
                      {o.shipment ? (
                        <div className="space-y-1 text-xs">
                          <div className="inline-flex items-center gap-1 font-semibold text-klusr-stock">
                            <Truck className="h-3.5 w-3.5" /> {o.shipment.barcode}
                          </div>
                          {o.shipment.trackTrace && (
                            <a
                              href={o.shipment.trackTrace}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1 text-primary hover:underline"
                            >
                              Track &amp; Trace <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                          {res?.labelBase64 && (
                            <a
                              href={`data:application/pdf;base64,${res.labelBase64}`}
                              download={`label-${o.reference}.pdf`}
                              className="flex items-center gap-1 text-primary hover:underline"
                            >
                              Download label <Download className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      ) : (o.paymentStatus === "paid" || o.paymentStatus === "authorized") ? (
                        <div className="space-y-1">
                          <Button size="sm" variant="dark" onClick={() => makeLabel(o)} disabled={busy === o.id}>
                            {busy === o.id ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" /> Bezig…
                              </>
                            ) : (
                              <>
                                <Truck className="h-4 w-4" /> Maak PostNL-label
                              </>
                            )}
                          </Button>
                          {res && !res.ok && (
                            <div className="text-xs text-destructive">
                              <p className="flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" /> {res.message}
                              </p>
                              {res.response != null && (
                                <pre className="mt-1 max-h-32 overflow-auto rounded bg-destructive/5 p-1.5 text-[10px] text-muted-foreground">
                                  {typeof res.response === "string"
                                    ? res.response
                                    : JSON.stringify(res.response, null, 2)}
                                </pre>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {!loading && orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-sm text-muted-foreground">
                    Geen orders gevonden.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted-foreground">
          Let op: orders worden nu in-memory bewaard (demo). Voor een betrouwbaar productie-overzicht
          koppelen we een database of de Channable/Tilroy-orders als bron.
        </p>
      </CardContent>
    </Card>
  );
}
