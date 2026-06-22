import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle2,
  Package,
  Truck,
  Mail,
  ArrowRight,
  MapPin,
  Loader2,
  XCircle,
  RotateCcw,
  ShoppingCart,
  Headphones,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PurchaseTracker } from "@/components/checkout/purchase-tracker";
import { PaymentStatusPoller } from "@/components/checkout/payment-status-poller";
import { ClearCart } from "@/components/checkout/clear-cart";
import { ReorderUpsell } from "@/components/checkout/reorder-upsell";
import { GoogleCustomerReviews } from "@/components/checkout/google-customer-reviews";
import { getOrder, updateOrderStatus } from "@/lib/store/orders";
import { getPaymentStatus, mapMollieStatus } from "@/lib/payments";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import { t } from "@/lib/i18n/server";
import type { Order, OrderStatus } from "@/types";

export const metadata: Metadata = {
  title: "Bedankt voor je bestelling",
  robots: { index: false, follow: false },
};

// Statussen die we niet willen cachen: de uitkomst kan per request veranderen
// (live Mollie-fetch + webhook-race).
export const dynamic = "force-dynamic";

type StatusGroup = "paid" | "pending" | "failed";

/** Statussen die een betaalde, succesvolle bestelling betekenen. */
const PAID_STATES: ReadonlySet<OrderStatus> = new Set<OrderStatus>([
  "paid",
  "authorized",
  "shipped",
  "delivered",
  "refunded",
]);

function classify(status: OrderStatus): StatusGroup {
  if (PAID_STATES.has(status)) return "paid";
  if (status === "open" || status === "pending") return "pending";
  return "failed"; // failed | canceled | expired
}

/**
 * Bepaal de actuele orderstatus zónder op de webhook te wachten.
 *
 * Mollie redirect ná het betalen áltijd naar /bedankt — ook bij annuleren of
 * mislukken. De echte uitkomst komt via de webhook, maar die kan een fractie
 * later landen (redirect/webhook-race). Daarom: zodra een order nog niet
 * betaald is én een Mollie-id heeft, halen we de LIVE status op en persisteren
 * we die direct, zodat deze pagina meteen klopt. Demo-orders (geen Mollie-id /
 * demo=1) zijn server-side al op "paid" gezet en hebben dit niet nodig.
 */
