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

const GROUPS: { title: string; items: QA[] }[] = [
  {
    title: "Bestellen & betalen",
    items: [
      {
        q: "Hoe plaats ik een bestelling?",
        a: "Voeg producten toe aan je winkelwagen en reken veilig af. Voor verf kies je eerst je kleur — die mengen wij exact voor je.",
        text: "Voeg producten toe aan je winkelwagen en reken veilig af. Voor verf kies je eerst je kleur — die mengen wij exact voor je.",
      },
      {
        q: "Welke betaalmethoden accepteren jullie?",
        a: "Je betaalt veilig via Mollie met onder andere iDEAL, creditcard en — waar beschikbaar — achteraf betalen.",
        text: "Je betaalt veilig via Mollie met onder andere iDEAL, creditcard en — waar beschikbaar — achteraf betalen.",
      },
      {
        q: "Heb ik een account nodig?",
        a: "Nee, je kunt als gast bestellen. Met een (gratis) account en KLUSRPAS profiteer je wel van extra voordeel en bewaar je je bestellingen en kleuren.",
        text: "Nee, je kunt als gast bestellen. Met een gratis account en KLUSRPAS profiteer je van extra voordeel en bewaar je je bestellingen en kleuren.",
      },
    ],
  },
  {
    title: "Levering & retour",
    items: [
      {
        q: "Wanneer is mijn bestelling in huis?",
        a: "Voor 16:00 uur op werkdagen besteld, morgen in huis. Verzending is gratis vanaf € 50, daaronder rekenen we € 4,95.",
        text: "Voor 16:00 uur op werkdagen besteld, morgen in huis. Verzending is gratis vanaf € 50, daaronder rekenen we € 4,95.",
      },
      {
        q: "Kan ik in de winkel afhalen?",
        a: (
          <>
            Ja, afhalen in een KLUSR-winkel is gratis. Bekijk onze{" "}
            <Link href="/winkels">winkels</Link>.
          </>
        ),
        text: "Ja, afhalen in een KLUSR-winkel is gratis.",
      },
      {
        q: "Hoe retourneer ik een product?",
        a: (
          <>
            Je hebt 14 dagen bedenktijd. Meld je retour bij onze{" "}
            <Link href="/klantenservice">klantenservice</Link>. Let op: op kleur gemengde verf is
            uitgesloten van retour (zie <Link href="/voorwaarden">voorwaarden</Link>).
          </>
        ),
        text: "Je hebt 14 dagen bedenktijd. Meld je retour bij onze klantenservice. Op kleur gemengde verf is uitgesloten van retour.",
      },
    ],
  },
  {
    title: "Mengverf & kleur",
    items: [
      {
        q: "Kan ik elke kleur laten mengen?",
        a: (
          <>
            Ja. Kies uit duizenden kleuren (Gamma, Sikkens, RAL, AkzoNobel) of je eigen tint in
            onze <Link href="/kleurkiezer">kleurkiezer</Link>. Wij mengen de verf exact op kleur.
          </>
        ),
        text: "Ja. Kies uit duizenden kleuren (Gamma, Sikkens, RAL, AkzoNobel) of je eigen tint in onze kleurkiezer. Wij mengen de verf exact op kleur.",
      },
      {
        q: "Hoe werkt mengverf precies?",
        a: (
          <>
            Je kiest een kleur, wij mengen die professioneel in de juiste basis. Meer lees je op{" "}
            <Link href="/mengverf">de mengverf-pagina</Link>.
          </>
        ),
        text: "Je kiest een kleur, wij mengen die professioneel in de juiste basis. Meer lees je op de mengverf-pagina.",
      },
      {
        q: "Kan ik gemengde verf ruilen?",
        a: "Op kleur gemengde verf maken we speciaal voor jou en is daarom uitgesloten van het herroepingsrecht, tenzij er sprake is van een gebrek.",
        text: "Op kleur gemengde verf maken we speciaal voor jou en is daarom uitgesloten van het herroepingsrecht, tenzij er sprake is van een gebrek.",
      },
    ],
  },
  {
    title: "KLUSRPAS",
    items: [
      {
        q: "Wat is de KLUSRPAS?",
        a: (
          <>
            De gratis KLUSRPAS geeft je altijd de scherpste prijs en exclusieve acties. Lees er
            alles over op de <Link href="/kluspas">KLUSRPAS-pagina</Link>.
          </>
        ),
        text: "De gratis KLUSRPAS geeft je altijd de scherpste prijs en exclusieve acties.",
      },
      {
        q: "Wat kost de KLUSRPAS?",
        a: "Niets — de KLUSRPAS is gratis aan te vragen en te gebruiken.",
        text: "Niets — de KLUSRPAS is gratis aan te vragen en te gebruiken.",
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

export default function FaqPage() {
  return (
    <div className="pb-16">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="container-klusr">
        <Breadcrumb items={[{ label: "Veelgestelde vragen" }]} />
      </div>

      <section className="container-klusr mt-6 max-w-3xl">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
          <HelpCircle className="h-3.5 w-3.5" />
          Hulp & uitleg
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Veelgestelde vragen
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          Niet gevonden wat je zoekt? Onze klantenservice helpt je graag verder.
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
            <h2 className="text-lg font-bold">Nog een vraag?</h2>
            <p className="text-sm text-muted-foreground">
              We helpen je graag persoonlijk verder.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/klantenservice">Naar klantenservice</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
