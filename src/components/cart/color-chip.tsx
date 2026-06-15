import type { SelectedColor } from "@/types";
import { cn } from "@/lib/utils";

/** Small swatch + colour code/name, shown on cart lines and checkout. */
export function ColorChip({
  color,
  className,
}: {
  color: SelectedColor;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-2 py-0.5 text-xs font-medium",
        className,
      )}
    >
      <span
        className="h-3.5 w-3.5 rounded-full border border-black/10"
        style={{ backgroundColor: color.hex }}
      />
      {color.name} · {color.code}
    </span>
  );
}
