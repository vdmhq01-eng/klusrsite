"use client";

import { useState } from "react";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormattedText } from "@/components/shared/formatted-text";
import { trackEvent } from "@/lib/tracking";

interface Copy {
  heading: string;
  questions: string[];
}

/** Categorie-specifieke kop + snelle vragen, zodat het advies klopt per soort product. */
const COPY: Record<string, Copy> = {
  verf: {
    heading: "Twijfel je of dit de juiste verf is?",
    questions: [
      "Is dit de juiste verf voor mijn klus?",
      "Hoeveel heb ik nodig?",
      "Welke ondergrond is geschikt?",
    ],
  },
  verlichting: {
    heading: "Twijfel je of dit de juiste lamp is?",
    questions: ["Past deze fitting bij mijn armatuur?", "Hoeveel lumen heb ik nodig?", "Is dit dimbaar?"],
  },
  gereedschap: {
    heading: "Twijfel je of dit het juiste gereedschap is?",
    questions: ["Is dit geschikt voor mijn klus?", "Welke maat heb ik nodig?", "Waar moet ik op letten?"],
  },
  ijzerwaren: {
    heading: "Twijfel je of dit het juiste artikel is?",
    questions: ["Welke maat heb ik nodig?", "Is dit geschikt voor mijn materiaal?", "Hoeveel heb ik nodig?"],
  },
  "afbouw-fijnbouw": {
    heading: "Twijfel je of dit het juiste product is?",
    questions: ["Is dit geschikt voor mijn klus?", "Hoeveel heb ik nodig?", "Welke ondergrond is geschikt?"],
  },
  elektra: {
    heading: "Twijfel je of dit het juiste artikel is?",
    questions: ["Is dit geschikt voor mijn klus?", "Waar moet ik op letten?", "Welke maat heb ik nodig?"],
  },
  tuin: {
    heading: "Twijfel je of dit het juiste product is?",
    questions: ["Is dit geschikt voor buiten?", "Hoeveel heb ik nodig?", "Waar moet ik op letten?"],
  },
  "vloeren-raam": {
    heading: "Twijfel je of dit het juiste product is?",
    questions: ["Is dit geschikt voor mijn ruimte?", "Hoeveel heb ik nodig?", "Waar moet ik op letten?"],
  },
};

const DEFAULT_COPY: Copy = {
  heading: "Twijfel je of dit het juiste product is?",
  questions: ["Is dit geschikt voor mijn klus?", "Hoeveel heb ik nodig?", "Waar moet ik op letten?"],
};

/** PDP AI-adviesblok — categorie-bewust. */
export function AiProductAdvice({
  productId,
  productTitle,
  category,
}: {
  productId: string;
  productTitle: string;
  category?: string;
}) {
  const copy = (category && COPY[category]) || DEFAULT_COPY;
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function ask(q: string) {
    const text = q.trim();
    if (!text || loading) return;
    setLoading(true);
    setAnswer(null);
    trackEvent("ai_product_suggestion_clicked", { product_id: productId });
    try {
      const res = await fetch("/api/ai/product-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, question: text }),
      });
      const data = await res.json();
      setAnswer(data.advice ?? "Sorry, ik kan even geen advies geven.");
    } catch {
      setAnswer("Sorry, het advies kon niet worden opgehaald. Probeer het later opnieuw.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <div className="p-5">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-white">
            <MessageCircle className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-bold">{copy.heading}</h3>
            <p className="text-sm text-muted-foreground">
              Stel je vraag aan onze klushulp — we helpen je de juiste keuze maken.
            </p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(question);
          }}
          className="mt-4 flex gap-2"
        >
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={`Vraag iets over ${productTitle}…`}
            className="h-11 flex-1 rounded-full border border-border bg-card px-4 text-sm outline-none ring-primary/20 focus:ring-2"
          />
          <Button type="submit" size="icon" className="h-11 w-11 shrink-0 rounded-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>

        {!answer && !loading && (
          <div className="mt-3 flex flex-wrap gap-2">
            {copy.questions.map((q) => (
              <button
                key={q}
                onClick={() => {
                  setQuestion(q);
                  ask(q);
                }}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary/40 hover:text-primary"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {(answer || loading) && (
          <div className="mt-4 rounded-lg border border-border bg-card p-4 text-sm leading-relaxed">
            {loading ? (
              <span className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> KLUSR denkt mee…
              </span>
            ) : (
              <FormattedText text={answer!} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
