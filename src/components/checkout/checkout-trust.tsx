"use client";

import { BadgeCheck } from "lucide-react";
import { StarRating } from "@/components/product/star-rating";
import { useT } from "@/components/i18n/locale-provider";
import { cn } from "@/lib/utils";
import {
  featuredTestimonials,
  testimonialStats,
} from "@/lib/data/testimonials";

const MONTHS_NL = [
  "januari", "februari", "maart", "april", "mei", "juni",
  "juli", "augustus", "september", "oktober", "november", "december",
];

/** ISO-datum ("2026-05-18") → "mei 2026". Puur op de string, geen Date("now"). */
function humanMonthNl(iso: string): string {
  const [year, month] = iso.split("-");
  const idx = Number(month) - 1;
  const name = MONTHS_NL[idx] ?? "";
  return name ? `${name} ${year}` : iso;
}

/** "4.7" → "4,7" (NL-decimaalkomma). */
function nlDecimal(value: number): string {
  return value.toFixed(1).replace(".", ",");
}

/** 2847 → "2.847" (NL-duizendtalscheiding). */
function nlThousands(value: number): string {
  return value.toLocaleString("nl-NL");
}

export function CheckoutTrust({ className }: { className?: string }) {
  const t = useT();
  const featured = featuredTestimonials(3);

  return (
    <section className={cn("rounded-xl border border-border bg-card p-5", className)}>
      <h2 className="text-sm font-bold">{t("checkout.trust.heading")}</h2>

      <div className="mt-2 flex items-center gap-2">
        <StarRating rating={testimonialStats.average} size="md" showCount={false} />
        <span className="text-xs text-muted-foreground">
          {t("checkout.trust.based", {
            average: nlDecimal(testimonialStats.average),
            count: nlThousands(testimonialStats.count),
          })}
        </span>
      </div>

      <div className="mt-4 space-y-4">
        {featured.map((r) => (
          <div key={r.id} className="border-t border-border pt-4 first:border-t-0 first:pt-0">
            <StarRating rating={r.rating} size="sm" showCount={false} />
            <p className="mt-1.5 text-sm font-semibold">{r.title}</p>
            <p className="mt-1 text-sm leading-snug text-muted-foreground">{r.body}</p>
            <p className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted-foreground">
              <span>{r.author}</span>
              <span aria-hidden>·</span>
              <span>{r.location}</span>
              <span aria-hidden>·</span>
              <span>{humanMonthNl(r.date)}</span>
              <span className="inline-flex items-center gap-1 font-medium text-klusr-stock">
                <BadgeCheck className="h-3.5 w-3.5" />
                {t("checkout.trust.verified")}
              </span>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
