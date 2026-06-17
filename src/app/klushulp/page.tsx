import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles, MessageCircle, ListChecks, Wrench } from "lucide-react";
import { klushulpTasks } from "@/lib/data";
import { KlushulpFunnel } from "@/components/home/klushulp-funnel";
import { ChatPanel } from "@/components/ai/chat-panel";
import { CategoryIcon } from "@/components/shared/category-icon";
import { SectionHeading } from "@/components/shared/section-heading";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Klushulp — direct advies van ex-schilders",
  description:
    "Beschrijf je klus en KLUSR helpt je met een helder stappenplan, het juiste gereedschap en de beste verf. Direct advies van ex-schilders — gratis en zonder gedoe.",
  openGraph: {
    title: "Klushulp — direct advies van ex-schilders | KLUSR",
    description:
      "Beschrijf je klus en krijg direct een stappenplan, het juiste gereedschap en de beste verf. Direct advies van ex-schilders.",
  },
};

const chatSuggestions = [
  "Ik wil mijn woonkamer verven — waar begin ik?",
  "Welk gereedschap heb ik nodig voor het schilderen van kozijnen?",
  "Hoe bescherm ik mijn schutting tegen weer en wind?",
  "Welke verf is geschikt voor een vochtige badkamer?",
];

const steps = [
  {
    icon: MessageCircle,
    title: "1. Beschrijf je klus",
    text: "Kies een klus of stel je vraag aan de KLUSR-assistent. Hoe meer details, hoe gerichter het advies.",
  },
  {
    icon: ListChecks,
    title: "2. Krijg een stappenplan",
    text: "Je ontvangt direct een helder stappenplan op basis van de ervaring van onze ex-schilders.",
  },
  {
    icon: Wrench,
    title: "3. Shop de juiste spullen",
    text: "We stellen meteen de juiste verf, het gereedschap en de materialen voor. Klussen maar.",
  },
];

export default function KlushulpPage() {
  return (
    <div className="flex flex-col gap-12 py-6 sm:gap-16 sm:py-8">
      {/* Hero + embedded chat */}
      <section className="container-klusr">
        <div className="grid items-stretch gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col justify-center">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">
              <Sparkles className="h-3.5 w-3.5" />
              KLUSHULP
            </span>
            <h1 className="mt-4 max-w-2xl text-3xl font-black tracking-tight text-balance sm:text-4xl lg:text-5xl">
              Klushulp — direct advies van ex-schilders
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
              Niet zeker waar je moet beginnen? Beschrijf je klus en KLUSR stelt
              direct het juiste stappenplan, gereedschap en de beste verf voor.
              Gratis, 24/7 en zonder gedoe.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="#klussen"
                className="inline-flex items-center gap-2 rounded-md bg-klusr-black px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-klusr-black/90"
              >
                Bekijk alle klussen
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/kleurkiezer"
                className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-5 py-3 text-sm font-semibold transition-colors hover:bg-secondary"
              >
                Open de kleurkiezer
              </Link>
            </div>
          </div>

          {/* Embedded assistant */}
          <Card className="flex min-h-[480px] flex-col overflow-hidden">
            <div className="flex items-center gap-2 bg-gradient-to-br from-primary to-klusr-red-dark px-4 py-3 text-white">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-white/15">
                <MessageCircle className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-bold leading-tight">KLUSR Klushulp</p>
                <p className="text-[11px] text-white/70">Advies van ex-schilders, 24/7</p>
              </div>
            </div>
            <ChatPanel
              className="flex-1"
              context="Klushulp landingspagina. De gebruiker oriënteert zich op een klus en wil advies over aanpak, gereedschap en de juiste verf."
              suggestions={chatSuggestions}
              initialAssistantMessage="Hoi! Vertel me wat je gaat doen — bijvoorbeeld een muur verven of je tuin opknappen — en ik help je op weg."
            />
          </Card>
        </div>
      </section>

      {/* Task funnel */}
      <KlushulpFunnel
        title="Wat ga je doen?"
        subtitle="Kies je klus voor een stappenplan en de juiste producten."
      />

      {/* How it works */}
      <section className="container-klusr">
        <SectionHeading
          title="Hoe werkt het?"
          subtitle="In drie simpele stappen van vraag naar klaar"
        />
        <div className="grid gap-4 sm:grid-cols-3">
          {steps.map((step) => (
            <Card key={step.title} className="p-6">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
                <step.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-lg font-bold">{step.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{step.text}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* All tasks as cards */}
      <section id="klussen" className="container-klusr scroll-mt-24">
        <SectionHeading
          title="Alle klussen"
          subtitle="Bekijk het stappenplan en de benodigdheden per klus"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {klushulpTasks.map((task) => (
            <Link
              key={task.id}
              href={`/klushulp/${task.slug}`}
              className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card-hover"
            >
              <span className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <CategoryIcon name={task.icon} className="h-6 w-6" />
              </span>
              <div>
                <h3 className="text-lg font-bold group-hover:text-primary">
                  {task.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {task.description}
                </p>
              </div>
              <span className="mt-auto inline-flex items-center gap-1.5 pt-1 text-sm font-semibold text-primary">
                Bekijk de klushulp
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
