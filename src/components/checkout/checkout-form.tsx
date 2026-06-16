"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Loader2,
  Lock,
  ShieldCheck,
  Truck,
  Store,
  RotateCcw,
  ArrowLeft,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ColorChip } from "@/components/cart/color-chip";
import { PaymentMethods, type PaymentMethodId } from "./payment-methods";
import { MollieCard, type MollieCardHandle } from "./mollie-card";
import {
  useCart,
  cartSummary,
  displayLine,
  shippingFor,
} from "@/lib/store/cart";
import { usePricingMode } from "@/lib/store/pricing-mode";
import { useMounted } from "@/lib/hooks/use-mounted";
import { trackEvent } from "@/lib/tracking";
import { formatPrice, cn } from "@/lib/utils";

const schema = z.object({
  email: z.string().email("Vul een geldig e-mailadres in"),
  firstName: z.string().min(1, "Verplicht"),
  lastName: z.string().min(1, "Verplicht"),
  street: z.string().min(3, "Vul je straat en huisnummer in"),
  postalCode: z
    .string()
    .regex(/^\d{4}\s?[A-Za-z]{2}$/, "Bijv. 7443 BR"),
  city: z.string().min(1, "Verplicht"),
  phone: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function CheckoutForm({
  mollieProfile,
  mollieTest,
}: {
  mollieProfile?: string;
  mollieTest?: boolean;
}) {
  const { items, kluspasActive } = useCart();
  const mounted = useMounted();
  const mode = usePricingMode((s) => s.mode);
  const [shippingMethod, setShippingMethod] = useState<"standard" | "pickup">("standard");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>("ideal");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cardRef = useRef<MollieCardHandle>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  if (!mounted) {
    return <div className="container-klusr py-16 text-center text-muted-foreground">Laden…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="container-klusr py-16 text-center">
        <h1 className="text-2xl font-extrabold">Je winkelwagen is leeg</h1>
        <p className="mt-1 text-muted-foreground">Voeg eerst producten toe om af te rekenen.</p>
        <Button asChild className="mt-5">
          <Link href="/categorie/verf">Naar het assortiment</Link>
        </Button>
      </div>
    );
  }

  const summary = cartSummary(
    items,
    mode,
    kluspasActive,
    shippingMethod === "pickup" ? 0 : undefined,
  );

  const useMollieComponents = paymentMethod === "creditcard" && Boolean(mollieProfile);

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    setError(null);

    // Mollie Components: maak client-side een card-token aan (blijft op onze pagina).
    let cardToken: string | null = null;
    if (useMollieComponents) {
      cardToken = (await cardRef.current?.createToken()) ?? null;
      if (!cardToken) {
        setError("Controleer je kaartgegevens en probeer het opnieuw.");
        setSubmitting(false);
        return;
      }
    }

    trackEvent("add_shipping_info", { shipping_tier: shippingMethod, value: summary.total });
    trackEvent("add_payment_info", { payment_type: paymentMethod, value: summary.total });

    try {
      const res = await fetch("/api/checkout/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: values,
          items,
          subtotal: summary.grossSubtotal,
          shipping: summary.grossShipping,
          total: summary.grossTotal,
          kluspasSavings: summary.savings,
          method: paymentMethod,
          ...(cardToken ? { cardToken } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Betaling aanmaken mislukt");
      // Redirect to Mollie hosted checkout (or the thank-you page in demo mode).
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er ging iets mis");
      setSubmitting(false);
    }
  }

  return (
    <div className="container-klusr py-6">
      <Link
        href="/winkelwagen"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Terug naar winkelwagen
      </Link>
      <h1 className="mb-6 text-2xl font-extrabold sm:text-3xl">Afrekenen</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* Left: details */}
        <div className="space-y-6">
          {/* Account of als gast */}
          <div className="rounded-xl border border-border bg-secondary/40 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2.5">
                <UserRound className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-semibold">
                    Reken af als gast — geen account nodig
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Vul hieronder je gegevens in en bestel direct. Liever een account voor je
                    bestelhistorie en sneller afrekenen?
                  </p>
                </div>
              </div>
              <Button asChild variant="outline" size="sm" className="shrink-0">
                <Link href="/inloggen">Inloggen of account aanmaken</Link>
              </Button>
            </div>
          </div>

          <Section title="Contactgegevens" step={1}>
            <Field label="E-mailadres" error={errors.email?.message}>
              <Input type="email" placeholder="jij@voorbeeld.nl" {...register("email")} />
            </Field>
          </Section>

          <Section title="Bezorgadres" step={2}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Voornaam" error={errors.firstName?.message}>
                <Input {...register("firstName")} />
              </Field>
              <Field label="Achternaam" error={errors.lastName?.message}>
                <Input {...register("lastName")} />
              </Field>
            </div>
            <Field label="Straat en huisnummer" error={errors.street?.message}>
              <Input placeholder="Grotestraat 124" {...register("street")} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Postcode" error={errors.postalCode?.message}>
                <Input placeholder="7443 BR" {...register("postalCode")} />
              </Field>
              <Field label="Plaats" error={errors.city?.message}>
                <Input placeholder="Nijverdal" {...register("city")} />
              </Field>
            </div>
            <Field label="Telefoon (optioneel)" error={errors.phone?.message}>
              <Input type="tel" {...register("phone")} />
            </Field>
          </Section>

          <Section title="Verzendmethode" step={3}>
            <div className="space-y-2">
              <ShippingOption
                active={shippingMethod === "standard"}
                onClick={() => setShippingMethod("standard")}
                icon={Truck}
                title="Bezorgen"
                hint="Voor 16:00 besteld, morgen in huis"
                price={
                  shippingFor(summary.grossSubtotal) === 0
                    ? "Gratis"
                    : formatPrice(shippingFor(summary.grossSubtotal))
                }
              />
              <ShippingOption
                active={shippingMethod === "pickup"}
                onClick={() => setShippingMethod("pickup")}
                icon={Store}
                title="Afhalen in de winkel"
                hint="Gratis — klaar binnen 1 uur in Nijverdal"
                price="Gratis"
              />
            </div>
          </Section>

          <Section title="Betaalmethode" step={4}>
            <PaymentMethods value={paymentMethod} onChange={setPaymentMethod} />
            {useMollieComponents && (
              <div className="mt-4">
                <MollieCard ref={cardRef} profileId={mollieProfile!} testmode={Boolean(mollieTest)} />
              </div>
            )}
          </Section>
        </div>

        {/* Right: order summary */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-4 text-lg font-bold">Je bestelling</h2>
            <ul className="max-h-72 space-y-3 overflow-y-auto">
              {items.map((item) => (
                <li key={item.key} className="flex gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded border border-border bg-white">
                    <Image src={item.image} alt={item.title} fill sizes="56px" className="object-cover" />
                    <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-klusr-black px-1 text-[10px] font-bold text-white">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.variantLabel}</p>
                    {item.selectedColor && (
                      <ColorChip color={item.selectedColor} className="mt-1" />
                    )}
                  </div>
                  <span className="text-sm font-semibold">
                    {formatPrice(displayLine(item, mode, kluspasActive).main)}
                  </span>
                </li>
              ))}
            </ul>

            <Separator className="my-4" />
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  Subtotaal{!summary.vatIncluded && " (excl. btw)"}
                </dt>
                <dd>{formatPrice(summary.subtotalRegular)}</dd>
              </div>
              {summary.savings > 0 && (
                <div className="flex justify-between text-primary">
                  <dt className="font-medium">
                    {summary.vatIncluded ? "KLUSRPAS-voordeel" : "ProfPas-korting"}
                  </dt>
                  <dd className="font-bold">-{formatPrice(summary.savings)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  Verzendkosten{!summary.vatIncluded && " (excl. btw)"}
                </dt>
                <dd>{summary.shipping === 0 ? <span className="text-klusr-stock">Gratis</span> : formatPrice(summary.shipping)}</dd>
              </div>
              {summary.vat !== undefined && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Btw (21%)</dt>
                  <dd>{formatPrice(summary.vat)}</dd>
                </div>
              )}
            </dl>
            <Separator className="my-3" />
            <div className="flex items-baseline justify-between">
              <span className="font-bold">Totaal</span>
              <span className="text-2xl font-black">{formatPrice(summary.total)}</span>
            </div>
            {!summary.vatIncluded && (
              <p className="mt-1 text-xs text-muted-foreground">Incl. btw</p>
            )}

            {error && (
              <p className="mt-3 rounded-md bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
                {error}
              </p>
            )}

            <Button type="submit" size="xl" className="mt-4 w-full" disabled={submitting}>
              {submitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Betaal {formatPrice(summary.total)}
                </>
              )}
            </Button>

            <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-klusr-stock" />
              Veilig betalen via Mollie
            </div>
            <ul className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <RotateCcw className="h-3.5 w-3.5 text-primary" /> Gratis retour
              </li>
              <li className="flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5 text-primary" /> Snelle levering
              </li>
            </ul>
          </div>
        </aside>
      </form>
    </div>
  );
}

function Section({
  title,
  step,
  children,
}: {
  title: string;
  step: number;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-xs font-bold text-white">
          {step}
        </span>
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs font-medium text-primary">{error}</p>}
    </div>
  );
}

function ShippingOption({
  active,
  onClick,
  icon: Icon,
  title,
  hint,
  price,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Truck;
  title: string;
  hint: string;
  price: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all",
        active ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-primary/40",
      )}
    >
      <Icon className="h-5 w-5 shrink-0 text-primary" />
      <span className="flex-1">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="block text-xs text-muted-foreground">{hint}</span>
      </span>
      <span className="text-sm font-bold text-klusr-stock">{price}</span>
    </button>
  );
}
