"use client";

import { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { useUI } from "@/lib/store/ui";

const EXAMPLES = [
  "Welke verf voor mijn slaapkamer?",
  "Hoeveel liter heb ik nodig?",
  "Welke primer op kaal hout?",
];

/**
 * Hero-tegel met de Klus-AI: bezoekers stellen meteen hun klusvraag en de
 * AI-assistent opent met het antwoord.
 */
export function HeroAiCard() {
  const askAi = useUI((s) => s.askAi);
  const [q, setQ] = useState("");

  return (
    <div className="relative flex min-h-[200px] flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-klusr-red-dark p-6 text-white">
      <div className="klusr-stripes pointer-events-none absolute inset-0 opacity-30" />
      <div className="relative">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur">
          <Sparkles className="h-3.5 w-3.5" />
          Klushulp · advies van ex-schilders
        </span>
        <h2 className="mt-3 text-2xl font-black leading-tight">Wat ga je klussen?</h2>
        <p className="mt-1 text-sm text-white/85">
          Stel direct je vraag — onze klushulp helpt je met verf, hoeveelheden en het
          juiste gereedschap.
        </p>
      </div>

      <div className="relative mt-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            askAi(q);
          }}
        >
          <div className="flex items-center gap-2 rounded-full bg-white p-1 pl-4">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Bijv. welke verf voor mijn badkamer?"
              aria-label="Stel je klusvraag aan de klushulp"
              className="h-9 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              aria-label="Vraag de klushulp"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-white transition-transform hover:scale-105"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => askAi(ex)}
              className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium text-white/90 backdrop-blur transition-colors hover:bg-white/25"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
