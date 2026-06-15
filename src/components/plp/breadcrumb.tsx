import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Accessible breadcrumb. Always starts at "Home". The last item is rendered as
 * muted, non-interactive text. On mobile the trail scrolls horizontally so long
 * category names never break the layout.
 */
export function Breadcrumb({ items, className }: BreadcrumbProps) {
  const trail: BreadcrumbItem[] = [{ label: "Home", href: "/" }, ...items];

  return (
    <nav aria-label="Kruimelpad" className={cn("w-full", className)}>
      <ol className="no-scrollbar flex items-center gap-1 overflow-x-auto whitespace-nowrap py-3 text-sm text-muted-foreground">
        {trail.map((item, index) => {
          const isLast = index === trail.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1">
              {index > 0 && (
                <ChevronRight
                  className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60"
                  aria-hidden="true"
                />
              )}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="shrink-0 transition-colors hover:text-primary"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn("shrink-0", isLast && "font-semibold text-foreground")}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Inline JSON-LD BreadcrumbList structured data. Render alongside <Breadcrumb />
 * inside a server component. `baseUrl` makes the `item` URLs absolute when known.
 */
export function BreadcrumbJsonLd({
  items,
  baseUrl = "",
}: {
  items: BreadcrumbItem[];
  baseUrl?: string;
}) {
  const trail: BreadcrumbItem[] = [{ label: "Home", href: "/" }, ...items];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: `${baseUrl}${item.href}` } : {}),
    })),
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
