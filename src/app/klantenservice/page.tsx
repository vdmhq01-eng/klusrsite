import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CreditCard,
  Globe,
  Mail,
  Mailbox,
  MapPin,
  MessageCircle,
  Palette,
  Phone,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Store,
  Truck,
} from "lucide-react";
import { flagshipStore } from "@/lib/data";
import { SHIPPING_COUNTRIES, BRIEVENBUS_PRICE } from "@/lib/shipping";
import { formatPrice } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/support/contact-form";
import { t } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Klantenservice",
  description:
    "Hulp nodig? Vind snel antwoord op je vraag over verzending, retourneren, betalen en garantie. Of neem contact op met de KLUSR klantenservice.",
  openGraph: {
    title: "Klantenservice | KLUSR",
    description:
      "Vind snel antwoord op je vraag over verzending, retour, betalen en garantie, of neem contact op.",
  },
};

// Tarieven komen rechtstreeks uit src/lib/shipping.ts, zodat de
// klantenservice-pagina nooit uit de pas loopt met het afrekenen.
const nlShipping = SHIPPING_COUNTRIES.find((c) => c.code === "NL")!;
const beShipping = SHIPPING_COUNTRIES.find((c) => c.code === "BE")!;
const euTiers = Array.from(
  SHIPPING_COUNTRIES.filter((c) => c.code !== "NL" && c.code !== "BE").reduce(
    (map, c) => map.set(c.price, [...(map.get(c.price) ?? []), c.name]),
    new Map<number, string[]>(),
  ),
).sort((a, b) => a[0] - b[0]);
const cheapestEu = euTiers[0]?.[0] ?? 0;

