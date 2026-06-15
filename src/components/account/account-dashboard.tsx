"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CreditCard,
  Heart,
  Info,
  Package,
  PiggyBank,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { seededOrders } from "@/lib/store/orders";
import { useFavorites } from "@/lib/store/favorites";
import { useMounted } from "@/lib/hooks/use-mounted";
import { formatDate, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  orderStatusBadgeVariant,
  orderStatusLabel,
} from "./order-status-meta";

/** Demo account — there is no real authentication behind this page. */
const DEMO = {
  firstName: "Demo",
  lastName: "Klant",
  email: "klant@voorbeeld.nl",
  phone: "06 - 12 34 56 78",
  street: "Grotestraat 1",
  postalCode: "7443 BR",
  city: "Nijverdal",
  memberNumber: "KP 4815 2042",
  memberSince: "maart 2025",
  spaartegoed: 12.5,
  jaarvoordeel: 87.4,
};

export function AccountDashboard() {
  const mounted = useMounted();
  const favoriteCount = useFavorites((s) => s.ids.length);
  const favorites = mounted ? favoriteCount : 0;

  const openOrders = seededOrders.filter(
    (o) => !["delivered", "canceled", "failed", "expired"].includes(o.paymentStatus),
  ).length;

  return (
    <Tabs defaultValue="overzicht" className="w-full">
      <TabsList className="w-full">
        <TabsTrigger value="overzicht">Overzicht</TabsTrigger>
        <TabsTrigger value="bestellingen">Bestellingen</TabsTrigger>
        <TabsTrigger value="gegevens">Gegevens</TabsTrigger>
        <TabsTrigger value="kluspas">Kluspas</TabsTrigger>
      </TabsList>

      {/* ---------------------------------------------------------- Overzicht */}
      <TabsContent value="overzicht">
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-2xl font-black tracking-tight">
              Welkom terug, {DEMO.firstName}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Fijn dat je er weer bent. Hier vind je je bestellingen, favorieten
              en Kluspas-voordeel.
            </p>
          </div>

          {/* Quick stat tiles */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <StatTile
              icon={<Package className="h-5 w-5" />}
              label="Open bestellingen"
              value={String(openOrders)}
            />
            <StatTile
              icon={<Heart className="h-5 w-5" />}
              label="Favorieten"
              value={mounted ? String(favorites) : "—"}
            />
            <StatTile
              icon={<PiggyBank className="h-5 w-5" />}
              label="Kluspas-voordeel dit jaar"
              value={formatPrice(DEMO.jaarvoordeel)}
              accent
            />
            <StatTile
              icon={<CreditCard className="h-5 w-5" />}
              label="Spaartegoed"
              value={formatPrice(DEMO.spaartegoed)}
            />
          </div>

          {/* Shortcuts */}
          <div className="grid gap-3 sm:grid-cols-3">
            <ShortcutCard
              href="/account/favorieten"
              icon={<Heart className="h-5 w-5" />}
              title="Mijn favorieten"
              description="Bekijk je bewaarde producten"
            />
            <ShortcutCard
              href="/bestelstatus"
              icon={<Truck className="h-5 w-5" />}
              title="Volg je bestelling"
              description="Bekijk de status van je bestelling"
            />
            <ShortcutCard
              href="/kluspas"
              icon={<CreditCard className="h-5 w-5" />}
              title="Kluspas-voordeel"
              description="Ontdek al je ledenvoordelen"
            />
          </div>

          <DemoNotice />
        </div>
      </TabsContent>

      {/* ------------------------------------------------------- Bestellingen */}
      <TabsContent value="bestellingen">
        <Card>
          <CardHeader>
            <CardTitle>Mijn bestellingen</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {seededOrders.length === 0 ? (
              <EmptyOrders />
            ) : (
              seededOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/bestelstatus?ref=${encodeURIComponent(order.reference)}`}
                  className="group flex flex-col gap-3 rounded-lg border border-border p-4 transition-colors hover:border-primary/40 hover:bg-secondary/40 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-secondary text-muted-foreground">
                      <Package className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-bold">{order.reference}</p>
                      <p className="text-xs text-muted-foreground">
                        Besteld op {formatDate(order.createdAt)}
                        {order.items.length > 0 &&
                          ` · ${order.items.reduce((n, i) => n + i.quantity, 0)} artikelen`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <Badge variant={orderStatusBadgeVariant[order.paymentStatus]}>
                      {orderStatusLabel[order.paymentStatus]}
                    </Badge>
                    <span className="text-sm font-bold">
                      {formatPrice(order.total)}
                    </span>
                    <ArrowRight className="hidden h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary sm:block" />
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* ----------------------------------------------------------- Gegevens */}
      <TabsContent value="gegevens">
        <ProfileForm />
      </TabsContent>

      {/* ------------------------------------------------------------ Kluspas */}
      <TabsContent value="kluspas">
        <KluspasPanel />
      </TabsContent>
    </Tabs>
  );
}

/* ------------------------------------------------------------------ tiles */

function StatTile({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <Card className="flex flex-col gap-2 p-4">
      <span
        className={
          accent
            ? "grid h-9 w-9 place-items-center rounded-md bg-primary/10 text-primary"
            : "grid h-9 w-9 place-items-center rounded-md bg-secondary text-muted-foreground"
        }
      >
        {icon}
      </span>
      <div>
        <p className="text-xl font-black leading-none tracking-tight">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      </div>
    </Card>
  );
}

function ShortcutCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-lg border border-border bg-card p-4 shadow-card transition-shadow hover:shadow-card-hover"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
    </Link>
  );
}

function DemoNotice() {
  return (
    <p className="flex items-start gap-2 rounded-lg bg-secondary/60 p-3 text-xs text-muted-foreground">
      <Info className="mt-0.5 h-4 w-4 shrink-0" />
      <span>
        Dit is een demo-account ter illustratie. Er is geen echte login en de
        getoonde gegevens zijn voorbeelddata.
      </span>
    </p>
  );
}

function EmptyOrders() {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-secondary text-muted-foreground">
        <Package className="h-6 w-6" />
      </span>
      <p className="text-sm font-semibold">Je hebt nog geen bestellingen</p>
      <p className="max-w-xs text-sm text-muted-foreground">
        Zodra je iets bestelt, vind je hier de status en je bestelhistorie terug.
      </p>
      <Button asChild size="sm" className="mt-1">
        <Link href="/categorie/verf">
          Start met shoppen
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}

/* ----------------------------------------------------------------- gegevens */

function ProfileForm() {
  const [profile, setProfile] = useState({
    firstName: DEMO.firstName,
    lastName: DEMO.lastName,
    email: DEMO.email,
    phone: DEMO.phone,
    street: DEMO.street,
    postalCode: DEMO.postalCode,
    city: DEMO.city,
  });

  function update(key: keyof typeof profile) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setProfile((p) => ({ ...p, [key]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    toast.success("Opgeslagen", {
      description: "Je gegevens zijn bijgewerkt (demo).",
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Persoonlijke gegevens</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field id="firstName" label="Voornaam" value={profile.firstName} onChange={update("firstName")} />
          <Field id="lastName" label="Achternaam" value={profile.lastName} onChange={update("lastName")} />
          <Field id="email" label="E-mailadres" type="email" value={profile.email} onChange={update("email")} />
          <Field id="phone" label="Telefoonnummer" type="tel" value={profile.phone} onChange={update("phone")} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bezorgadres</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field
            id="street"
            label="Straat en huisnummer"
            value={profile.street}
            onChange={update("street")}
            className="sm:col-span-2"
          />
          <Field id="postalCode" label="Postcode" value={profile.postalCode} onChange={update("postalCode")} />
          <Field id="city" label="Plaats" value={profile.city} onChange={update("city")} />
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit">Bewerken opslaan</Button>
        <span className="text-xs text-muted-foreground">
          Demo — wijzigingen worden niet echt opgeslagen.
        </span>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  className,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label htmlFor={id} className="mb-1.5 block">
        {label}
      </Label>
      <Input id={id} type={type} value={value} onChange={onChange} autoComplete="off" />
    </div>
  );
}

/* ------------------------------------------------------------------ kluspas */

const KLUSPAS_BENEFITS = [
  "Altijd de scherpe Kluspasprijs op het hele assortiment",
  "Spaar voor extra voordeel bij elke aankoop",
  "Gratis kleuradvies en kleur op maat laten mengen",
  "Exclusieve ledenacties en vroege toegang tot aanbiedingen",
];

function KluspasPanel() {
  return (
    <div className="flex flex-col gap-6">
      {/* Visual Kluspas card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-klusr-black via-klusr-black to-klusr-red-dark p-6 text-white shadow-card-hover sm:p-8">
        <div className="klusr-stripes pointer-events-none absolute inset-0 opacity-50" />
        <div className="relative flex flex-col gap-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">
                KLUSR
              </p>
              <p className="mt-1 text-2xl font-black tracking-tight">Kluspas</p>
            </div>
            <CreditCard className="h-7 w-7 text-klusr-action" />
          </div>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-white/60">
                Pashouder
              </p>
              <p className="text-lg font-bold">
                {DEMO.firstName} {DEMO.lastName}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-wide text-white/60">
                Lidnummer
              </p>
              <p className="font-mono text-sm font-semibold tracking-wider">
                {DEMO.memberNumber}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Jouw Kluspas-voordeel</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-secondary/60 p-4">
              <p className="text-xl font-black tracking-tight text-primary">
                {formatPrice(DEMO.jaarvoordeel)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Bespaard dit jaar
              </p>
            </div>
            <div className="rounded-lg bg-secondary/60 p-4">
              <p className="text-xl font-black tracking-tight">
                {formatPrice(DEMO.spaartegoed)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Spaartegoed</p>
            </div>
          </div>

          <Separator />

          <ul className="flex flex-col gap-2.5">
            {KLUSPAS_BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2.5 text-sm">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <CreditCard className="h-3 w-3" />
                </span>
                {benefit}
              </li>
            ))}
          </ul>

          <p className="text-xs text-muted-foreground">
            Lid sinds {DEMO.memberSince}.
          </p>

          <Button asChild variant="outline" className="w-full sm:w-fit">
            <Link href="/kluspas">
              Meer over de Kluspas
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
