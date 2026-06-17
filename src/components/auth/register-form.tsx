"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Account aanmaken — echte accounts met e-mailbevestiging. */
export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
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
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; verified?: boolean };
      if (!res.ok) {
        setError(data.error || "Registreren lukte niet. Probeer het opnieuw.");
        setLoading(false);
        return;
      }
      if (data.verified) {
        // Geen e-mailverificatie geconfigureerd → meteen inloggen.
        await signIn("credentials", { email, password, redirect: false });
        router.push("/account");
        router.refresh();
      } else {
        setSentTo(email);
        setLoading(false);
      }
    } catch {
      setError("Er ging iets mis. Probeer het opnieuw.");
      setLoading(false);
    }
  }

  if (sentTo) {
    return (
      <div className="mt-6 flex flex-col items-center gap-4 rounded-xl border border-border bg-secondary/40 p-6 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
          <MailCheck className="h-6 w-6" />
        </span>
        <div>
          <h2 className="text-lg font-bold">Bevestig je e-mailadres</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            We hebben een bevestigingslink gestuurd naar{" "}
            <span className="font-semibold text-foreground">{sentTo}</span>. Klik op de link om je
            account te activeren; daarna kun je inloggen.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/inloggen">Naar inloggen</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Naam</Label>
        <Input id="name" name="name" type="text" autoComplete="name" required placeholder="Voor- en achternaam" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">E-mailadres</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder="jij@voorbeeld.nl" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Wachtwoord</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} placeholder="Minimaal 8 tekens" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirm">Herhaal wachtwoord</Label>
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required minLength={8} placeholder="••••••••" />
      </div>

      {error && (
        <p className="rounded-md bg-destructive/5 px-3 py-2 text-sm font-medium text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Account aanmaken"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Al een account?{" "}
        <Link href="/inloggen" className="font-semibold text-primary hover:underline">
          Inloggen
        </Link>
      </p>
    </form>
  );
}
