"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Loader2, MessageCircle, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormattedText } from "@/components/shared/formatted-text";
import { formatDate, cn } from "@/lib/utils";

interface ConversationIndexEntry {
  id: string;
  updatedAt: string;
  preview: string;
  messageCount: number;
}

interface StoredMessage {
  role: "user" | "assistant";
  content: string;
  ts: string;
}

interface StoredConversation {
  id: string;
  startedAt: string;
  updatedAt: string;
  messages: StoredMessage[];
  lastUserMessage: string;
  messageCount: number;
  page?: string;
}

/** Korte, relatieve tijdsaanduiding ("3 min geleden", "2 u geleden"). */
function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const sec = Math.max(0, Math.round((Date.now() - then) / 1000));
  if (sec < 60) return "zojuist";
  const min = Math.round(sec / 60);
  if (min < 60) return `${min} min geleden`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} u geleden`;
  const d = Math.round(hr / 24);
  if (d < 7) return `${d} d geleden`;
  return formatDate(iso);
}

/**
 * Read-only inbox voor de website-chatgesprekken ("de Klushulp"). De AI blijft
 * de chats afhandelen; de admin leest hier mee. Geen antwoordveld.
 */
export function ConversationsPanel() {
  const [list, setList] = useState<ConversationIndexEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<StoredConversation | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/conversations", { cache: "no-store" });
      const data = await res.json();
      setList(Array.isArray(data.conversations) ? data.conversations : []);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  }

  // Eerste keer laden + lichte auto-verversing van de lijst elke 20s.
  useEffect(() => {
    load();
    const t = setInterval(load, 20_000);
    return () => clearInterval(t);
  }, []);

  // Het geselecteerde gesprek (vol) ophalen.
  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    let active = true;
    setDetailLoading(true);
    fetch(`/api/admin/conversations?id=${encodeURIComponent(selectedId)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (active) setDetail(d.conversation ?? null);
      })
      .catch(() => active && setDetail(null))
      .finally(() => active && setDetailLoading(false));
    return () => {
      active = false;
    };
  }, [selectedId]);

  const totalMessages = useMemo(
    () => list.reduce((s, c) => s + (c.messageCount || 0), 0),
    [list],
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">Chatgesprekken — de Klushulp</CardTitle>
            <p className="text-sm text-muted-foreground">
              Lees de gesprekken van de website-chat terug. De Klushulp beantwoordt de vragen
              automatisch; dit overzicht is alleen om mee te lezen.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Vernieuwen
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {!loading && list.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            <Inbox className="h-7 w-7" />
            <p className="font-semibold text-foreground">Nog geen gesprekken</p>
            <p className="max-w-md">
              Zodra bezoekers met de Klushulp chatten verschijnen de gesprekken hier. Tip: voor
              behoud over deploys heen moet KV (Upstash/Vercel KV) zijn geconfigureerd in productie —
              zonder KV worden gesprekken alleen tijdelijk in het geheugen bewaard.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
            {/* Lijst */}
            <ul className="flex max-h-[560px] flex-col gap-1.5 overflow-y-auto pr-1">
              {loading && list.length === 0 && (
                <li className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Laden…
                </li>
              )}
              {list.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => setSelectedId(c.id)}
                    className={cn(
                      "w-full rounded-lg border p-3 text-left transition-colors",
                      selectedId === c.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-secondary",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MessageCircle className="h-3.5 w-3.5" />
                        {c.messageCount} bericht{c.messageCount === 1 ? "" : "en"}
                      </span>
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {relativeTime(c.updatedAt)}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm font-medium text-foreground">
                      {c.preview || "(geen vraag)"}
                    </p>
                  </button>
                </li>
              ))}
            </ul>

            {/* Detail */}
            <div className="min-w-0">
              {!selectedId ? (
                <div className="grid h-full min-h-[200px] place-items-center rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  Selecteer een gesprek om mee te lezen.
                </div>
              ) : detailLoading && !detail ? (
                <div className="grid h-full min-h-[200px] place-items-center rounded-lg border border-border p-6 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Gesprek laden…
                  </span>
                </div>
              ) : !detail ? (
                <div className="grid h-full min-h-[200px] place-items-center rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  Dit gesprek is niet (meer) beschikbaar.
                </div>
              ) : (
                <div className="flex flex-col gap-4 rounded-lg border border-border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b border-border pb-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-bold">Gesprek</h3>
                      <p className="text-xs text-muted-foreground">
                        Gestart {formatDate(detail.startedAt)} · {detail.messageCount} bericht
                        {detail.messageCount === 1 ? "" : "en"}
                        {detail.page ? (
                          <>
                            {" · "}
                            <span className="font-mono">{detail.page}</span>
                          </>
                        ) : null}
                      </p>
                    </div>
                  </div>

                  {/* Gesprek — read-only chatbubbels */}
                  <div className="flex max-h-[400px] flex-col gap-3 overflow-y-auto">
                    {detail.messages.map((m, i) => (
                      <div
                        key={i}
                        className={cn(
                          "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                          m.role === "user"
                            ? "self-end rounded-br-sm bg-primary text-white"
                            : "self-start rounded-bl-sm bg-secondary text-foreground",
                        )}
                      >
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide opacity-70">
                          {m.role === "user" ? "Bezoeker" : "Klushulp"}
                          {" · "}
                          {formatDate(m.ts)}
                        </p>
                        {m.role === "assistant" ? (
                          <FormattedText text={m.content} />
                        ) : (
                          <p className="whitespace-pre-wrap">{m.content}</p>
                        )}
                      </div>
                    ))}
                    {detail.messages.length === 0 && (
                      <p className="py-4 text-center text-sm text-muted-foreground">
                        Dit gesprek bevat nog geen berichten.
                      </p>
                    )}
                  </div>

                  <p className="border-t border-border pt-3 text-xs text-muted-foreground">
                    Alleen-lezen — de Klushulp beantwoordt de vragen automatisch.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {list.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {list.length} gesprek{list.length === 1 ? "" : "ken"} · {totalMessages} berichten in
            totaal. Lijst ververst elke 20s.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
