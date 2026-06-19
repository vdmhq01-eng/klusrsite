"use client";

import { useState } from "react";
import { ArrowRight, Wrench } from "lucide-react";
import { useUI } from "@/lib/store/ui";
import { useT } from "@/components/i18n/locale-provider";
import type { MessageKey } from "@/lib/i18n/dictionaries";

const EXAMPLE_KEYS: MessageKey[] = [
  "home.heroAi.example.bedroom",
  "home.heroAi.example.liters",
  "home.heroAi.example.primer",
];

/**
 * Hero-tegel met de Klus-AI: bezoekers stellen meteen hun klusvraag en de
 * AI-assistent opent met het antwoord.
 */
export function HeroAiCard() {
  const askAi = useUI((s) => s.askAi);
  const t = useT();
  const [q, setQ] = useState("");

  return (
    <div className="relative flex min-h-[200px] flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-klusr-red-dark p-6 text-white">
      <div className="klusr-stripes pointer-events-none absolute inset-0 opacity-30" />
      <div className="relative">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur">
          <Wrench className="h-3.5 w-3.5" />
          {t("home.heroAi.chip")}
        </span>
        <h2 className="mt-3 text-2xl font-black leading-tight">{t("home.heroAi.title")}</h2>
        <p className="mt-1 text-sm text-white/85">
          {t("home.heroAi.text")}
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
              placeholder={t("home.heroAi.placeholder")}
              aria-label={t("home.heroAi.inputAria")}
              className="h-9 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              aria-label={t("home.heroAi.submitAria")}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-white transition-transform hover:scale-105"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {EXAMPLE_KEYS.map((key) => {
            const ex = t(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => askAi(ex)}
                className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium text-white/90 backdrop-blur transition-colors hover:bg-white/25"
              >
                {ex}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
