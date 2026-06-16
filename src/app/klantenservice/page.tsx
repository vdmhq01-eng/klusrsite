import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CreditCard,
  Mail,
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

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

const contactCards = [
  {
    icon: Phone,
    title: "Bel ons",
    description: "Ma t/m vr 09:00 - 18:00",
    actionLabel: flagshipStore.phone,
    href: `tel:${flagshipStore.phone.replace(/[\s-]/g, "")}`,
  },
  {
    icon: Mail,
    title: "Mail ons",
    description: "Reactie binnen 1 werkdag",
    actionLabel: "klantenservice@klus-r.nl",
    href: "mailto:klantenservice@klus-r.nl",
  },
  {
    icon: Store,
    title: "Bezoek een winkel",
    description: "Persoonlijk advies in de winkel",
    actionLabel: "Bekijk winkels",
    href: "/winkels",
  },
  {
    icon: Sparkles,
    title: "AI klushulp",
    description: "Direct antwoord, dag en nacht",
    actionLabel: "Stel je vraag",
    href: "/klushulp",
  },
];

const trustItems = [
  { icon: Truck, label: "Voor 16:00 besteld, morgen in huis" },
  { icon: RotateCcw, label: "14 dagen gratis retour" },
  { icon: ShieldCheck, label: "Veilig betalen via Mollie" },
  { icon: Sparkles, label: "Advies van ex-schilders" },
  { icon: BadgeCheck, label: "Wettelijke garantie op alles" },
];

const shippingFaqs = [
  {
    question: "Wanneer wordt mijn bestelling bezorgd?",
    answer:
      "Bestel je op werkdagen vóór 16:00? Dan ligt je bestelling de volgende dag in huis. Je ontvangt een track & trace-code zodra je pakket onderweg is.",
  },
  {
    question: "Wat kost de verzending?",
    answer:
      "Verzending is gratis bij bestellingen vanaf € 50. Onder dat bedrag rekenen we een vaste bijdrage in de verzendkosten, die je tijdens het afrekenen ziet.",
  },
  {
    question: "Hoe retourneer ik een product?",
    answer:
      "Retourneren is gratis in al onze winkels — neem je product en je orderbevestiging mee. Liever per post? Meld je retour aan via je account en gebruik het retourlabel. Je hebt 14 dagen bedenktijd.",
  },
];

const paymentFaqs = [
  {
    question: "Welke betaalmethodes accepteren jullie?",
    answer:
      "Je betaalt veilig met iDEAL, Bancontact, creditcard of achteraf via Klarna. Alle betalingen verlopen versleuteld via onze betaalpartner Mollie.",
  },
  {
    question: "Kan ik achteraf betalen?",
    answer:
      "Ja, met Klarna betaal je veilig achteraf. Je rekent pas af nadat je je bestelling hebt ontvangen en gecontroleerd.",
  },
  {
    question: "Is online betalen veilig?",
    answer:
      "Absoluut. Alle transacties lopen via Mollie, een gecertificeerde betaaldienst. Wij slaan zelf geen betaalgegevens op.",
  },
];

const warrantyFaqs = [
  {
    question: "Welke garantie krijg ik op producten?",
    answer:
      "Op al onze producten geldt de wettelijke garantie. Daarnaast hanteren veel merken hun eigen fabrieksgarantie. Is er iets mis met je product? Neem contact op, dan zoeken we samen naar een oplossing.",
  },
  {
    question: "Mijn product is beschadigd aangekomen, wat nu?",
    answer:
      "Vervelend! Neem binnen 48 uur contact op met onze klantenservice en stuur een foto mee. We sturen kosteloos een vervangend product of storten het bedrag terug.",
  },
  {
    question: "Kan ik in de winkel terecht voor service?",
    answer:
      "Zeker. Onze ex-schilders helpen je graag verder met advies, reparaties of vragen over je aankoop. Loop gerust binnen in een van onze winkels.",
  },
];

const mengverfFaqs = [
  {
    question: "Kan ik op kleur gemengde verf retourneren?",
    answer:
      "Op kleur gemengde verf mengen we speciaal voor jou op maat. Daarom is deze — net als andere op maat gemaakte producten — wettelijk uitgesloten van het herroepingsrecht en kunnen we mengverf niet terugnemen. Is er onverhoopt iets mis met de kleur of het product? Neem dan contact op, dan lossen we het samen kosteloos op.",
  },
  {
    question: "Hoe nauwkeurig is de kleurmatch?",
    answer:
      "We mengen op basis van professionele kleurcodes (o.a. RAL, Gamma en AkzoNobel) voor een exacte match. Twijfel je over een kleur? Vraag in de winkel een proefstaal of bestel eerst een kleurtester voordat je de hele hoeveelheid laat mengen.",
  },
  {
    question: "Hoeveel verf heb ik nodig?",
    answer:
      "Reken globaal op 1 liter per 8–10 m² per laag. Op de productpagina en via onze AI-klushulp rekenen we het exact voor je uit, zodat je niet te veel of te weinig bestelt.",
  },
  {
    question: "Kan ik verf ook in de winkel laten mengen?",
    answer:
      "Zeker. Onze kleurspecialisten mengen je verf vakkundig terwijl je wacht. Kom langs in een KLUSR-winkel met je kleurkeuze, of kies je kleur alvast online.",
  },
];

