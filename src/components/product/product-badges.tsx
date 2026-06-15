import { Badge } from "@/components/ui/badge";
import type { ProductBadge } from "@/types";

const badgeVariantMap: Record<
  ProductBadge,
  "action" | "bestseller" | "pro" | "nieuw" | "bundel"
> = {
  ACTIE: "action",
  BESTSELLER: "bestseller",
  "PRO KEUZE": "pro",
  NIEUW: "nieuw",
  BUNDEL: "bundel",
};

export function ProductBadges({
  badges,
  limit = 2,
}: {
  badges?: ProductBadge[];
  limit?: number;
}) {
  if (!badges?.length) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {badges.slice(0, limit).map((b) => (
        <Badge key={b} variant={badgeVariantMap[b]}>
          {b}
        </Badge>
      ))}
    </div>
  );
}