async function resolveOrder(orderId?: string): Promise<Order | undefined> {
  if (!orderId) return undefined;
  const order = await getOrder(orderId);
  if (!order) return undefined;

  // Al in een definitieve betaalde staat → niets te doen.
  if (PAID_STATES.has(order.paymentStatus)) return order;
  if (!order.molliePaymentId) return order; // demo / nog geen betaling aangemaakt

  try {
    const live = await getPaymentStatus(order.molliePaymentId);
    if (!live) return order; // Mollie niet geconfigureerd (demo)
    const mapped = mapMollieStatus(live.status);
    if (mapped !== order.paymentStatus) {
      const updated = await updateOrderStatus(order.id, mapped);
      if (updated) return updated;
    }
  } catch {
    // Live-fetch mislukt (transiënt) → val terug op de opgeslagen status; de
    // webhook werkt de order alsnog bij en de pending-view ververst vanzelf.
  }
  return order;
}

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: { order?: string; demo?: string };
}) {
  const order = await resolveOrder(searchParams.order);
  const group: StatusGroup | undefined = order ? classify(order.paymentStatus) : undefined;

  return (
    <div className="container-klusr py-10">
      {/* Mand altijd legen na het afrekenen (ook als de order niet geladen kon
          worden). Bij een mislukte betaling NIET legen: de winkelwagen is
          client-side en blijft zo bewaard zodat "Opnieuw proberen" werkt. */}
      {(searchParams.order || searchParams.demo) && group !== "failed" && <ClearCart />}

      <div className="mx-auto max-w-2xl">
        {order && group === "paid" && <PaidView order={order} />}

        {order && group === "pending" && <PendingView order={order} />}

        {order && group === "failed" && <FailedView order={order} />}

        {!order && (
          <>
            <ConfirmationHeader />
            <div className="mt-8 rounded-xl border border-border bg-card p-6 text-center">
              <p className="text-muted-foreground">{t("checkout.thanks.loadError")}</p>
              <Button asChild className="mt-4">
                <Link href="/">{t("checkout.thanks.backHome")}</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Succes — betaalde order: feestelijke hero, tijdlijn en order-overzicht.     */
/* ────────────────────────────────────────────────────────────────────────── */

function PaidView({ order }: { order: Order }) {
  return (
    <>
      {/* GA `purchase` vuurt ALLEEN hier — bij een écht betaalde order. */}
      <PurchaseTracker order={order} />

      {/* Google Customer Reviews opt-in (alleen echte orders) */}
      {!order.isTest && (
        <GoogleCustomerReviews
          orderId={order.reference}
          email={order.customer.email}
          country={(order.customer.country || "NL").toUpperCase().slice(0, 2)}
          deliveryDate={(
            order.estimatedDelivery ||
            new Date(new Date(order.createdAt).getTime() + 2 * 86400000).toISOString()
          ).slice(0, 10)}
        />
      )}

      {/* Feestelijke hero */}
      <div className="animate-slide-up overflow-hidden rounded-3xl border border-klusr-stock/25 bg-gradient-to-b from-klusr-stock/10 to-card p-8 text-center sm:p-10">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-klusr-stock text-white shadow-card-hover ring-8 ring-klusr-stock/15">
          <CheckCircle2 className="h-11 w-11" />
        </span>
        <p className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-klusr-stock/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-klusr-stock">
          <ShieldCheck className="h-3.5 w-3.5" />
          {t("checkout.thanks.successBadge")}
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
          {t("checkout.thanks.title")}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          {t("checkout.thanks.text")}
          {t("checkout.thanks.confirmationSentPre")}
          <strong className="text-foreground">{order.customer.email}</strong>
          {t("checkout.thanks.confirmationSentPost")}
        </p>
      </div>

      {/* Order-tijdlijn: Bevestiging → Ingepakt → Onderweg */}
      <OrderTimeline className="mt-6" />

      {/* Order card */}
      <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-card">
        <p className="mb-4 text-sm font-black uppercase tracking-wide text-muted-foreground">
          {t("checkout.thanks.orderSummary")}
        </p>
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-secondary/40 p-4">
          <div>
            <p className="text-xs uppercase text-muted-foreground">
              {t("checkout.thanks.orderNumber")}
            </p>
            <p className="text-lg font-black text-primary">{order.reference}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase text-muted-foreground">
              {t("checkout.thanks.orderDate")}
            </p>
            <p className="font-semibold">{formatDate(order.createdAt)}</p>
          </div>
        </div>

        {order.items.length > 0 && (
          <>
            <Separator className="my-4" />
            <ul className="space-y-2 text-sm">
              {order.items.map((i) => (
                <li key={i.key} className="flex justify-between gap-3">
                  <span className="text-muted-foreground">
                    {i.quantity}× {i.title}{" "}
                    <span className="text-xs">({i.variantLabel})</span>
                  </span>
                  <span className="shrink-0 font-medium">
                    {formatPrice(i.kluspasPrice * i.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}

        <Separator className="my-4" />
        <dl className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">{t("checkout.thanks.subtotal")}</dt>
            <dd>{formatPrice(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">{t("checkout.thanks.shipping")}</dt>
            <dd>
              {order.shipping === 0 ? (
                <span className="text-klusr-stock">{t("checkout.thanks.free")}</span>
              ) : (
                formatPrice(order.shipping)
              )}
            </dd>
          </div>
          <div className="mt-1 flex justify-between border-t border-border pt-2 text-base font-black">
            <dt>{t("checkout.thanks.totalPaid")}</dt>
            <dd>{formatPrice(order.total)}</dd>
          </div>
        </dl>

        {order.estimatedDelivery && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-klusr-stock/10 p-3 text-sm font-semibold text-klusr-stock">
            <Truck className="h-4 w-4 shrink-0" />
            {t("checkout.thanks.expectedDelivery", { date: formatDate(order.estimatedDelivery) })}
          </div>
        )}
      </div>

      {/* Iets vergeten? — 15-min venster, geen extra verzendkosten */}
      <ReorderUpsell />

      {/* Hoofd-CTA's */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg" className="flex-1">
          <Link href={`/bestelstatus?ref=${order.reference}`}>
            {t("checkout.thanks.trackOrder")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="flex-1">
          <Link href="/">{t("checkout.thanks.continueShopping")}</Link>
        </Button>
      </div>
      <p className="mt-3 text-center text-sm">
        <Link
          href={`/factuur/${order.id}`}
          className="font-semibold text-primary hover:underline"
        >
          {t("checkout.thanks.downloadInvoice")}
        </Link>
      </p>

      {/* Bezorgadres + klushulp/trust */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-4 text-sm">
          <p className="mb-1 flex items-center gap-1.5 font-semibold">
            <MapPin className="h-4 w-4 text-primary" /> {t("checkout.thanks.deliveryAddress")}
          </p>
          <p className="text-muted-foreground">
            {order.customer.firstName} {order.customer.lastName}
            <br />
            {order.customer.street}
            <br />
            {order.customer.postalCode} {order.customer.city}
          </p>
        </div>
        <NeedHelpCard />
      </div>
    </>
  );
}

/** Order-tijdlijn als nette visuele stappen (eerste stap is actief). */
function OrderTimeline({ className }: { className?: string }) {
  const steps = [
    {
      icon: Mail,
      title: t("checkout.thanks.step.confirmation.title"),
      hint: t("checkout.thanks.step.confirmation.hint"),
      active: true,
    },
    {
      icon: Package,
      title: t("checkout.thanks.step.packing.title"),
      hint: t("checkout.thanks.step.packing.hint"),
      active: false,
    },
    {
      icon: Truck,
      title: t("checkout.thanks.step.onTheWay.title"),
      hint: t("checkout.thanks.step.onTheWay.hint"),
      active: false,
    },
  ];

  return (
    <div className={cn("rounded-2xl border border-border bg-card p-5 shadow-card", className)}>
      <ol className="grid grid-cols-3 gap-2">
        {steps.map((s, idx) => (
          <li key={s.title} className="relative flex flex-col items-center text-center">
            {/* Verbindingslijn naar de volgende stap */}
            {idx < steps.length - 1 && (
              <span
                aria-hidden
                className={cn(
                  "absolute left-1/2 top-5 -z-0 h-0.5 w-full",
                  s.active ? "bg-klusr-stock/40" : "bg-border",
                )}
              />
            )}
            <span
              className={cn(
                "relative z-10 grid h-10 w-10 place-items-center rounded-full ring-4 ring-card",
                s.active
                  ? "bg-klusr-stock text-white"
                  : "bg-secondary text-muted-foreground",
              )}
            >
              <s.icon className="h-4 w-4" />
            </span>
            <p className="mt-2 text-sm font-semibold leading-tight">{s.title}</p>
            <p className="text-xs text-muted-foreground">{s.hint}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* In verwerking — open/pending: neutraal, met lichte auto-refresh.            */
/* ────────────────────────────────────────────────────────────────────────── */

function PendingView({ order }: { order: Order }) {
  return (
    <>
      {/* Pollt de server-component (~4s) tot de webhook de status bijwerkt. */}
      <PaymentStatusPoller />

      <div className="animate-slide-up overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-secondary/50 to-card p-8 text-center sm:p-10">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-secondary text-foreground ring-8 ring-secondary/40">
          <Loader2 className="h-10 w-10 animate-spin" />
        </span>
        <h1 className="mt-5 text-2xl font-black tracking-tight sm:text-3xl">
          {t("checkout.pending.title")}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          {t("checkout.pending.text")}
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          {t("checkout.pending.hint")}
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          {t("checkout.failed.orderRef", { ref: order.reference })}
        </p>

        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild variant="outline" size="lg">
            {/* Plain link → volledige reload haalt de verse status op. */}
            <a href={`/bedankt?order=${order.id}`}>{t("checkout.pending.refreshNow")}</a>
          </Button>
          <Button asChild variant="ghost" size="lg">
            <Link href="/">{t("checkout.pending.backHome")}</Link>
          </Button>
        </div>
      </div>

      <NeedHelpCard className="mt-6" />
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Mislukt — failed/canceled/expired: geen succes-styling, geen purchase.      */
/* ────────────────────────────────────────────────────────────────────────── */

function FailedView({ order }: { order: Order }) {
  const title =
    order.paymentStatus === "canceled"
      ? t("checkout.failed.canceledTitle")
      : order.paymentStatus === "expired"
        ? t("checkout.failed.expiredTitle")
        : t("checkout.failed.title");

  return (
    <>
      {/* Bewust GÉÉN PurchaseTracker en GÉÉN ClearCart: geen nep-conversie en de
          winkelwagen blijft bewaard voor "Opnieuw proberen". */}
      <div className="animate-slide-up overflow-hidden rounded-3xl border border-destructive/25 bg-gradient-to-b from-destructive/10 to-card p-8 text-center sm:p-10">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-destructive text-destructive-foreground ring-8 ring-destructive/15">
          <XCircle className="h-11 w-11" />
        </span>
        <h1 className="mt-5 text-2xl font-black tracking-tight sm:text-3xl">{title}</h1>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          {t("checkout.failed.text")} {t("checkout.failed.cartKept")}
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          {t("checkout.failed.orderRef", { ref: order.reference })}
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="flex-1 sm:flex-none sm:px-8">
            <Link href="/checkout">
              <RotateCcw className="h-4 w-4" />
              {t("checkout.failed.retry")}
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="flex-1 sm:flex-none sm:px-8">
            <Link href="/winkelwagen">
              <ShoppingCart className="h-4 w-4" />
              {t("checkout.failed.toCart")}
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-4 text-center text-sm">
        <Link
          href="/klantenservice"
          className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
        >
          <Headphones className="h-4 w-4" />
          {t("checkout.failed.help")}
        </Link>
      </div>
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Gedeelde stukken                                                            */
/* ────────────────────────────────────────────────────────────────────────── */

function ConfirmationHeader() {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-klusr-stock text-white">
        <CheckCircle2 className="h-9 w-9" />
      </span>
      <h1 className="mt-4 text-3xl font-black">{t("checkout.thanks.title")}</h1>
      <p className="mt-2 text-muted-foreground">{t("checkout.thanks.text")}</p>
    </div>
  );
}

/** Trust-/klushulp-blok — herbruikbaar op de succes- en pending-view. */
function NeedHelpCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
          <Headphones className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-semibold">{t("checkout.thanks.needHelp.title")}</p>
          <p className="text-xs text-muted-foreground">{t("checkout.thanks.needHelp.text")}</p>
        </div>
      </div>
      <Button asChild variant="outline" size="sm" className="shrink-0">
        <Link href="/klantenservice">{t("checkout.thanks.needHelp.cta")}</Link>
      </Button>
    </div>
  );
}
