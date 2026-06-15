"use client";

import { cn } from "@/lib/utils";

export type PaymentMethodId = "ideal" | "bancontact" | "creditcard" | "klarna";

interface Method {
  id: PaymentMethodId;
  label: string;
  hint?: string;
  badge: React.ReactNode;
}

const methods: Method[] = [
  {
    id: "ideal",
    label: "iDEAL",
    hint: "Betaal direct met je eigen bank",
    badge: <span className="font-black text-[#CC0066]">iDEAL</span>,
  },
  {
    id: "bancontact",
    label: "Bancontact",
    badge: <span className="font-black text-[#003087]">BC</span>,
  },
  {
    id: "creditcard",
    label: "Creditcard",
    hint: "Visa, Mastercard",
    badge: <span className="font-bold text-foreground">••••</span>,
  },
  {
    id: "klarna",
    label: "Achteraf betalen",
    hint: "Klarna — betaal binnen 14 dagen",
    badge: <span className="font-black text-[#FFB3C7]">K.</span>,
  },
];

export function PaymentMethods({
  value,
  onChange,
}: {
  value: PaymentMethodId;
  onChange: (id: PaymentMethodId) => void;
}) {
  return (
    <div className="space-y-2">
      {methods.map((m) => {
        const active = value === m.id;
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onChange(m.id)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all",
              active
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-border bg-card hover:border-primary/40",
            )}
          >
            <span
              className={cn(
                "grid h-5 w-5 shrink-0 place-items-center rounded-full border-2",
                active ? "border-primary" : "border-input",
              )}
            >
              {active && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
            </span>
            <span className="grid h-9 w-12 shrink-0 place-items-center rounded border border-border bg-white text-sm">
              {m.badge}
            </span>
            <span className="flex-1">
              <span className="block text-sm font-semibold">{m.label}</span>
              {m.hint && <span className="block text-xs text-muted-foreground">{m.hint}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}
