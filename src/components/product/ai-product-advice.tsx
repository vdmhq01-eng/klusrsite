"use client";

import { useState } from "react";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/tracking";

const quickQuestions = [
  "Is dit de juiste verf voor mijn klus?",
  "Hoeveel heb ik nodig?",
  "Welke ondergrond is geschikt?",
];

/**
 * "Twijfel je of dit de juiste verf is? Stel je vraag." — PDP AI advice block.
 */
export function AiProductAdvice({
  productId,
  productTitle,
}: {
  productId: string;
  productTitle: string;
}) {
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
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-bold">Twijfel je of dit de juiste verf is?</h3>
            <p className="text-sm text-muted-foreground">
              Stel je vraag aan onze AI-assistent — getraind op het advies van
              ex-schilders.
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
            {quickQuestions.map((q) => (
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
              answer
            )}
          </div>
        )}
      </div>
    </div>
  );
}
