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
import { getOrder } from "@/lib/store/orders";
import { formatPrice, formatDate } from "@/lib/utils";

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
          <h1 className="mt-4 text-3xl font-black">Bedankt voor je bestelling!</h1>
          <p className="mt-2 text-muted-foreground">
            We hebben je bestelling ontvangen en gaan er direct mee aan de slag.
            {order && (
              <>
                {" "}
                Een bevestiging is verstuurd naar{" "}
                <strong className="text-foreground">{order.customer.email}</strong>.
              </>
            )}
          </p>
        </div>

        {order ? (
          <>
            <PurchaseTracker order={order} />

            {/* Order card */}
            <div className="mt-8 rounded-xl border border-border bg-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Bestelnummer</p>
                  <p className="text-lg font-black">{order.reference}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase text-muted-foreground">Besteldatum</p>
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
                  <dt className="text-muted-foreground">Subtotaal</dt>
                  <dd>{formatPrice(order.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Verzendkosten</dt>
                  <dd>
                    {order.shipping === 0 ? (
                      <span className="text-klusr-stock">Gratis</span>
                    ) : (
                      formatPrice(order.shipping)
                    )}
                  </dd>
                </div>
                <div className="flex justify-between text-base font-black">
                  <dt>Totaal betaald</dt>
                  <dd>{formatPrice(order.total)}</dd>
                </div>
              </dl>

              {order.estimatedDelivery && (
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-klusr-stock/10 p-3 text-sm font-medium text-klusr-stock">
                  <Truck className="h-4 w-4" />
                  Verwachte bezorging: {formatDate(order.estimatedDelivery)}
                </div>
              )}
            </div>

            {/* Iets vergeten? — 15-min venster, geen extra verzendkosten */}
            <ReorderUpsell />

            {/* Next steps */}
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <NextStep icon={Mail} title="Bevestiging" hint="Check je inbox" />
              <NextStep icon={Package} title="Wordt ingepakt" hint="Vandaag nog" />
              <NextStep icon={Truck} title="Onderweg" hint="Volg je pakket" />
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="flex-1">
                <Link href={`/bestelstatus?ref=${order.reference}`}>
                  Volg je bestelling
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="flex-1">
                <Link href="/">Verder winkelen</Link>
              </Button>
            </div>
            <p className="mt-3 text-center text-sm">
              <Link
                href={`/factuur/${order.id}`}
                className="font-semibold text-primary hover:underline"
              >
                Download je factuur (PDF)
              </Link>
            </p>

            {/* Address */}
            <div className="mt-6 rounded-xl border border-border bg-card p-4 text-sm">
              <p className="mb-1 flex items-center gap-1.5 font-semibold">
                <MapPin className="h-4 w-4 text-primary" /> Bezorgadres
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
              We konden de bestelgegevens niet laden, maar je betaling is in goede orde
              ontvangen. Je ontvangt een bevestiging per e-mail.
            </p>
            <Button asChild className="mt-4">
              <Link href="/">Terug naar home</Link>
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
