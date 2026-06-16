"use client";

import { useEffect, useMemo, useState } from "react";
import {
  RefreshCw,
  Send,
  Loader2,
  Mail,
  MessageSquare,
  Inbox,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, cn } from "@/lib/utils";

type TicketStatus = "open" | "pending" | "closed";

interface TicketMessage {
  id: string;
  from: "customer" | "agent";
  body: string;
  createdAt: string;
  authorName?: string;
}

interface Ticket {
  id: string;
  reference: string;
  subject: string;
  customerEmail: string;
  customerName?: string;
  channel: "form" | "email";
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
}

const STATUS_META: Record<TicketStatus, { label: string; cls: string }> = {
  open: { label: "Open", cls: "bg-primary/10 text-primary" },
  pending: { label: "In afwachting", cls: "bg-amber-500/10 text-amber-600" },
  closed: { label: "Afgehandeld", cls: "bg-klusr-stock/10 text-klusr-stock" },
};

const FILTERS: { id: "all" | TicketStatus; label: string }[] = [
  { id: "all", label: "Alle" },
  { id: "open", label: "Open" },
  { id: "pending", label: "In afwachting" },
  { id: "closed", label: "Afgehandeld" },
];

export function TicketsPanel() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [emailConfigured, setEmailConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | TicketStatus>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tickets", { cache: "no-store" });
      const data = await res.json();
      setTickets(data.tickets ?? []);
      setEmailConfigured(Boolean(data.emailConfigured));
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () => (filter === "all" ? tickets : tickets.filter((t) => t.status === filter)),
    [tickets, filter],
  );

  const selected = useMemo(
    () => tickets.find((t) => t.id === selectedId) ?? null,
    [tickets, selectedId],
  );

  const openCount = tickets.filter((t) => t.status === "open").length;

  function applyUpdate(updated: Ticket) {
    setTickets((list) => list.map((t) => (t.id === updated.id ? updated : t)));
  }

  async function sendReply() {
    if (!selected || reply.trim().length < 2) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reply", id: selected.id, body: reply.trim() }),
      });
      const data = await res.json();
      if (data.ok && data.ticket) {
        applyUpdate(data.ticket);
        setReply("");
      }
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus(status: TicketStatus) {
    if (!selected) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "status", id: selected.id, status }),
      });
      const data = await res.json();
      if (data.ok && data.ticket) applyUpdate(data.ticket);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">Klantenservice — tickets</CardTitle>
            <p className="text-sm text-muted-foreground">
              Vragen via het contactformulier en e-mails aan klantenservice@klus-r.nl. Beantwoord
              ze hier; de klant krijgt automatisch een e-mail.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Ververs
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {!emailConfigured && (
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
            E-mail is nog niet geconfigureerd — antwoorden worden in <strong>demo</strong>-modus
            gelogd, niet echt verstuurd. Zet <code>RESEND_API_KEY</code> in de omgeving.
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                filter === f.id ? "bg-klusr-black text-white" : "bg-secondary text-muted-foreground",
              )}
            >
              {f.label}
              {f.id === "open" && openCount > 0 ? ` (${openCount})` : ""}
            </button>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
          {/* Lijst */}
          <ul className="flex max-h-[560px] flex-col gap-1.5 overflow-y-auto pr-1">
            {loading && (
              <li className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Laden…
              </li>
            )}
            {!loading && filtered.length === 0 && (
              <li className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                <Inbox className="h-6 w-6" />
                Geen tickets in deze weergave.
              </li>
            )}
            {filtered.map((t) => (
              <li key={t.id}>
                <button
                  onClick={() => setSelectedId(t.id)}
                  className={cn(
                    "w-full rounded-lg border p-3 text-left transition-colors",
                    selectedId === t.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-secondary",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      {t.channel === "email" ? (
                        <Mail className="h-3.5 w-3.5" />
                      ) : (
                        <MessageSquare className="h-3.5 w-3.5" />
                      )}
                      {t.reference}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                        STATUS_META[t.status].cls,
                      )}
                    >
                      {STATUS_META[t.status].label}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm font-semibold">{t.subject}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {t.customerName ? `${t.customerName} · ` : ""}
                    {t.customerEmail}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{formatDate(t.updatedAt)}</p>
                </button>
              </li>
            ))}
          </ul>

          {/* Detail */}
          <div className="min-w-0">
            {!selected ? (
              <div className="grid h-full min-h-[200px] place-items-center rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Selecteer een ticket om het gesprek te lezen en te beantwoorden.
              </div>
            ) : (
              <div className="flex flex-col gap-4 rounded-lg border border-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-2 border-b border-border pb-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-bold">{selected.subject}</h3>
                    <p className="text-xs text-muted-foreground">
                      {selected.reference} ·{" "}
                      <a href={`mailto:${selected.customerEmail}`} className="hover:text-primary">
                        {selected.customerName
                          ? `${selected.customerName} (${selected.customerEmail})`
                          : selected.customerEmail}
                      </a>
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-semibold",
                      STATUS_META[selected.status].cls,
                    )}
                  >
                    {STATUS_META[selected.status].label}
                  </span>
                </div>

                {/* Gesprek */}
                <div className="flex max-h-[320px] flex-col gap-3 overflow-y-auto">
                  {selected.messages.map((m) => (
                    <div
                      key={m.id}
                      className={cn(
                        "max-w-[85%] rounded-xl px-3 py-2 text-sm",
                        m.from === "agent"
                          ? "self-end bg-klusr-black text-white"
                          : "self-start bg-secondary text-foreground",
                      )}
                    >
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide opacity-70">
                        {m.from === "agent" ? m.authorName || "Klantenservice" : selected.customerName || "Klant"}
                        {" · "}
                        {formatDate(m.createdAt)}
                      </p>
                      <p className="whitespace-pre-wrap leading-relaxed">{m.body}</p>
                    </div>
                  ))}
                </div>

                {/* Antwoord */}
                <div className="flex flex-col gap-2 border-t border-border pt-3">
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows={4}
                    placeholder={`Schrijf een antwoord aan ${selected.customerName || "de klant"}…`}
                    className="w-full resize-y rounded-md border border-input bg-card p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex gap-2">
                      {selected.status !== "closed" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => changeStatus("closed")}
                          disabled={busy}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Markeer afgehandeld
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => changeStatus("open")}
                          disabled={busy}
                        >
                          <RotateCcw className="h-4 w-4" />
                          Heropenen
                        </Button>
                      )}
                    </div>
                    <Button size="sm" onClick={sendReply} disabled={busy || reply.trim().length < 2}>
                      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      Verstuur antwoord
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
