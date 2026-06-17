"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Check,
  CircleHelp,
  Loader2,
  MapPin,
  Package,
  Search,
  Truck,
} from "lucide-react";
import type { Order } from "@/types";
import { cn, formatDate, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  activeStepIndex,
  isCanceledStatus,
  orderStatusBadgeVariant,
  orderStatusBeleving,
  orderStatusLabel,
  timelineSteps,
} from "./order-status-meta";

const DEMO_REFERENCE = "KLR-204815";
const DEMO_EMAIL = "klant@voorbeeld.nl";

interface OrderTrackerProps {
  /** Optional reference coming from the URL (?ref=…). */
  initialReference?: string;
}

export function OrderTracker({ initialReference }: OrderTrackerProps) {
  const [reference, setReference] = useState(initialReference ?? "");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  async function lookup(ref: string, mail: string) {
    setSearched(true);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/order-status?ref=${encodeURIComponent(ref.trim())}&email=${encodeURIComponent(mail.trim())}`,
        { cache: "no-store" },
      );
      const data = (await res.json()) as { found: boolean; order?: Order };
      if (!data.found || !data.order) {
        setOrder(null);
        setError(
          "We konden geen bestelling vinden bij dit bestelnummer en e-mailadres. Controleer of beide kloppen — gebruik het adres waarmee je hebt besteld.",
        );
        return;
      }
      setOrder(data.order);
    } catch {
      setOrder(null);
      setError("Het ophalen van je bestelling is even niet gelukt. Probeer het zo opnieuw.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    lookup(reference, email);
  }

  function handleDemo() {
    setReference(DEMO_REFERENCE);
    setEmail(DEMO_EMAIL);
    lookup(DEMO_REFERENCE, DEMO_EMAIL);
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Volg je bestelling</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="reference" className="mb-1.5 block">
                  Bestelnummer
                </Label>
                <Input
                  id="reference"
                  placeholder="KLR-000000"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  autoComplete="off"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email" className="mb-1.5 block">
                  E-mailadres
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jij@voorbeeld.nl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Volg bestelling
              </Button>
              <Button type="button" variant="outline" onClick={handleDemo} disabled={loading}>
                Bekijk voorbeeld
              </Button>
            </div>
          </form>

          {error && (
            <p className="mt-4 flex items-start gap-2 rounded-lg bg-primary/5 p-3 text-sm text-primary">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </p>
          )}

          {searched && !loading && !order && !error && (
            <p className="mt-4 text-sm text-muted-foreground">
              Geen bestelling gevonden.
            </p>
          )}
        </CardContent>
      </Card>

      {order && <OrderDetail order={order} />}
    </div>
  );
}

/* -------------------------------------------------------------- order detail */

function OrderDetail({ order }: { order: Order }) {
  const canceled = isCanceledStatus(order.paymentStatus);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <Card>
        <CardHeader className="gap-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Bestelnummer
              </p>
              <CardTitle className="mt-0.5 text-2xl">{order.reference}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Besteld op {formatDate(order.createdAt)}
              </p>
            </div>
            <Badge variant={orderStatusBadgeVariant[order.paymentStatus]}>
              {orderStatusLabel[order.paymentStatus]}
            </Badge>
          </div>
          {!canceled && (
            <p className="rounded-lg bg-primary/5 p-3 text-sm font-medium text-foreground">
              {orderStatusBeleving[order.paymentStatus]}
            </p>
          )}
          {!canceled && order.estimatedDelivery && (
            <p className="flex items-center gap-2 rounded-lg bg-klusr-stock/10 p-3 text-sm font-medium text-klusr-stock">
              <Truck className="h-4 w-4 shrink-0" />
              Verwachte bezorging: {formatDate(order.estimatedDelivery)}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {canceled ? (
            <CanceledNotice status={orderStatusLabel[order.paymentStatus]} />
          ) : (
            <Timeline order={order} />
          )}
        </CardContent>
      </Card>

      {/* Items */}
      {order.items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Je bestelling</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {order.items.map((item) => (
              <div key={item.key} className="flex items-center gap-3">
                <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-border bg-white">
                  <Image
                    src={item.image}
                    alt={`${item.brand} ${item.title}`}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.variantLabel}
                    {item.selectedColor && ` · ${item.selectedColor.name}`} ·
                    aantal {item.quantity}
                  </p>
                </div>
                <span className="text-sm font-semibold">
                  {formatPrice(item.kluspasPrice * item.quantity)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Summary + address */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Overzicht</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <Row label="Subtotaal" value={formatPrice(order.subtotal)} />
            <Row
              label="Verzendkosten"
              value={order.shipping === 0 ? "Gratis" : formatPrice(order.shipping)}
            />
            {order.kluspasSavings > 0 && (
              <Row
                label="KLUSRPAS-voordeel"
                value={`- ${formatPrice(order.kluspasSavings)}`}
                accent
              />
            )}
            <Separator className="my-1" />
            <Row label="Totaal" value={formatPrice(order.total)} bold />
            {order.paymentMethod && (
              <p className="mt-1 text-xs text-muted-foreground">
                Betaald met {formatPaymentMethod(order.paymentMethod)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bezorgadres</CardTitle>
          </CardHeader>
          <CardContent className="flex items-start gap-3 text-sm">
            <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-md bg-secondary text-muted-foreground">
              <MapPin className="h-5 w-5" />
            </span>
            <div className="not-italic leading-relaxed">
              <p className="font-semibold">
                {order.customer.firstName} {order.customer.lastName}
              </p>
              <p className="text-muted-foreground">{order.customer.street}</p>
              <p className="text-muted-foreground">
                {order.customer.postalCode} {order.customer.city}
              </p>
              <p className="mt-1 text-muted-foreground">{order.customer.email}</p>
              {order.customer.phone && (
                <p className="text-muted-foreground">{order.customer.phone}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Help */}
      <div className="flex flex-col items-start gap-3 rounded-2xl bg-klusr-black p-6 text-white sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-white/10">
            <CircleHelp className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-bold">Hulp nodig met je bestelling?</p>
            <p className="text-sm text-white/70">
              Onze klantenservice helpt je graag verder.
            </p>
          </div>
        </div>
        <Button asChild variant="outline">
          <Link href="/klantenservice">
            Naar klantenservice
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ timeline */

function Timeline({ order }: { order: Order }) {
  const activeIndex = activeStepIndex(order.paymentStatus);

  return (
    <ol className="flex flex-col gap-0 sm:flex-row sm:gap-0">
      {timelineSteps.map((step, index) => {
        const completed = index < activeIndex;
        const active = index === activeIndex;
        const isLast = index === timelineSteps.length - 1;

        return (
          <li
            key={step}
            className="relative flex flex-1 gap-3 sm:flex-col sm:items-center sm:gap-2 sm:text-center"
          >
            {/* Connector */}
            {!isLast && (
              <span
                aria-hidden
                className={cn(
                  // vertical on mobile, horizontal on desktop
                  "absolute left-[15px] top-8 h-[calc(100%-2rem)] w-0.5 sm:left-auto sm:right-0 sm:top-4 sm:h-0.5 sm:w-full sm:translate-x-1/2",
                  completed ? "bg-primary" : "bg-border",
                )}
              />
            )}

            <span
              className={cn(
                "relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 transition-colors",
                completed && "border-primary bg-primary text-primary-foreground",
                active && "border-primary bg-card text-primary",
                !completed && !active && "border-border bg-card text-muted-foreground",
              )}
            >
              {completed ? (
                <Check className="h-4 w-4" />
              ) : (
                <StepIcon index={index} active={active} />
              )}
            </span>

            <div className="pb-6 sm:pb-0">
              <p
                className={cn(
                  "text-sm font-semibold",
                  active ? "text-primary" : completed ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step}
              </p>
              {active && (
                <p className="text-xs text-muted-foreground">Huidige status</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function StepIcon({ index, active }: { index: number; active: boolean }) {
  const cls = cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground");
  if (index === 2) return <Truck className={cls} />;
  if (index === 3) return <Package className={cls} />;
  // Besteld / Betaald default dot
  return <span className={cn("h-2 w-2 rounded-full", active ? "bg-primary" : "bg-muted-foreground")} />;
}

function CanceledNotice({ status }: { status: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-secondary/60 p-4">
      <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
        <AlertCircle className="h-5 w-5" />
      </span>
      <div>
        <p className="text-sm font-semibold">Deze bestelling is {status.toLowerCase()}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Is dit niet de bedoeling? Neem contact op met onze klantenservice, dan
          zoeken we het samen uit.
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- helpers */

function Row({
  label,
  value,
  bold,
  accent,
}: {
  label: string;
  value: string;
  bold?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={cn(bold ? "font-bold" : "text-muted-foreground")}>
        {label}
      </span>
      <span
        className={cn(
          bold && "text-base font-black",
          accent && "font-semibold text-klusr-stock",
        )}
      >
        {value}
      </span>
    </div>
  );
}

const PAYMENT_LABELS: Record<string, string> = {
  ideal: "iDEAL",
  creditcard: "creditcard",
  bancontact: "Bancontact",
  paypal: "PayPal",
  banktransfer: "overschrijving",
};

function formatPaymentMethod(method: string): string {
  return PAYMENT_LABELS[method.toLowerCase()] ?? method;
}
