"use client";

import { Scale } from "lucide-react";
import { toast } from "sonner";
import { useCompare, MAX_COMPARE } from "@/lib/store/compare";
import { useMounted } from "@/lib/hooks/use-mounted";
import { cn } from "@/lib/utils";

/** Toggle om een product in de vergelijking te zetten. */
export function CompareButton({
  productId,
  variant = "icon",
  className,
}: {
  productId: string;
  variant?: "icon" | "labeled";
  className?: string;
}) {
  const ids = useCompare((s) => s.ids);
  const toggle = useCompare((s) => s.toggle);
  const mounted = useMounted();
  const active = mounted && ids.includes(productId);

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!active && ids.length >= MAX_COMPARE) {
      toast(`Je kunt maximaal ${MAX_COMPARE} producten vergelijken`);
      return;
    }
    const added = toggle(productId);
    toast(added ? "Toegevoegd om te vergelijken" : "Verwijderd uit vergelijken");
  }

  if (variant === "labeled") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={cn(
          "inline-flex items-center gap-1.5 text-sm font-medium transition-colors",
          active ? "text-primary" : "text-muted-foreground hover:text-primary",
          className,
        )}
      >
        <Scale className="h-4 w-4" />
        {active ? "In vergelijking" : "Vergelijk"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label="Vergelijk dit product"
      className={cn(
        "pointer-events-auto grid h-8 w-8 place-items-center rounded-full bg-card/90 shadow-sm backdrop-blur transition-colors",
        active ? "text-primary" : "text-muted-foreground hover:text-primary",
        className,
      )}
    >
      <Scale className={cn("h-4 w-4", active && "fill-primary/20")} />
    </button>
  );
}
