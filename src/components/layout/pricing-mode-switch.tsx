"use client";

import { usePricingMode, type PricingMode } from "@/lib/store/pricing-mode";
import { useMounted } from "@/lib/hooks/use-mounted";
import { cn } from "@/lib/utils";

const OPTIONS: { value: PricingMode; label: string }[] = [
  { value: "particulier", label: "Particulier" },
  { value: "zakelijk", label: "Zakelijk" },
];

/** Particulier ⇄ Zakelijk-schakelaar voor de donkere topbar. */
export function PricingModeSwitch({ className }: { className?: string }) {
  const mode = usePricingMode((s) => s.mode);
  const setMode = usePricingMode((s) => s.setMode);
  const mounted = useMounted();
  const active = mounted ? mode : "particulier";

  return (
    <div
      role="group"
      aria-label="Prijzen tonen voor"
      className={cn(
        "inline-flex items-center rounded-full bg-white/10 p-0.5 text-[11px] font-semibold",
        className,
      )}
    >
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => setMode(o.value)}
          aria-pressed={active === o.value}
          className={cn(
            "rounded-full px-2.5 py-1 transition-colors",
            active === o.value
              ? "bg-white text-klusr-black"
              : "text-white/80 hover:text-white",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
