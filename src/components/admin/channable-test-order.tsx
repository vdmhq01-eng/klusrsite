"use client";

import { useState } from "react";
import { Loader2, Send, CheckCircle2, AlertTriangle, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** Vorm van het antwoord van /api/admin/channable-test-order (zie sendTestOrder). */
interface TestOrderResult {
  ok: boolean;
  status: number;
  configured: boolean;
  message: string;
  response?: unknown;
}

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; result: TestOrderResult };

export function ChannableTestOrder() {
  const [state, setState] = useState<State>({ status: "idle" });

  async function send() {
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/admin/channable-test-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const result = (await res.json()) as TestOrderResult;
      setState({ status: "done", result });
    } catch {
      setState({
        status: "done",
        result: {
          ok: false,
          status: 0,
          configured: false,
          message: "Kon de testorder-route niet bereiken. Probeer het opnieuw.",
        },
      });
    }
  }

  const loading = state.status === "loading";
  const result = state.status === "done" ? state.result : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Channable</CardTitle>
        <p className="text-sm text-muted-foreground">
          Stuur een gemarkeerde testorder naar de Channable Orders-API om de
          koppeling (Channable → Tilroy) te controleren. Er wordt een neppe klant
          &quot;KLUSR Test&quot; met één voorbeeldregel verstuurd.
        </p>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <div>
          <Button onClick={send} disabled={loading} variant="dark">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Bezig met versturen…
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Stuur testorder
              </>
            )}
          </Button>
        </div>

        {result && <ResultPanel result={result} />}
      </CardContent>
    </Card>
  );
}

function ResultPanel({ result }: { result: TestOrderResult }) {
  // Drie toestanden: niet geconfigureerd, fout, of succes.
  const variant: "warn" | "error" | "success" = !result.configured
    ? "warn"
    : result.ok
      ? "success"
      : "error";

  const Icon =
    variant === "success" ? CheckCircle2 : variant === "warn" ? KeyRound : AlertTriangle;

  return (
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
        {result.configured && result.status > 0 && (
          <p className="mt-0.5 text-xs text-muted-foreground">HTTP {result.status}</p>
        )}
        {result.response != null && (
          <pre className="mt-2 max-h-40 overflow-auto rounded-md bg-secondary/60 p-2 text-xs text-muted-foreground">
            {typeof result.response === "string"
              ? result.response
              : JSON.stringify(result.response, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
