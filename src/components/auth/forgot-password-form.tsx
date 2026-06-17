"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Vraag een wachtwoord-herstellink aan. */
export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!EMAIL_RE.test(email)) {
      setError("Vul een geldig e-mailadres in.");
      return;
    }
    setLoading(true);
    try {
      await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch {
      setError("Versturen lukte niet. Probeer het opnieuw.");
    }
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="mt-6 flex flex-col items-center gap-4 rounded-xl border border-border bg-secondary/40 p-6 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
          <MailCheck className="h-6 w-6" />
        </span>
        <div>
          <h2 className="text-lg font-bold">Check je mail</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Bestaat er een account met{" "}
            <span className="font-semibold text-foreground">{email}</span>, dan hebben we een
            herstellink gestuurd. De link is 60 minuten geldig.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/inloggen">Terug naar inloggen</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-col gap-4">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mailadres</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jij@voorbeeld.nl"
          />
        </div>

        {error && (
          <p className="rounded-md bg-destructive/5 px-3 py-2 text-sm font-medium text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Stuur herstellink"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Weet je je wachtwoord weer?{" "}
        <Link href="/inloggen" className="font-semibold text-primary hover:underline">
          Inloggen
        </Link>
      </p>
    </div>
  );
}
