import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * On-brand visual ter vervanging van willekeurige stockfoto's.
 *
 * Rendert een deterministisch KLUSR-gradient (rood/antraciet) met optioneel een
 * groot, subtiel productlogo-icoon. Volledig self-contained — geen externe
 * afbeeldingen, dus nooit meer een walrus of baby waar verf hoort te staan.
 * Vervang dit door echte fotografie zodra er een beeldbron (bv. via Channable)
 * beschikbaar is.
 */
const GRADIENTS = [
  "from-klusr-black via-zinc-800 to-zinc-900",
  "from-primary via-red-800 to-klusr-black",
  "from-zinc-800 via-zinc-900 to-primary/70",
  "from-red-700 via-red-900 to-klusr-black",
  "from-zinc-700 via-zinc-800 to-zinc-950",
  "from-orange-700 via-red-800 to-zinc-900",
];

function pickGradient(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return GRADIENTS[h % GRADIENTS.length];
}

export function BrandedVisual({
  seed = "klusr",
  icon: Icon,
  className,
}: {
  seed?: string;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn("absolute inset-0 bg-gradient-to-br", pickGradient(seed), className)}
    >
      {Icon && (
        <Icon
          className="absolute -bottom-8 -right-8 h-44 w-44 text-white/10"
          strokeWidth={1.25}
        />
      )}
    </div>
  );
}
