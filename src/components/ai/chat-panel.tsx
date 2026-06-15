"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/tracking";
import { FormattedText } from "@/components/shared/formatted-text";
import { cn } from "@/lib/utils";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatPanelProps {
  /** Optional product/page context passed to the API. */
  context?: string;
  suggestions?: string[];
  initialAssistantMessage?: string;
  className?: string;
  compact?: boolean;
}

const defaultSuggestions = [
  "Welke verf heb ik nodig voor mijn muur?",
  "Welke roller moet ik kiezen?",
  "Productadvies voor buitenschilderwerk",
];

export function ChatPanel({
  context,
  suggestions = defaultSuggestions,
  initialAssistantMessage = "Hoi! Ik ben de KLUSR assistent. Waarmee kan ik je helpen?",
  className,
  compact = false,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: initialAssistantMessage },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;

    if (!started) {
      trackEvent("ai_chat_started", { context });
      setStarted(true);
    }

    const next: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.filter((m) => m.role === "user" || m.role === "assistant"),
          context,
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply ?? "Sorry, er ging iets mis." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, ik kan even niet antwoorden. Probeer het later opnieuw of vraag advies in de winkel.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div
        ref={scrollRef}
        className={cn(
          "flex-1 space-y-3 overflow-y-auto p-4",
          compact ? "max-h-[50vh]" : "",
        )}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              "flex",
              m.role === "user" ? "justify-end" : "justify-start",
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                m.role === "user"
                  ? "rounded-br-sm bg-primary text-white"
                  : "rounded-bl-sm bg-secondary text-foreground",
              )}
            >
              {m.role === "assistant" ? (
                <FormattedText text={m.content} />
              ) : (
                m.content
              )}
            </div>
          </div>
        ))}

        {/* Suggested questions (only before first user message) */}
        {messages.length === 1 && (
          <div className="space-y-2 pt-1">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="flex w-full items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-left text-sm font-medium transition-colors hover:border-primary/40 hover:bg-secondary"
              >
                <Sparkles className="h-4 w-4 shrink-0 text-primary" />
                {s}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm bg-secondary px-4 py-3 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              KLUSR denkt mee…
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 border-t border-border p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Stel hier je vraag…"
          className="h-11 flex-1 rounded-full border border-border bg-card px-4 text-sm outline-none ring-primary/20 focus:ring-2"
        />
        <Button type="submit" size="icon" className="h-11 w-11 shrink-0 rounded-full" disabled={loading}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
