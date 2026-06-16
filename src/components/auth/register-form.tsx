"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Account aanmaken (NextAuth Credentials — demo, geen database). */
export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");

    if (password.length < 6) {
      setError("Je wachtwoord moet minimaal 6 tekens zijn.");
      return;
    }
    if (password !== confirm) {
      setError("De wachtwoorden komen niet overeen.");
      return;
    }

    setLoading(true);
    const res = await signIn("credentials", { email, password, name, redirect: false });
    setLoading(false);
    if (!res || res.error) {
      setError("Registreren lukte niet. Controleer je gegevens en probeer opnieuw.");
      return;
    }
    router.push("/account");
    router.refresh();
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
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={6} placeholder="Minimaal 6 tekens" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirm">Herhaal wachtwoord</Label>
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required minLength={6} placeholder="••••••••" />
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
