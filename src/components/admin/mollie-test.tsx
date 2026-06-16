"use client";

import { useState } from "react";
import { Loader2, CreditCard, CheckCircle2, AlertTriangle, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MollieResult {
  ok: boolean;
  configured: boolean;
  status: number;
  message: string;
  methods?: string[];
  error?: string;
}

export function MollieTest() {
  const [state, setState] = useState<{ loading: boolean; result: MollieResult | null }>({
    loading: false,
    result: null,
  });

  async function check() {
    setState({ loading: true, result: null });
    try {
      const res = await fetch("/api/admin/mollie-test", { method: "POST" });
      setState({ loading: false, result: (await res.json()) as MollieResult });
    } catch {
      setState({
        loading: false,
        result: { ok: false, configured: false, status: 0, message: "Kon de Mollie-test niet bereiken." },
      });
    }
  }

  const { loading, result } = state;
  const variant: "warn" | "error" | "success" = !result
    ? "warn"
    : !result.configured
      ? "warn"
      : result.ok
        ? "success"
        : "error";
  const Icon =
    variant === "success" ? CheckCircle2 : variant === "warn" ? KeyRound : AlertTriangle;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Mollie</CardTitle>
        <p className="text-sm text-muted-foreground">
          Controleer of de Mollie-sleutel werkt en welke betaalmethoden geactiveerd zijn (er wordt
          geen betaling aangemaakt).
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div>
          <Button onClick={check} disabled={loading} variant="dark">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Controleren…
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4" /> Test Mollie
              </>
            )}
          </Button>
        </div>

        {result && (
          <div
            className={cn(
              "flex items-start gap-3 rounded-lg border p-3 text-sm",
              variant === "success" && "border-klusr-stock/40 bg-klusr-stock/5 text-foreground",
              variant === "warn" && "border-primary/30 bg-primary/5 text-foreground",
              variant === "error" && "border-destructive/30 bg-destructive/5 text-destructive",
            )}
          >
            <Icon
              className={cn(
                "mt-0.5 h-5 w-5 shrink-0",
                variant === "success" && "text-klusr-stock",
                variant === "warn" && "text-primary",
                variant === "error" && "text-destructive",
              )}
            />
            <div className="min-w-0">
              <p className="font-semibold">{result.message}</p>
              {result.methods && result.methods.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {result.methods.map((m) => (
                    <span key={m} className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium">
                      {m}
                    </span>
                  ))}
                </div>
              )}
              {result.error && (
                <pre className="mt-2 max-h-32 overflow-auto rounded-md bg-secondary/60 p-2 text-xs text-muted-foreground">
                  {result.error}
                </pre>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
