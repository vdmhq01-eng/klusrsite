"use client";

import { useEffect, useRef, useState } from "react";
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
  RotateCcw,
  ArrowLeft,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ColorChip } from "@/components/cart/color-chip";
import { PaymentMethods } from "./payment-methods";
import { MollieCard, type MollieCardHandle } from "./mollie-card";
import type { PaymentMethodInfo } from "@/types";
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
  postalCode: z.string().regex(/^\d{4}\s?[A-Za-z]{2}$/, "Bijv. 7443 BR"),
  houseNumber: z.string().min(1, "Verplicht"),
  houseNumberAddition: z.string().optional(),
  street: z.string().min(2, "Vul je straatnaam in"),
  city: z.string().min(1, "Verplicht"),
  phone: z.string().optional(),
  // Zakelijk (optioneel; alleen getoond/relevant in zakelijke modus).
  companyName: z.string().optional(),
  cocNumber: z.string().optional(),
  vatNumber: z.string().optional(),
  terms: z.boolean().refine((v) => v === true, {
    message: "Ga akkoord met de algemene voorwaarden om te bestellen.",
  }),
  newsletter: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

const MOLLIE_ICON = "https://www.mollie.com/external/icons/payment-methods";
/** Fallback wanneer de methodenroute onverhoopt niet bereikbaar is. */
const FALLBACK_METHODS: PaymentMethodInfo[] = [
  { id: "ideal", label: "iDEAL", image: `${MOLLIE_ICON}/ideal.svg` },
  { id: "bancontact", label: "Bancontact", image: `${MOLLIE_ICON}/bancontact.svg` },
  { id: "creditcard", label: "Creditcard", image: `${MOLLIE_ICON}/creditcard.svg` },
  { id: "klarna", label: "Achteraf betalen met Klarna", image: `${MOLLIE_ICON}/klarna.svg` },
];

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
  // Geen voorgekozen methode — de klant kiest bewust zelf.
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [issuer, setIssuer] = useState<string | null>(null);
  const [methods, setMethods] = useState<PaymentMethodInfo[]>([]);
  const [methodsLoading, setMethodsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lookingUp, setLookingUp] = useState(false);
  const cardRef = useRef<MollieCardHandle>(null);

  // Geactiveerde betaalmethoden (incl. officiële logo's + iDEAL-banken) ophalen.
  useEffect(() => {
    let active = true;
    const total = cartSummary(items, mode, kluspasActive).grossTotal;
    const qs = total > 0 ? `?amount=${total.toFixed(2)}` : "";
    setMethodsLoading(true);
    fetch(`/api/checkout/payment-methods${qs}`)
      .then((r) => r.json())
      .then((d: { methods?: PaymentMethodInfo[] }) => {
        if (!active) return;
        setMethods(d.methods?.length ? d.methods : FALLBACK_METHODS);
        setMethodsLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setMethods(FALLBACK_METHODS);
        setMethodsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [items, mode, kluspasActive]);

  // Billie is alleen zakelijk: deselecteer 'm als de klant naar particulier wisselt.
  useEffect(() => {
    if (mode !== "zakelijk" && paymentMethod === "billie") setPaymentMethod(null);
  }, [mode, paymentMethod]);

  function selectMethod(id: string) {
    setPaymentMethod(id);
    // Bank-keuze alleen relevant voor iDEAL.
    if (id !== "ideal") setIssuer(null);
  }

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { terms: false, newsletter: false },
  });

  // "Winkelwagen-vergeten": zodra de klant een geldig e-mailadres invult, bewaren
  // we de winkelwagen (debounced) zodat de cron later een herinnering kan sturen.
  const watchedEmail = watch("email");
  const watchedFirstName = watch("firstName");
  useEffect(() => {
    const email = (watchedEmail || "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || items.length === 0) return;
    const timer = setTimeout(() => {
      const name = [watchedFirstName, getValues("lastName")].filter(Boolean).join(" ").trim();
      fetch("/api/cart/remember", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: name || undefined,
          items: items.map((i) => ({
            title: i.title,
            quantity: i.quantity,
            price: kluspasActive ? i.kluspasPrice : i.price,
            image: i.image,
            slug: i.slug,
          })),
          total: cartSummary(items, mode, kluspasActive).grossTotal,
        }),
      }).catch(() => {});
    }, 1200);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedEmail, watchedFirstName, items, mode, kluspasActive]);

  // Postcode + huisnummer → straat + plaats automatisch invullen (PDOK).
  async function lookupAddress() {
    const postcode = (getValues("postalCode") || "").replace(/\s/g, "").toUpperCase();
    const number = (getValues("houseNumber") || "").trim();
    if (!/^\d{4}[A-Z]{2}$/.test(postcode) || !number) return;
    setLookingUp(true);
    try {
      const res = await fetch(
        `/api/address-lookup?postcode=${encodeURIComponent(postcode)}&number=${encodeURIComponent(number)}`,
      );
      const data = await res.json();
      if (data.street) setValue("street", data.street, { shouldValidate: true });
      if (data.city) setValue("city", data.city, { shouldValidate: true });
    } catch {
      /* laat de velden gewoon handmatig invulbaar */
    } finally {
      setLookingUp(false);
    }
  }

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
  const selectedMethod = methods.find((m) => m.id === paymentMethod);
  // iDEAL met banklijst → eerst een bank kiezen voordat je kunt betalen.
  const needsIssuer = paymentMethod === "ideal" && (selectedMethod?.issuers?.length ?? 0) > 0;
  const canPay = Boolean(paymentMethod) && (!needsIssuer || Boolean(issuer));

  async function onSubmit(values: FormValues) {
    if (!paymentMethod) {
      setError("Kies eerst een betaalmethode.");
      return;
    }
    if (needsIssuer && !issuer) {
      setError("Kies eerst je bank voor iDEAL.");
      return;
    }
    setSubmitting(true);
    setError(null);

    let cardToken: string | null = null;
    if (useMollieComponents) {
      cardToken = (await cardRef.current?.createToken()) ?? null;
      if (!cardToken) {
        setError("Controleer je kaartgegevens en probeer het opnieuw.");
        setSubmitting(false);
        return;
      }
    }

    // Straat + huisnummer (+ toevoeging) samenvoegen voor het order-adres.
    const street = `${values.street} ${values.houseNumber}${
      values.houseNumberAddition ? `-${values.houseNumberAddition}` : ""
    }`.trim();
    const customer = {
      email: values.email,
      firstName: values.firstName,
      lastName: values.lastName,
      street,
      postalCode: values.postalCode,
      city: values.city,
      phone: values.phone,
      ...(mode === "zakelijk" && values.companyName?.trim()
        ? {
            company: values.companyName.trim(),
            cocNumber: values.cocNumber?.trim() || undefined,
            vatNumber: values.vatNumber?.trim() || undefined,
          }
        : {}),
    };

    // Optioneel inschrijven voor de nieuwsbrief (demo-safe, fire-and-forget).
    if (values.newsletter) {
      void fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email,
          firstName: values.firstName,
          lastName: values.lastName,
          source: "checkout",
        }),
      }).catch(() => {});
    }

    trackEvent("add_shipping_info", { shipping_tier: shippingMethod, value: summary.total });
    trackEvent("add_payment_info", { payment_type: paymentMethod, value: summary.total });

    try {
      const res = await fetch("/api/checkout/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer,
          items,
          subtotal: summary.grossSubtotal,
          shipping: summary.grossShipping,
          total: summary.grossTotal,
          kluspasSavings: summary.savings,
          method: paymentMethod,
          ...(issuer && paymentMethod === "ideal" ? { issuer } : {}),
          ...(cardToken ? { cardToken } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Betaling aanmaken mislukt");
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
          <div className="rounded-xl border border-border bg-secondary/40 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2.5">
                <UserRound className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-semibold">Reken af als gast — geen account nodig</p>
                  <p className="text-xs text-muted-foreground">
                    Vul hieronder je gegevens in en bestel direct. Liever een account voor je
                    bestelhistorie en sneller afrekenen?
                  </p>
                </div>
              </div>
              <Button asChild variant="outline" size="sm" className="shrink-0">
                <Link href="/registreren">Account aanmaken</Link>
              </Button>
            </div>
          </div>

          <Section title="Contactgegevens" step={1}>
            <Field label="E-mailadres" error={errors.email?.message}>
              <Input type="email" placeholder="jij@voorbeeld.nl" {...register("email")} />
            </Field>
            {mode === "zakelijk" && (
              <>
                <Field label="Bedrijfsnaam" error={errors.companyName?.message}>
                  <Input placeholder="Bedrijfsnaam B.V." {...register("companyName")} />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="KVK-nummer (optioneel)">
                    <Input placeholder="12345678" {...register("cocNumber")} />
                  </Field>
                  <Field label="BTW-nummer (optioneel)">
                    <Input placeholder="NL000000000B00" {...register("vatNumber")} />
                  </Field>
                </div>
              </>
            )}
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

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Postcode" error={errors.postalCode?.message}>
                <Input placeholder="7442 CK" {...register("postalCode", { onBlur: lookupAddress })} />
              </Field>
              <Field label="Huisnr." error={errors.houseNumber?.message}>
                <Input placeholder="3" {...register("houseNumber", { onBlur: lookupAddress })} />
              </Field>
              <Field label="Toevoeging">
                <Input placeholder="A" {...register("houseNumberAddition")} />
              </Field>
            </div>

            <Field
              label={lookingUp ? "Straat (adres ophalen…)" : "Straat"}
              error={errors.street?.message}
            >
              <Input placeholder="Wordt automatisch ingevuld" {...register("street")} />
            </Field>
            <Field label="Plaats" error={errors.city?.message}>
              <Input placeholder="Wordt automatisch ingevuld" {...register("city")} />
            </Field>

            <Field label="Telefoon (optioneel)" error={errors.phone?.message}>
              <Input type="tel" {...register("phone")} />
            </Field>
          </Section>

          <Section title="Verzendmethode" step={3}>
            <div className="space-y-2">
              <ShippingOption
                active
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
            </div>
          </Section>

          <Section title="Betaalmethode" step={4}>
            <PaymentMethods
              methods={mode === "zakelijk" ? methods : methods.filter((m) => m.id !== "billie")}
              value={paymentMethod}
              onChange={selectMethod}
              issuer={issuer}
              onIssuerChange={setIssuer}
              loading={methodsLoading}
            />
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
                    {item.selectedColor && <ColorChip color={item.selectedColor} className="mt-1" />}
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

            {/* Akkoord + nieuwsbrief */}
            <div className="mt-4 space-y-2">
              <label className="flex items-start gap-2 text-xs leading-snug">
                <input type="checkbox" {...register("terms")} className="mt-0.5 h-4 w-4 shrink-0 accent-primary" />
                <span>
                  Ik ga akkoord met de{" "}
                  <Link href="/voorwaarden" target="_blank" className="font-medium text-primary hover:underline">
                    algemene voorwaarden
                  </Link>{" "}
                  en het{" "}
                  <Link href="/privacy" target="_blank" className="font-medium text-primary hover:underline">
                    privacybeleid
                  </Link>
                  .
                </span>
              </label>
              {errors.terms && (
                <p className="text-xs font-medium text-primary">{errors.terms.message}</p>
              )}
              <label className="flex items-start gap-2 text-xs leading-snug">
                <input type="checkbox" {...register("newsletter")} className="mt-0.5 h-4 w-4 shrink-0 accent-primary" />
                <span>Houd me op de hoogte van klustips en KLUSRPAS-aanbiedingen (nieuwsbrief).</span>
              </label>
            </div>

            {error && (
              <p className="mt-3 rounded-md bg-destructive/5 px-3 py-2 text-sm font-medium text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" size="xl" className="mt-4 w-full" disabled={submitting || !canPay}>
              {submitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Betaal {formatPrice(summary.total)}
                </>
              )}
            </Button>
            {!canPay && (
              <p className="mt-2 text-center text-xs text-muted-foreground">
                {needsIssuer ? "Kies je bank om verder te gaan." : "Kies eerst een betaalmethode."}
              </p>
            )}

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