const kluspasFaqs = [
  {
    question: "Wat is de KLUSRPAS en wat kost het?",
    answer:
      "De KLUSRPAS is helemaal gratis en geeft je direct de scherpere KLUSRPAS-prijs op de hele collectie, plus exclusieve acties. Je activeert 'm bij het aanmaken van een account.",
  },
  {
    question: "Ik bestel zakelijk — kan dat ook?",
    answer:
      "Ja. Voor zzp'ers, schilders en bedrijven hebben we de KLUSR ProfPas: 10% korting op de hele collectie en prijzen excl. btw, op factuur. Gratis registreren kan via de zakelijk-pagina.",
  },
  {
    question: "Krijg ik een factuur met btw?",
    answer:
      "Ja, bij elke bestelling ontvang je een nette factuur met btw gespecificeerd. Zakelijke klanten zien de prijzen excl. btw en betalen op factuur.",
  },
];

const generalFaqs = [
  {
    question: "Hoe plaats ik een bestelling?",
    answer:
      "Voeg producten toe aan je winkelmandje, ga naar de kassa en doorloop de stappen. Je hebt geen account nodig om te bestellen, maar met een account gaat het de volgende keer sneller.",
  },
  {
    question: "Heb ik een account nodig?",
    answer:
      "Nee, je kunt als gast bestellen. Met een account bewaar je wel je gegevens, bestelhistorie en je KLUSRPAS-voordelen op één plek.",
  },
  {
    question: "Kan ik verf op kleur laten mengen?",
    answer:
      "Ja! Wij mengen elke gewenste kleur op maat. Kies online je kleur of kom langs in de winkel, waar onze kleurspecialisten je verf vakkundig mengen terwijl je wacht.",
  },
];

const faqGroups = [
  {
    id: "verzending",
    title: "Verzending & retour",
    icon: Truck,
    intro:
      "Gratis verzending vanaf € 50, voor 16:00 besteld is morgen in huis, en gratis retourneren in de winkel.",
    faqs: shippingFaqs,
  },
  {
    id: "betalen",
    title: "Veilig betalen",
    icon: CreditCard,
    intro:
      "Betaal eenvoudig en veilig met iDEAL, Bancontact, creditcard of achteraf met Klarna via Mollie.",
    faqs: paymentFaqs,
  },
  {
    id: "garantie",
    title: "Garantie & service",
    icon: ShieldCheck,
    intro:
      "Wettelijke garantie op alles, plus persoonlijke service van onze ex-schilders.",
    faqs: warrantyFaqs,
  },
  {
    id: "mengverf",
    title: "Mengverf & kleuradvies",
    icon: Palette,
    intro:
      "Elke kleur op maat gemengd met een exacte kleurmatch. Let op: op kleur gemengde verf is maatwerk en kan niet retour.",
    faqs: mengverfFaqs,
  },
  {
    id: "kluspas",
    title: "KLUSRPAS & zakelijk",
    icon: BadgeCheck,
    intro:
      "Gratis KLUSRPAS-voordeel voor particulieren, en de ProfPas met 10% korting (excl. btw) voor zakelijke klanten.",
    faqs: kluspasFaqs,
  },
];

export default function KlantenservicePage() {
  return (
    <div className="flex flex-col gap-12 py-8 sm:gap-16">
      {/* Hero */}
      <section className="container-klusr">
        <p className="text-sm font-bold uppercase tracking-wide text-primary">
          Klantenservice
        </p>
        <h1 className="mt-2 max-w-3xl text-3xl font-black tracking-tight text-balance sm:text-4xl lg:text-5xl">
          Waarmee kunnen we je helpen?
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Vind hieronder snel antwoord op de meestgestelde vragen, of neem
          direct contact met ons op. Onze klussers staan voor je klaar.
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
          Bestellen & account
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
            Niet goed? Geld terug.
          </h2>
          <p className="mt-2 max-w-2xl text-white/80">
            We willen dat je met een gerust hart de klus in gaat. Daarom: 14 dagen bedenktijd,
            gratis retour (ook in de winkel) en wettelijke garantie op alles. Op kleur gemengde
            verf is maatwerk en daarom uitgezonderd van retour — maar bij een gebrek lossen we het
            altijd kosteloos op.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              <Link href="/retourvoorwaarden">Lees de retourvoorwaarden</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Contact block */}
      <section className="container-klusr">
        <div className="grid gap-6 rounded-2xl border border-border bg-card p-6 shadow-card sm:p-10 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
              Staat je vraag er niet bij?
            </h2>
            <p className="mt-2 text-muted-foreground">
              Onze klantenservice helpt je graag persoonlijk verder. Je kunt ook
              24/7 terecht bij de KLUSR AI assistent voor direct antwoord op je
              vraag.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href="mailto:klantenservice@klus-r.nl">
                  <Mail className="h-4 w-4" />
                  Mail de klantenservice
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/klushulp">
                  <MessageCircle className="h-4 w-4" />
                  Vraag de AI assistent
                </Link>
              </Button>
            </div>
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
              Bekijk winkelpagina
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
