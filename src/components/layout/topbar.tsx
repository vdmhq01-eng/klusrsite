import { Hammer, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { PricingModeSwitch } from "./pricing-mode-switch";

const usps = [
  { icon: Sparkles, label: "Advies van ex-schilders" },
  { icon: ShieldCheck, label: "Professionele kwaliteit" },
  { icon: Hammer, label: "Alles voor jouw klus" },
  { icon: Truck, label: "Voor 19:00 besteld, morgen in huis" },
];

export function TopBar() {
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
          <PricingModeSwitch className="absolute right-0" />
        </div>
        {/* Mobile: marquee + prijsschakelaar rechts */}
        <div className="flex h-9 items-center gap-2 md:hidden">
          <div className="flex flex-1 items-center overflow-hidden">
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
