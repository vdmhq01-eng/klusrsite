"use client";

import { useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/tracking";
import { cn } from "@/lib/utils";

interface NewsletterFormProps {
  className?: string;
  source?: string;
  dark?: boolean;
}

export function NewsletterForm({ className, source = "site", dark = true }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      setStatus("error");
      setMessage("Vul een geldig e-mailadres in.");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Er ging iets mis");
      setStatus("success");
      setMessage(data.message || "Bedankt voor je inschrijving!");
      trackEvent("newsletter_signup", { source });
      trackEvent("sign_up", { method: "newsletter" });
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Er ging iets mis");
    }
  }

  if (status === "success") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg border p-4",
          dark ? "border-white/15 bg-white/5 text-white" : "border-border bg-card",
          className,
        )}
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-klusr-stock text-white">
          <Check className="h-4 w-4" strokeWidth={3} />
        </span>
        <p className="text-sm font-medium">{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={cn("w-full", className)}>
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Jouw e-mailadres"
          className={cn(
            "h-12 flex-1 rounded-md border px-4 text-sm text-foreground outline-none ring-primary/30 focus:ring-2",
            dark ? "border-white/20 bg-white" : "border-border bg-card",
          )}
          aria-label="E-mailadres"
        />
        <Button type="submit" size="lg" disabled={status === "loading"}>
          {status === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <span className="hidden sm:inline">Inschrijven</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
      {status === "error" && (
        <p className="mt-2 text-xs font-medium text-klusr-action">{message}</p>
      )}
      <p className={cn("mt-2 text-xs", dark ? "text-white/50" : "text-muted-foreground")}>
        Je kunt je op elk moment weer uitschrijven.
      </p>
    </form>
  );
}
