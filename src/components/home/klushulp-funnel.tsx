"use client";

import Link from "next/link";
import { klushulpTasks } from "@/lib/data/klushulp";
import { CategoryIcon } from "@/components/shared/category-icon";
import { trackEvent } from "@/lib/tracking";
import { cn } from "@/lib/utils";
import { useT } from "@/components/i18n/locale-provider";

interface KlushulpFunnelProps {
  title?: string;
  subtitle?: string;
  className?: string;
  compact?: boolean;
  /** Beperk de klussen tot wat bij deze categorie past (relatedCategories). */
  categorySlug?: string;
}

/**
 * "Wat ga je doen?" funnel — shown on the homepage and above product lists.
 */
export function KlushulpFunnel({
  title,
  subtitle,
  className,
  compact = false,
  categorySlug,
}: KlushulpFunnelProps) {
  const t = useT();
  // Standaardteksten komen uit de i18n-catalogus; expliciete props (bv. op de
  // klushulp-pagina) overschrijven ze ongewijzigd.
  const heading = title ?? t("home.funnel.title");
  const sub = subtitle ?? t("home.funnel.subtitle");
  const tasks = categorySlug
    ? klushulpTasks.filter((task) => task.relatedCategories.includes(categorySlug))
    : klushulpTasks;
  if (tasks.length === 0) return null;

  return (
    <section className={cn("container-klusr", className)}>
      <div className="rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
        {!compact && (
          <div className="mb-4">
            <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">{heading}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{sub}</p>
          </div>
        )}
        <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 no-scrollbar sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0 lg:grid-cols-7">
          {tasks.map((task) => (
            <Link
              key={task.id}
              href={`/klushulp/${task.slug}`}
              onClick={() =>
                trackEvent("klusadvies_started", { task: task.slug, source: "funnel" })
              }
              className="group flex shrink-0 basis-20 flex-col items-center gap-2 rounded-xl border border-border bg-background p-3 text-center transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card sm:basis-auto"
            >
              <span className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <CategoryIcon name={task.icon} className="h-6 w-6" />
              </span>
              <span className="text-xs font-semibold leading-tight">{task.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
