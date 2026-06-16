"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  className?: string;
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  size = "md",
  className,
}: QuantityStepperProps) {
  const btn =
    size === "sm" ? "h-8 w-8" : "h-11 w-11";
  const text = size === "sm" ? "w-8 text-sm" : "w-12 text-base";

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border border-input bg-card",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Minder"
        className={cn(
          "grid place-items-center rounded-l-md text-foreground transition-colors hover:bg-secondary disabled:opacity-40",
          btn,
        )}
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className={cn("text-center font-semibold tabular-nums", text)}>{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Meer"
        className={cn(
          "grid place-items-center rounded-r-md text-foreground transition-colors hover:bg-secondary disabled:opacity-40",
          btn,
        )}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
