"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Stel een nieuw wachtwoord in via een herstel-token uit de e-mail. */
export function ResetPasswordForm() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");

    if (password.length < 8) {
      setError("Je wachtwoord moet minimaal 8 tekens zijn.");
      return;
    }
    if (password !== confirm) {
      setError("De wachtwoorden komen niet overeen.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Opnieuw instellen lukte niet. Probeer het opnieuw.");
        setLoading(false);
        return;
      }
      setDone(true);
    } catch {
      setError("Er ging iets mis. Probeer het opnieuw.");
    }
    setLoading(false);
  }

  if (!token) {
    return (
      <div className="mt-6 flex flex-col items-center gap-4 rounded-xl border border-border bg-secondary/40 p-6 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-secondary text-muted-foreground">
          <ShieldAlert className="h-6 w-6" />
        </span>
        <div>
          <h2 className="text-lg font-bold">Geen geldige herstellink</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Deze link is onvolledig of verlopen. Vraag een nieuwe herstellink aan.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/wachtwoord-vergeten">Nieuwe link aanvragen</Link>
        </Button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="mt-6 flex flex-col items-center gap-4 rounded-xl border border-border bg-secondary/40 p-6 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="h-6 w-6" />
        </span>
        <div>
          <h2 className="text-lg font-bold">Wachtwoord opgeslagen</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Je nieuwe wachtwoord is ingesteld. Je kunt nu inloggen.
          </p>
        </div>
        <Button asChild>
          <Link href="/inloggen">Naar inloggen</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
      <div className="space-y-1.5">
        <Label htmlFor="password">Nieuw wachtwoord</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="Minimaal 8 tekens"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirm">Herhaal wachtwoord</Label>
        <Input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="••••••••"
        />
      </div>

      {error && (
        <p className="rounded-md bg-destructive/5 px-3 py-2 text-sm font-medium text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Wachtwoord opslaan"}
      </Button>
    </form>
  );
}
