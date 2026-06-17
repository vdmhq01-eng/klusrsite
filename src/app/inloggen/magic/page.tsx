"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

function MagicInner() {
  const params = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState(false);

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setError(true);
      return;
    }
    signIn("credentials", { magicToken: token, redirect: false })
      .then((res) => {
        if (res?.ok) router.replace("/account");
        else setError(true);
      })
      .catch(() => setError(true));
  }, [params, router]);

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-secondary text-muted-foreground">
          <ShieldAlert className="h-7 w-7" />
        </span>
        <div>
          <h1 className="text-2xl font-black tracking-tight">Link verlopen of ongeldig</h1>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Deze inloglink werkt niet meer (hij is 30 minuten geldig en eenmalig). Vraag een
            nieuwe link aan.
          </p>
        </div>
        <Button asChild>
          <Link href="/inloggen">Naar inloggen</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 text-center text-muted-foreground">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm font-medium">Je wordt ingelogd…</p>
    </div>
  );
}

export default function MagicPage() {
  return (
    <div className="container-klusr flex min-h-[60vh] items-center justify-center py-16">
      <Suspense
        fallback={
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm">Even geduld…</p>
          </div>
        }
      >
        <MagicInner />
      </Suspense>
    </div>
  );
}
