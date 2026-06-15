"use client";

import Link from "next/link";
import { klushulpTasks } from "@/lib/data/klushulp";
import { CategoryIcon } from "@/components/shared/category-icon";
import { trackEvent } from "@/lib/tracking";
import { cn } from "@/lib/utils";

interface KlushulpFunnelProps {
  title?: string;
  subtitle?: string;
  className?: string;
  compact?: boolean;
}

/**
 * "Wat ga je doen?" funnel — shown on the homepage and above product lists.
 */
export function KlushulpFunnel({
  title = "Wat ga je doen?",
  subtitle = "Kies je klus en wij helpen je met de juiste producten en advies.",
  className,
  compact = false,
}: KlushulpFunnelProps) {
  return (
    <section className={cn("container-klusr", className)}>
      <div className="rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
        {!compact && (
          <div className="mb-4">
            <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>
        )}
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {klushulpTasks.map((task) => (
            <Link
              key={task.id}
              href={`/klushulp/${task.slug}`}
              onClick={() =>
                trackEvent("klusadvies_started", { task: task.slug, source: "funnel" })
              }
              className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-background p-3 text-center transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card"
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
