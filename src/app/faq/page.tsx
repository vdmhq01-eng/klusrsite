import type { Metadata } from "next";
import Link from "next/link";
import { HelpCircle } from "lucide-react";
import { Breadcrumb } from "@/components/plp/breadcrumb";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Veelgestelde vragen | KLUSR",
  description:
    "Antwoorden op de meestgestelde vragen over bestellen, betalen, levering, retourneren, mengverf en de KLUSRPAS.",
  alternates: { canonical: "/faq" },
};

interface QA {
  q: string;
  a: React.ReactNode;
  /** Platte tekst voor de FAQPage-structured-data. */
  text: string;
}

export default function FaqPage() {
  // Per-request opgebouwd zodat de teksten de actieve locale volgen. Antwoorden
  // met een link splitsen we in tekstfragmenten rond de <Link>; `text` blijft de
  // platte variant voor de structured data.
  const GROUPS: { title: string; items: QA[] }[] = [
    {
      title: t("faq.group.ordering"),
      items: [
        {
          q: t("faq.order.how.q"),
          a: t("faq.order.how.a"),
          text: t("faq.order.how.a"),
        },
        {
          q: t("faq.order.payment.q"),
          a: t("faq.order.payment.a"),
          text: t("faq.order.payment.a"),
        },
        {
          q: t("faq.order.account.q"),
          a: t("faq.order.account.a"),
          text: t("faq.order.account.text"),
        },
      ],
    },
    {
      title: t("faq.group.delivery"),
      items: [
        {
          q: t("faq.delivery.when.q"),
          a: t("faq.delivery.when.a"),
          text: t("faq.delivery.when.a"),
        },
        {
          q: t("faq.delivery.pickup.q"),
          a: (
            <>
              {t("faq.delivery.pickup.aPre")}
              <Link href="/klantenservice">{t("faq.delivery.pickup.aLink")}</Link>
              {t("faq.delivery.pickup.aPost")}
            </>
          ),
          text: t("faq.delivery.pickup.text"),
        },
        {
          q: t("faq.delivery.return.q"),
          a: (
            <>
              {t("faq.delivery.return.aPre")}
              <Link href="/klantenservice">{t("faq.delivery.return.aLink")}</Link>
              {t("faq.delivery.return.aMid")}
              <Link href="/voorwaarden">{t("faq.delivery.return.aTermsLink")}</Link>
              {t("faq.delivery.return.aPost")}
            </>
          ),
          text: t("faq.delivery.return.text"),
        },
      ],
    },
    {
      title: t("faq.group.mengverf"),
      items: [
        {
          q: t("faq.mengverf.any.q"),
          a: (
            <>
              {t("faq.mengverf.any.aPre")}
              <Link href="/kleurkiezer">{t("faq.mengverf.any.aLink")}</Link>
              {t("faq.mengverf.any.aPost")}
            </>
          ),
          text: t("faq.mengverf.any.text"),
        },
        {
          q: t("faq.mengverf.how.q"),
          a: (
            <>
              {t("faq.mengverf.how.aPre")}
              <Link href="/mengverf">{t("faq.mengverf.how.aLink")}</Link>
              {t("faq.mengverf.how.aPost")}
            </>
          ),
          text: t("faq.mengverf.how.text"),
        },
        {
          q: t("faq.mengverf.exchange.q"),
          a: t("faq.mengverf.exchange.a"),
          text: t("faq.mengverf.exchange.a"),
        },
      ],
    },
    {
      title: t("faq.group.kluspas"),
      items: [
        {
          q: t("faq.kluspas.what.q"),
          a: (
            <>
              {t("faq.kluspas.what.aPre")}
              <Link href="/kluspas">{t("faq.kluspas.what.aLink")}</Link>
              {t("faq.kluspas.what.aPost")}
            </>
          ),
          text: t("faq.kluspas.what.text"),
        },
        {
          q: t("faq.kluspas.cost.q"),
          a: t("faq.kluspas.cost.a"),
          text: t("faq.kluspas.cost.a"),
        },
      ],
    },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: GROUPS.flatMap((g) => g.items).map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.text },
    })),
  };

  return (
    <div className="pb-16">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="container-klusr">
        <Breadcrumb items={[{ label: t("faq.meta.breadcrumb") }]} />
      </div>

      <section className="container-klusr mt-6 max-w-3xl">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
          <HelpCircle className="h-3.5 w-3.5" />
          {t("faq.badge")}
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
          {t("faq.title")}
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          {t("faq.subtitle")}
        </p>

        <div className="mt-8 space-y-8">
          {GROUPS.map((group) => (
            <div key={group.title}>
              <h2 className="mb-2 text-lg font-bold sm:text-xl">{group.title}</h2>
              <Accordion type="single" collapsible className="rounded-xl border border-border">
                {group.items.map((item, i) => (
                  <AccordionItem key={i} value={`${group.title}-${i}`} className="px-4">
                    <AccordionTrigger className="text-left text-sm font-semibold">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm leading-relaxed text-muted-foreground [&_a]:font-medium [&_a]:text-primary [&_a:hover]:underline">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start gap-3 rounded-2xl border border-border bg-secondary/40 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold">{t("faq.more.title")}</h2>
            <p className="text-sm text-muted-foreground">
              {t("faq.more.text")}
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/klantenservice">{t("faq.more.cta")}</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
