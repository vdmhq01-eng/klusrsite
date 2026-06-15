"use client";

import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/tracking";

interface KlusadviesTrackerProps {
  /** Task slug, used as the `task` dimension on the tracking events. */
  task: string;
}

/**
 * Fires `klusadvies_started` once on mount for a klushulp detail page and
 * exposes a small "klus voltooid" action that fires `klusadvies_completed`.
 * Purely analytics — renders an unobtrusive completion prompt.
 */
export function KlusadviesTracker({ task }: KlusadviesTrackerProps) {
  useEffect(() => {
    trackEvent("klusadvies_started", { task, source: "klushulp_detail" });
  }, [task]);

  return (
    <div className="flex flex-col items-start gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-klusr-stock" />
        Klaar met dit stappenplan? Laat het ons weten — zo verbeteren we onze
        klushulp.
      </div>
      <Button
        variant="outline"
        size="sm"
        className="shrink-0"
        onClick={() =>
          trackEvent("klusadvies_completed", { task, source: "klushulp_detail" })
        }
      >
        Klus voltooid
      </Button>
    </div>
  );
}
