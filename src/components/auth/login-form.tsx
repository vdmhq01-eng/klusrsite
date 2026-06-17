"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, MailCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** E-mail + wachtwoord of magic-link login (NextAuth Credentials). */
export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dest =
    searchParams.get("redirect") || searchParams.get("callbackUrl") || "/account";
  const verify = searchParams.get("verify");

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email,
      password: String(form.get("password") ?? ""),
      redirect: false,
    });
    setLoading(false);
    if (!res || res.error) {
      setError("Onjuist e-mailadres of wachtwoord — of je account is nog niet bevestigd.");
      return;
    }
    router.push(dest);
    router.refresh();
  }

  async function sendMagic() {
    setError(null);
    if (!EMAIL_RE.test(email)) {
      setError("Vul eerst je e-mailadres in voor een inloglink.");
      return;
    }
    setMagicLoading(true);
    try {
      await fetch("/api/auth/magic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setMagicSent(true);
    } catch {
      setError("Versturen lukte niet. Probeer het opnieuw.");
    }
    setMagicLoading(false);
  }

  if (magicSent) {
    return (
      <div className="mt-6 flex flex-col items-center gap-4 rounded-xl border border-border bg-secondary/40 p-6 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
          <MailCheck className="h-6 w-6" />
        </span>
        <div>
          <h2 className="text-lg font-bold">Check je mail</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            We hebben een inloglink gestuurd naar{" "}
            <span className="font-semibold text-foreground">{email}</span>. De link is 30 minuten
            geldig.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-col gap-4">
      {verify === "ok" && (
        <p className="rounded-md bg-klusr-stock/10 px-3 py-2 text-sm font-medium text-klusr-stock">
          Je e-mailadres is bevestigd. Je kunt nu inloggen.
        </p>
      )}
      {verify === "invalid" && (
        <p className="rounded-md bg-destructive/5 px-3 py-2 text-sm font-medium text-destructive">
          De bevestigingslink is verlopen of ongeldig. Vraag een nieuwe aan.
        </p>
      )}

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
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Wachtwoord</Label>
            <Link
              href="/wachtwoord-vergeten"
              className="text-xs font-medium text-primary hover:underline"
            >
              Wachtwoord vergeten?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="rounded-md bg-destructive/5 px-3 py-2 text-sm font-medium text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Inloggen"}
        </Button>
      </form>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        of
        <span className="h-px flex-1 bg-border" />
      </div>

      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full gap-2"
        onClick={sendMagic}
        disabled={magicLoading}
      >
        {magicLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Stuur me een inloglink
          </>
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Nog geen account?{" "}
        <Link href="/registreren" className="font-semibold text-primary hover:underline">
          Account aanmaken
        </Link>
      </p>
    </div>
  );
}
