import { Hammer, ShieldCheck, Sparkles, Truck } from "lucide-react";

const usps = [
  { icon: Sparkles, label: "Advies van ex-schilders" },
  { icon: ShieldCheck, label: "Professionele kwaliteit" },
  { icon: Hammer, label: "Alles voor jouw klus" },
  { icon: Truck, label: "Voor 16:00 besteld, morgen in huis" },
];

export function TopBar() {
  return (
    <div className="bg-klusr-black text-white">
      <div className="container-klusr">
        {/* Desktop: spread USPs */}
        <div className="hidden h-9 items-center justify-center gap-8 text-xs font-medium md:flex">
          {usps.map(({ icon: Icon, label }) => (
            <span key={label} className="inline-flex items-center gap-1.5">
              <Icon className="h-3.5 w-3.5 text-klusr-action" />
              {label}
            </span>
          ))}
        </div>
        {/* Mobile: marquee */}
        <div className="flex h-8 items-center overflow-hidden md:hidden">
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
      </div>
    </div>
  );
}
