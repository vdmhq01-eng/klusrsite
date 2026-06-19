"use client";

import { useSession } from "next-auth/react";
import { formatPrice, cn } from "@/lib/utils";
import { usePricingMode } from "@/lib/store/pricing-mode";
import { useMounted } from "@/lib/hooks/use-mounted";
import { priceView } from "@/lib/pricing";
import { useT } from "@/components/i18n/locale-provider";
import type { MessageKey } from "@/lib/i18n/dictionaries";

/**
 * `pricing.ts` levert `referenceLabel` ("Adviesprijs"/"Normaal") en `vatSuffix`
 * ("incl. btw"/"excl. btw") als vaste NL-strings. We veranderen die return-waarden
 * niet, maar mappen ze hier naar vertaalsleutels zodat NL identiek blijft en de
 * overige talen vertalen.
 */
const REFERENCE_LABEL_KEY: Record<string, MessageKey> = {
  Adviesprijs: "price.advies",
  Normaal: "price.normal",
};
const VAT_SUFFIX_KEY: Record<string, MessageKey> = {
  "incl. btw": "price.inclVat",
  "excl. btw": "price.exclVat",
};

interface PriceProps {
  price: number;
  compareAtPrice?: number;
  kluspasPrice?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Toon "vanaf" voor de prijs (bij meerdere varianten). */
  from?: boolean;
}

/**
 * KLUSR price block. Modusbewust: particulier toont de KLUSR-prijs incl. btw met
 * (indien aanwezig) de adviesprijs doorgestreept; zakelijk toont de ProfPas-prijs
 * excl. btw. Tot hydratie tonen we particulier (voorkomt hydration-mismatch).
 */
export function Price({
  price,
  compareAtPrice,
  kluspasPrice,
  size = "md",
  className,
  from,
}: PriceProps) {
  const t = useT();
  const mode = usePricingMode((s) => s.mode);
  const mounted = useMounted();
  // De KLUSRPAS-prijs is een ingelogd voordeel. Tot hydratie (en voor gasten)
  // tonen we de normale prijs; ingelogde bezoekers krijgen de pasprijs ook op
  // de kaarten. Bij gasten verschijnt een subtiele "met KLUSRPAS"-hint.
  // De sessie is pas betrouwbaar zodra `status` is geresolved; tot die tijd (en
  // vóór hydratie) is het pasgebied "onbekend" → een dunne skeleton i.p.v. de
  // gast-hint, zodat een ingelogde bezoeker niet eerst de teaser ziet flitsen.
  const { data: session, status } = useSession();
  const passResolved = mounted && status !== "loading";
  const member = passResolved && Boolean(session);
  const view = priceView(
    { price, kluspasPrice, compareAtPrice },
    mounted ? mode : "particulier",
    member,
  );
  // Heeft dit product een pasprijs? (Vóór resolve is `view` de gast-vorm, dus de
  // teaser-velden verraden of er überhaupt een pas-subregel komt.)
  const hasPassLine = view.passAmount !== undefined || (view.savings !== undefined && view.savings > 0);

  const mainSize = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-3xl",
  }[size];

  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      {view.reference && (
        <span className="text-xs text-muted-foreground">
          {view.referenceLabel ? t(REFERENCE_LABEL_KEY[view.referenceLabel]) : null}{" "}
          <span className="line-through">{formatPrice(view.reference)}</span>
        </span>
      )}
      <div className="flex items-baseline gap-1.5">
        {from && (
          <span className="text-xs font-medium text-muted-foreground">{t("price.from")}</span>
        )}
        <span className={cn("font-extrabold leading-none text-primary", mainSize)}>
          {formatPrice(view.amount)}
        </span>
        {view.badge && (
          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-primary">
            {view.badge}
          </span>
        )}
        <span className="text-[10px] font-medium text-muted-foreground">
          {t(VAT_SUFFIX_KEY[view.vatSuffix])}
        </span>
      </div>
      {/* Pas-subregel: zolang de sessiestatus onbekend is (vóór hydratie /
          "loading") tonen we een dunne skeleton i.p.v. de gast-hint, zodat een
          ingelogde bezoeker niet eerst de teaser ziet flitsen. Rendert op SSR/
          eerste paint identiek → hydration-safe. */}
      {!passResolved ? (
        hasPassLine && (
          <span
            aria-hidden
            className="h-[14px] w-24 animate-pulse rounded bg-secondary/60 motion-reduce:animate-none"
          />
        )
      ) : (
        <>
          {/* Ingelogd: pasprijs toegepast → subtiele "Jouw prijs"-cue. */}
          {view.savings !== undefined && view.savings > 0 && (
            <span className="text-[11px] font-semibold text-klusr-stock">
              <span className="text-primary">{t("pdp.yourPrice")}</span>
              {" · "}
              {t("price.save", { amount: formatPrice(view.savings) })}
              {view.savingsPct ? t("price.savePct", { pct: view.savingsPct }) : ""}
              {view.savingsVsAdvies ? t("price.vsAdvies") : ""}
            </span>
          )}
          {/* Gast-hint: de pasprijs is een ingelogd voordeel. Subtiel, geen losse
              knoppen op de kaart — de CTA staat op de PDP/in de winkelwagen. */}
          {view.passAmount !== undefined && (
            <span className="text-[11px] font-semibold text-primary">
              {t("pdp.kluspas.teaserTitle", { price: formatPrice(view.passAmount) })}
            </span>
          )}
        </>
      )}
    </div>
  );
}
