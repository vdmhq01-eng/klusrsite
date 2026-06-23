import { Hammer, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { PricingModeSwitch } from "./pricing-mode-switch";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { t } from "@/lib/i18n/server";

export function TopBar() {
  const usps = [
    { icon: Sparkles, label: t("usp.advice") },
    { icon: ShieldCheck, label: t("usp.quality") },
    { icon: Hammer, label: t("usp.everything") },
    { icon: Truck, label: t("usp.delivery") },
  ];

  return (
    <div className="bg-klusr-black text-white">
      <div className="container-klusr">
        {/* Desktop: USPs gecentreerd, prijsschakelaar rechts */}
        <div className="relative hidden h-9 items-center justify-center gap-8 text-xs font-medium md:flex">
          {usps.map(({ icon: Icon, label }) => (
            <span key={label} className="inline-flex items-center gap-1.5">
              <Icon className="h-3.5 w-3.5 text-klusr-action" />
              {label}
            </span>
          ))}
          <div className="absolute right-0 flex items-center gap-3">
            {/* Taalschakelaar alleen op grote schermen; daaronder zit 'm in het
                mobiele menu (hamburger). Rendert niets als i18n uit staat. */}
            <LanguageSwitcher className="hidden lg:flex" />
            <PricingModeSwitch />
          </div>
        </div>
        {/* Mobile: marquee + prijsschakelaar rechts */}
        <div className="flex h-9 items-center gap-2 md:hidden">
          <div className="flex min-w-0 flex-1 items-center overflow-hidden">
            <div className="flex animate-marquee whitespace-nowrap">
              {[...usps, ...usps].map(({ icon: Icon, label }, i) => (
                <span
                  key={i}
                  className="mx-4 inline-flex items-center gap-1.5 text-xs font-medium"
                >
                  <Icon className="h-3.5 w-3.5 text-klusr-action" />
                  {label}
                </span>
              ))}
            </div>
          </div>
          <PricingModeSwitch className="shrink-0" />
        </div>
      </div>
    </div>
  );
}
