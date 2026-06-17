import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle2,
  Package,
  Truck,
  Mail,
  ArrowRight,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PurchaseTracker } from "@/components/checkout/purchase-tracker";
import { ClearCart } from "@/components/checkout/clear-cart";
import { ReorderUpsell } from "@/components/checkout/reorder-upsell";
import { GoogleCustomerReviews } from "@/components/checkout/google-customer-reviews";
import { getOrder } from "@/lib/store/orders";
import { formatPrice, formatDate } from "@/lib/utils";
import { t } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Bedankt voor je bestelling",
  robots: { index: false, follow: false },
};

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: { order?: string; demo?: string };
}) {
  const order = searchParams.order ? await getOrder(searchParams.order) : undefined;

  return (
    <div className="container-klusr py-10">
      {/* Mand altijd legen na het afrekenen (ook als de order niet geladen kon worden). */}
      {(searchParams.order || searchParams.demo) && <ClearCart />}
      <div className="mx-auto max-w-2xl">
        {/* Confirmation header */}
        <div className="flex flex-col items-center text-center">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-klusr-stock text-white">
            <CheckCircle2 className="h-9 w-9" />
          </span>
          <h1 className="mt-4 text-3xl font-black">{t("checkout.thanks.title")}</h1>
          <p className="mt-2 text-muted-foreground">
            {t("checkout.thanks.text")}
            {order && (
              <>
                {t("checkout.thanks.confirmationSentPre")}
                <strong className="text-foreground">{order.customer.email}</strong>{t("checkout.thanks.confirmationSentPost")}
              </>
            )}
          </p>
        </div>

        {order ? (
          <>
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

            {/* Order card */}
            <div className="mt-8 rounded-xl border border-border bg-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs uppercase text-muted-foreground">{t("checkout.thanks.orderNumber")}</p>
                  <p className="text-lg font-black">{order.reference}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase text-muted-foreground">{t("checkout.thanks.orderDate")}</p>
                  <p className="font-semibold">{formatDate(order.createdAt)}</p>
                </div>
              </div>

              {order.items.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <ul className="space-y-2 text-sm">
                    {order.items.map((i) => (
                      <li key={i.key} className="flex justify-between">
                        <span className="text-muted-foreground">
                          {i.quantity}× {i.title}{" "}
                          <span className="text-xs">({i.variantLabel})</span>
                        </span>
                        <span className="font-medium">
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
                <div className="flex justify-between text-base font-black">
                  <dt>{t("checkout.thanks.totalPaid")}</dt>
                  <dd>{formatPrice(order.total)}</dd>
                </div>
              </dl>

              {order.estimatedDelivery && (
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-klusr-stock/10 p-3 text-sm font-medium text-klusr-stock">
                  <Truck className="h-4 w-4" />
                  {t("checkout.thanks.expectedDelivery", { date: formatDate(order.estimatedDelivery) })}
                </div>
              )}
            </div>

            {/* Iets vergeten? — 15-min venster, geen extra verzendkosten */}
            <ReorderUpsell />

            {/* Next steps */}
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <NextStep icon={Mail} title={t("checkout.thanks.step.confirmation.title")} hint={t("checkout.thanks.step.confirmation.hint")} />
              <NextStep icon={Package} title={t("checkout.thanks.step.packing.title")} hint={t("checkout.thanks.step.packing.hint")} />
              <NextStep icon={Truck} title={t("checkout.thanks.step.onTheWay.title")} hint={t("checkout.thanks.step.onTheWay.hint")} />
            </div>

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

            {/* Address */}
            <div className="mt-6 rounded-xl border border-border bg-card p-4 text-sm">
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
          </>
        ) : (
          <div className="mt-8 rounded-xl border border-border bg-card p-6 text-center">
            <p className="text-muted-foreground">
              {t("checkout.thanks.loadError")}
            </p>
            <Button asChild className="mt-4">
              <Link href="/">{t("checkout.thanks.backHome")}</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function NextStep({
  icon: Icon,
  title,
  hint,
}: {
  icon: typeof Mail;
  title: string;
  hint: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
    </div>
  );
}
