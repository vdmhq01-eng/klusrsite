"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Send, MessageCircle, Loader2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/tracking";
import { FormattedText } from "@/components/shared/formatted-text";
import { cn } from "@/lib/utils";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  /** Tikbare vervolgsuggesties (alleen bij assistent-berichten). */
  suggestions?: string[];
  /** "Bekijk producten"-CTA afgeleid uit het gesprek. */
  productHref?: string;
  productLabel?: string;
}

interface ChatPanelProps {
  /** Optional product/page context passed to the API. */
  context?: string;
  suggestions?: string[];
  initialAssistantMessage?: string;
  className?: string;
  compact?: boolean;
  /** Vraag die automatisch wordt verstuurd zodra het paneel opent. */
  autoSendMessage?: string | null;
  /** Aangeroepen nadat de auto-vraag is verstuurd (om de pending-state te wissen). */
  onAutoSent?: () => void;
}

const defaultSuggestions = [
  "Welke verf heb ik nodig voor mijn muur?",
  "Welke roller moet ik kiezen?",
  "Productadvies voor buitenschilderwerk",
];

export function ChatPanel({
  context,
  suggestions = defaultSuggestions,
  initialAssistantMessage = "Hoi! Ik ben de KLUSR Klushulp. Waarmee kan ik je helpen?",
  className,
  compact = false,
  autoSendMessage,
  onAutoSent,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: initialAssistantMessage },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoSentRef = useRef(false);
  const cidRef = useRef<string | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  /**
   * Stabiele gespreks-id per browser: één keer aangemaakt en bewaard in
   * localStorage onder `klusr_chat_cid`, daarna hergebruikt over sessies/bezoeken
   * heen. Best-effort — als localStorage faalt valt het terug op een tijdelijke
   * id voor deze sessie.
   */
  function getConversationId(): string {
    if (cidRef.current) return cidRef.current;
    let cid = "";
    try {
      cid = localStorage.getItem("klusr_chat_cid") ?? "";
      if (!cid) {
        cid =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `cid_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        localStorage.setItem("klusr_chat_cid", cid);
      }
    } catch {
      cid = cid || `cid_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    }
    cidRef.current = cid;
    return cid;
  }

  // Stuur een vooraf ingevulde vraag (bv. vanuit de hero) één keer automatisch in.
  useEffect(() => {
    if (autoSendMessage && !autoSentRef.current) {
      autoSentRef.current = true;
      send(autoSendMessage);
      onAutoSent?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSendMessage]);

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
          conversationId: getConversationId(),
          page: typeof window !== "undefined" ? window.location.pathname : undefined,
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply ?? "Sorry, er ging iets mis.",
          suggestions: Array.isArray(data.suggestions) ? data.suggestions : undefined,
          productHref: typeof data.productHref === "string" ? data.productHref : undefined,
          productLabel: typeof data.productLabel === "string" ? data.productLabel : undefined,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, ik kan even niet antwoorden. Probeer het later opnieuw of vraag advies via de klantenservice.",
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
                <MessageCircle className="h-4 w-4 shrink-0 text-primary" />
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Actieknoppen na het laatste assistent-antwoord */}
        {!loading &&
          messages.length > 1 &&
          messages[messages.length - 1].role === "assistant" &&
          (() => {
            const last = messages[messages.length - 1];
            return (
              <div className="space-y-2 pt-1">
                {last.productHref && (
                  <Link
                    href={last.productHref}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    {last.productLabel ?? "Bekijk producten"}
                  </Link>
                )}
                {(last.suggestions ?? []).map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="flex w-full items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-left text-sm font-medium transition-colors hover:border-primary/40 hover:bg-secondary"
                  >
                    <MessageCircle className="h-4 w-4 shrink-0 text-primary" />
                    {s}
                  </button>
                ))}
              </div>
            );
          })()}

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