export default function KlantenservicePage() {
  // Prijzen blijven data-driven (formatPrice + shipping.ts); ze worden als
  // interpolatie doorgegeven zodat de teksten vertaalbaar zijn maar de bedragen
  // nooit uit de pas lopen met het afrekenen.
  const nlFree = formatPrice(nlShipping.freeOver!);
  const beFree = formatPrice(beShipping.freeOver!);
  const nlPrice = formatPrice(nlShipping.price);
  const bePrice = formatPrice(beShipping.price);
  const mailbox = formatPrice(BRIEVENBUS_PRICE.NL);
  const eu = formatPrice(cheapestEu);

  const contactCards = [
    {
      icon: Phone,
      title: t("service.contact.call.title"),
      description: t("service.contact.call.description"),
      actionLabel: flagshipStore.phone,
      href: `tel:${flagshipStore.phone.replace(/[\s-]/g, "")}`,
    },
    {
      icon: Mail,
      title: t("service.contact.mail.title"),
      description: t("service.contact.mail.description"),
      actionLabel: "klantenservice@klus-r.nl",
      href: "mailto:klantenservice@klus-r.nl",
    },
    {
      icon: Store,
      title: t("service.contact.store.title"),
      description: t("service.contact.store.description"),
      actionLabel: t("service.contact.store.action"),
      href: "/winkels",
    },
    {
      icon: MessageCircle,
      title: t("service.contact.ai.title"),
      description: t("service.contact.ai.description"),
      actionLabel: t("service.contact.ai.action"),
      href: "/klushulp",
    },
  ];

  const trustItems = [
    { icon: Truck, label: t("service.trust.delivery") },
    { icon: RotateCcw, label: t("service.trust.returns") },
    { icon: ShieldCheck, label: t("service.trust.payment") },
    { icon: Sparkles, label: t("service.trust.advice") },
    { icon: BadgeCheck, label: t("service.trust.warranty") },
  ];

  const shippingFaqs = [
    {
      question: t("service.faq.shipping.when.q"),
      answer: t("service.faq.shipping.when.a"),
    },
    {
      question: t("service.faq.shipping.cost.q"),
      answer: t("service.faq.shipping.cost.a", { nlFree, nlPrice, bePrice, mailbox, eu }),
    },
    {
      question: t("service.faq.shipping.abroad.q"),
      answer: t("service.faq.shipping.abroad.a", { beFree, eu }),
    },
    {
      question: t("service.faq.shipping.return.q"),
      answer: t("service.faq.shipping.return.a"),
    },
  ];

  const paymentFaqs = [
    {
      question: t("service.faq.payment.methods.q"),
      answer: t("service.faq.payment.methods.a"),
    },
    {
      question: t("service.faq.payment.afterwards.q"),
      answer: t("service.faq.payment.afterwards.a"),
    },
    {
      question: t("service.faq.payment.safe.q"),
      answer: t("service.faq.payment.safe.a"),
    },
  ];

  const warrantyFaqs = [
    {
      question: t("service.faq.warranty.products.q"),
      answer: t("service.faq.warranty.products.a"),
    },
    {
      question: t("service.faq.warranty.damaged.q"),
      answer: t("service.faq.warranty.damaged.a"),
    },
    {
      question: t("service.faq.warranty.store.q"),
      answer: t("service.faq.warranty.store.a"),
    },
  ];

  const mengverfFaqs = [
    {
      question: t("service.faq.mengverf.return.q"),
      answer: t("service.faq.mengverf.return.a"),
    },
    {
      question: t("service.faq.mengverf.match.q"),
      answer: t("service.faq.mengverf.match.a"),
    },
    {
      question: t("service.faq.mengverf.amount.q"),
      answer: t("service.faq.mengverf.amount.a"),
    },
    {
      question: t("service.faq.mengverf.instore.q"),
      answer: t("service.faq.mengverf.instore.a"),
    },
  ];

  const kluspasFaqs = [
    {
      question: t("service.faq.kluspas.what.q"),
      answer: t("service.faq.kluspas.what.a"),
    },
    {
      question: t("service.faq.kluspas.business.q"),
      answer: t("service.faq.kluspas.business.a"),
    },
    {
      question: t("service.faq.kluspas.invoice.q"),
      answer: t("service.faq.kluspas.invoice.a"),
    },
  ];

  const generalFaqs = [
    {
      question: t("service.faq.general.order.q"),
      answer: t("service.faq.general.order.a"),
    },
    {
      question: t("service.faq.general.account.q"),
      answer: t("service.faq.general.account.a"),
    },
    {
      question: t("service.faq.general.mix.q"),
      answer: t("service.faq.general.mix.a"),
    },
  ];

  const faqGroups = [
    {
      id: "verzending",
      title: t("service.group.shipping.title"),
      icon: Truck,
      intro: t("service.group.shipping.intro", { free: nlFree, eu }),
      faqs: shippingFaqs,
    },
    {
      id: "betalen",
      title: t("service.group.payment.title"),
      icon: CreditCard,
      intro: t("service.group.payment.intro"),
      faqs: paymentFaqs,
    },
    {
      id: "garantie",
      title: t("service.group.warranty.title"),
      icon: ShieldCheck,
      intro: t("service.group.warranty.intro"),
      faqs: warrantyFaqs,
    },
    {
      id: "mengverf",
      title: t("service.group.mengverf.title"),
      icon: Palette,
      intro: t("service.group.mengverf.intro"),
      faqs: mengverfFaqs,
    },
    {
      id: "kluspas",
      title: t("service.group.kluspas.title"),
      icon: BadgeCheck,
      intro: t("service.group.kluspas.intro"),
      faqs: kluspasFaqs,
    },
  ];

  return (
    <div className="flex flex-col gap-12 py-8 sm:gap-16">
      {/* Hero */}
      <section className="container-klusr">
        <p className="text-sm font-bold uppercase tracking-wide text-primary">
          {t("service.hero.kicker")}
        </p>
        <h1 className="mt-2 max-w-3xl text-3xl font-black tracking-tight text-balance sm:text-4xl lg:text-5xl">
          {t("service.hero.title")}
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
          {t("service.hero.subtitle")}
        </p>
      </section>

      {/* Trust strip */}
      <section className="container-klusr">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {trustItems.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex items-center gap-2 rounded-lg border border-border bg-card p-3 text-sm font-medium shadow-card"
            >
              <Icon className="h-5 w-5 shrink-0 text-primary" />
              {label}
            </li>
          ))}
        </ul>
      </section>

      {/* Quick contact cards */}
      <section className="container-klusr">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {contactCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group flex flex-col gap-2 rounded-lg border border-border bg-card p-5 shadow-card transition-shadow hover:shadow-card-hover"
            >
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
                <card.icon className="h-5 w-5" />
              </span>
              <h2 className="mt-1 font-bold">{card.title}</h2>
              <p className="text-sm text-muted-foreground">{card.description}</p>
              <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:underline">
                {card.actionLabel}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Verzendkosten — tarieven per land (data-driven uit shipping.ts) */}
      <section id="verzendkosten" className="container-klusr scroll-mt-24">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <Truck className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
              {t("service.shipping.title")}
            </h2>
            <p className="mt-1 max-w-2xl text-muted-foreground">
              {t("service.shipping.subtitle", { amount: nlFree })}
            </p>
          </div>
        </div>

        <div className="mt-4 max-w-3xl overflow-hidden rounded-xl border border-border shadow-card">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-4 py-3 font-medium">{t("service.shipping.rowNl")}</td>
                <td className="px-4 py-3 text-right">
                  <span className="font-semibold">{formatPrice(nlShipping.price)}</span>
                  <span className="text-muted-foreground">
                    {" "}{t("service.shipping.freeFrom", { amount: nlFree })}
                  </span>
                </td>
              </tr>
              <tr className="bg-secondary/40">
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <Mailbox className="h-4 w-4 text-primary" /> {t("service.shipping.mailbox")}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {t("service.shipping.mailboxHint")}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-semibold">
                  {formatPrice(BRIEVENBUS_PRICE.NL)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">{t("service.shipping.rowBe")}</td>
                <td className="px-4 py-3 text-right">
                  <span className="font-semibold">{formatPrice(beShipping.price)}</span>
                  <span className="text-muted-foreground">
                    {" "}{t("service.shipping.freeFrom", { amount: beFree })}
                  </span>
                </td>
              </tr>
              {euTiers.map(([price, names]) => (
                <tr key={price}>
                  <td className="px-4 py-3 text-muted-foreground">{names.join(", ")}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatPrice(price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-3 flex max-w-3xl items-start gap-2 text-sm text-muted-foreground">
          <Globe className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span>
            {t("service.shipping.outsideNote")}
          </span>
        </p>
      </section>

      {/* Grouped FAQ sections */}
      {faqGroups.map((group) => (
        <section
          key={group.id}
          id={group.id}
          className="container-klusr scroll-mt-24"
        >
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <group.icon className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                {group.title}
              </h2>
              <p className="mt-1 max-w-2xl text-muted-foreground">
                {group.intro}
              </p>
            </div>
          </div>
          <div className="mt-4 max-w-3xl">
            <Accordion type="single" collapsible>
              {group.faqs.map((faq, index) => (
                <AccordionItem key={faq.question} value={`${group.id}-${index}`}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      ))}

      {/* General FAQ */}
      <section className="container-klusr">
        <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
          {t("service.general.title")}
        </h2>
        <div className="mt-4 max-w-3xl">
          <Accordion type="single" collapsible>
            {generalFaqs.map((faq, index) => (
              <AccordionItem key={faq.question} value={`algemeen-${index}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Niet goed = geld terug */}
      <section className="container-klusr">
        <div className="rounded-2xl bg-klusr-black p-6 text-white sm:p-10">
          <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
            {t("service.guarantee.title")}
          </h2>
          <p className="mt-2 max-w-2xl text-white/80">
            {t("service.guarantee.text")}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              <Link href="/retourvoorwaarden">{t("service.guarantee.cta")}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Contact block */}
      <section className="container-klusr">
        <div className="grid gap-6 rounded-2xl border border-border bg-card p-6 shadow-card sm:p-10 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
              {t("service.contactBlock.title")}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {t("service.contactBlock.text")}
            </p>
            <div className="mt-5">
              <ContactForm />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              {t("service.contactBlock.preferPre")}
              <Link
                href="/klushulp"
                className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
              >
                <MessageCircle className="h-4 w-4" />
                {t("service.contactBlock.preferLink")}
              </Link>
              {t("service.contactBlock.preferPost")}
            </p>
          </div>

          <div className="rounded-xl bg-secondary p-6">
            <h3 className="inline-flex items-center gap-2 font-bold">
              <MapPin className="h-5 w-5 text-primary" />
              {flagshipStore.name}
            </h3>
            <address className="mt-3 flex flex-col gap-2 not-italic text-sm text-muted-foreground">
              <span>
                {flagshipStore.address}
                <br />
                {flagshipStore.postalCode} {flagshipStore.city}
              </span>
              <a
                href={`tel:${flagshipStore.phone.replace(/[\s-]/g, "")}`}
                className="inline-flex items-center gap-2 hover:text-primary"
              >
                <Phone className="h-4 w-4" />
                {flagshipStore.phone}
              </a>
              <a
                href={`mailto:${flagshipStore.email}`}
                className="inline-flex items-center gap-2 break-all hover:text-primary"
              >
                <Mail className="h-4 w-4" />
                {flagshipStore.email}
              </a>
            </address>
            <Link
              href="/winkels/nijverdal"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              {t("service.contactBlock.viewStorePage")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
