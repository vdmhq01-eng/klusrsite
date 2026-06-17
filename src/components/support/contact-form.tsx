"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Contactformulier dat een klantenservice-ticket aanmaakt. */
export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [reference, setReference] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      subject: String(fd.get("subject") || ""),
      message: String(fd.get("message") || ""),
      website: String(fd.get("website") || ""), // honeypot
    };

    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/support/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setReference(data.reference ?? null);
        setStatus("done");
        form.reset();
      } else {
        setError(
          data.error === "invalid-email"
            ? "Vul een geldig e-mailadres in."
            : data.error === "message-too-short"
              ? "Je bericht is te kort."
              : "Er ging iets mis. Probeer het later opnieuw.",
        );
        setStatus("error");
      }
    } catch {
      setError("Er ging iets mis. Probeer het later opnieuw.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="flex flex-col items-start gap-3 rounded-xl border border-klusr-stock/30 bg-klusr-stock/5 p-6">
        <span className="inline-flex items-center gap-2 font-bold text-klusr-stock">
          <CheckCircle2 className="h-5 w-5" />
          Bericht verstuurd!
        </span>
        <p className="text-sm text-muted-foreground">
          Bedankt voor je bericht. We reageren meestal binnen 1 werkdag.
          {reference && (
            <>
              {" "}
              Je ticketnummer is <strong className="text-foreground">{reference}</strong> — je vindt
              dit ook in je bevestigingsmail.
            </>
          )}
        </p>
        <Button variant="outline" size="sm" onClick={() => setStatus("idle")}>
          Nog een vraag stellen
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {/* Honeypot: voor mensen verborgen, bots vullen het in. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Naam
          <input
            name="name"
            type="text"
            autoComplete="name"
            className="h-11 rounded-md border border-input bg-card px-3 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          E-mailadres <span className="text-primary">*</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="h-11 rounded-md border border-input bg-card px-3 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Onderwerp
        <input
          name="subject"
          type="text"
          placeholder="Bijv. Vraag over mijn bestelling"
          className="h-11 rounded-md border border-input bg-card px-3 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Je bericht <span className="text-primary">*</span>
        <textarea
          name="message"
          required
          rows={5}
          placeholder="Waarmee kunnen we je helpen?"
          className="resize-y rounded-md border border-input bg-card p-3 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </label>

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}

      <div className="flex items-center gap-3">
        <Button type="submit" size="lg" disabled={status === "sending"}>
          {status === "sending" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Verstuur bericht
        </Button>
        <span className="text-xs text-muted-foreground">Reactie binnen 1 werkdag</span>
      </div>
    </form>
  );
}
