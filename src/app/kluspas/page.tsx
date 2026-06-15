import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  CreditCard,
  Gift,
  Mail,
  Palette,
  PiggyBank,
  Tag,
} from "lucide-react";
import { NewsletterForm } from "@/components/marketing/newsletter-form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "KLUSRPAS — altijd de laagste prijs",
  description:
    "Met de gratis KLUSR KLUSRPAS betaal je altijd de laagste KLUSRPAS-prijs, profiteer je van exclusieve acties, krijg je gratis kleuradvies en spaar je klustegoed. Vraag 'm gratis aan.",
  openGraph: {
    title: "KLUSRPAS | KLUSR",
    description:
      "Altijd de laagste prijs met de gratis KLUSRPAS. Exclusieve acties, gratis kleuradvies en klustegoed sparen.",
  },
};

const benefits = [
  {
    icon: Tag,
    title: "Altijd de laagste KLUSRPAS-prijs",
    description:
      "Direct korting op het hele assortiment — online én in de winkel.",
  },
  {
    icon: Gift,
    title: "Exclusieve acties",
    description:
      "Voorrang bij uitverkoop en aanbiedingen die alleen voor pashouders gelden.",
  },
  {
    icon: Palette,
    title: "Gratis kleuradvies",
    description:
      "Persoonlijk kleuradvies van onze ex-schilders, helemaal kosteloos.",
  },
  {
    icon: PiggyBank,
    title: "Klustegoed sparen",
    description:
      "Bij elke aankoop spaar je tegoed dat je inzet op je volgende klus.",
  },
];

const steps = [
  {
    title: "Vraag je KLUSRPAS aan",
    description:
      "Vul je e-mailadres in — gratis, zonder verplichtingen en in een halve minuut geregeld.",
  },
  {
    title: "Ontvang je digitale pas",
    description:
      "Je krijgt de digitale KLUSRPAS direct in je mailbox. Bewaar 'm op je telefoon.",
  },
  {
    title: "Profiteer direct",
    description:
      "Scan of vul je pas in bij het afrekenen en betaal meteen de laagste KLUSRPAS-prijs.",
  },
];

const faqs = [
  {
    question: "Wat kost de KLUSRPAS?",
    answer:
      "Helemaal niets. De KLUSRPAS is en blijft gratis. Er zijn geen abonnementskosten of verborgen voorwaarden — je profiteert direct van alle voordelen.",
  },
  {
    question: "Hoe vraag ik de KLUSRPAS aan?",
    answer:
      "Vul hierboven je e-mailadres in. Je ontvangt je digitale KLUSRPAS binnen enkele minuten in je mailbox. Aanmelden kan ook aan de kassa in onze winkel.",
  },
  {
    question: "Kan ik de KLUSRPAS online én in de winkel gebruiken?",
    answer:
      "Ja. In de webshop vul je je gegevens in bij het afrekenen en zie je de KLUSRPAS-prijs automatisch. In de winkel laat je de digitale pas scannen of noem je je gegevens aan de kassa.",
  },
  {
    question: "Hoe werkt het sparen van klustegoed?",
    answer:
      "Bij iedere aankoop met je KLUSRPAS spaar je automatisch klustegoed. Dat tegoed kun je bij een volgende bestelling of winkelbezoek inzetten als korting.",
  },
  {
    question: "Wat gebeurt er met mijn gegevens?",
    answer:
      "We gebruiken je gegevens alleen om je KLUSRPAS-voordelen, relevante acties en je klustegoed te beheren. Je kunt je voorkeuren altijd aanpassen of je afmelden.",
  },
  {
    question: "Kan ik de KLUSRPAS opzeggen?",
    answer:
      "Natuurlijk. Je kunt je op elk moment afmelden via de link in onze e-mails of door contact op te nemen met onze klantenservice. Aan de pas zitten geen verplichtingen.",
  },
];

export default function KluspasPage() {
  return (
    <div className="flex flex-col gap-12 py-8 sm:gap-16">
      {/* Hero */}
      <section className="container-klusr">
        <div className="overflow-hidden rounded-2xl bg-klusr-black text-white">
          <div className="klusr-stripes grid items-center gap-8 p-6 sm:p-10 lg:grid-cols-2 lg:p-14">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-bold">
                <CreditCard className="h-3.5 w-3.5" />
                GRATIS KLUSPAS
              </span>
              <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-balance sm:text-4xl lg:text-5xl">
                Altijd de laagste prijs met de gratis KLUSRPAS
              </h1>
              <p className="mt-4 max-w-xl text-white/70">
                Word vandaag nog pashouder en profiteer direct van
                KLUSRPAS-prijzen op het hele assortiment, exclusieve acties,
                gratis kleuradvies en klustegoed dat je spaart bij elke
                aankoop.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="#aanvragen">
                    Vraag je KLUSRPAS aan
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
                >
                  <Link href="#voordelen">Bekijk de voordelen</Link>
                </Button>
              </div>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {benefits.map((benefit) => (
                <li
                  key={benefit.title}
                  className="flex items-start gap-2 rounded-lg bg-white/5 p-4 text-sm"
                >
                  <Check
                    className="mt-0.5 h-4 w-4 shrink-0 text-klusr-stock"
                    strokeWidth={3}
                  />
                  <span className="font-medium">{benefit.title}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Benefits grid */}
      <section id="voordelen" className="container-klusr scroll-mt-24">
        <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
          De voordelen op een rij
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          De KLUSRPAS levert je bij elke klus voordeel op — groot of klein.
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5 shadow-card"
            >
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
                <benefit.icon className="h-5 w-5" />
              </span>
              <h3 className="font-bold leading-tight">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="container-klusr">
        <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
          Zo werkt het
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          In drie simpele stappen profiteer je van alle KLUSRPAS-voordelen.
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="relative rounded-lg border border-border bg-card p-6 shadow-card"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-base font-black text-primary-foreground">
                {index + 1}
              </span>
              <h3 className="mt-4 font-bold">{step.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Signup */}
      <section id="aanvragen" className="container-klusr scroll-mt-24">
        <div className="overflow-hidden rounded-2xl bg-primary text-primary-foreground">
          <div className="grid items-center gap-8 p-6 sm:p-10 lg:grid-cols-2 lg:p-14">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
                <Mail className="h-3.5 w-3.5" />
                GRATIS AANVRAGEN
              </span>
              <h2 className="mt-4 text-2xl font-black sm:text-3xl">
                Ontvang je digitale KLUSRPAS
              </h2>
              <p className="mt-2 max-w-md text-white/80">
                Vul je e-mailadres in en je ontvangt je persoonlijke digitale
                KLUSRPAS direct in je mailbox. Gratis, voor altijd en zonder
                verplichtingen.
              </p>
            </div>
            <div className="rounded-xl bg-klusr-black p-6">
              <p className="mb-3 text-sm font-semibold text-white">
                Vraag je gratis KLUSRPAS aan
              </p>
              <NewsletterForm source="kluspas" />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-klusr">
        <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
          Veelgestelde vragen
        </h2>
        <div className="mt-4 max-w-3xl">
          <Accordion type="single" collapsible>
            {faqs.map((faq, index) => (
              <AccordionItem key={faq.question} value={`item-${index}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </div>
  );
}
