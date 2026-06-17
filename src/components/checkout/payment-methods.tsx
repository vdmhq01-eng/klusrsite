"use client";

import { cn } from "@/lib/utils";
import type { PaymentMethodInfo } from "@/types";
import { useT } from "@/components/i18n/locale-provider";
import type { MessageKey } from "@/lib/i18n/dictionaries";

/** Korte, vertrouwenwekkende hint per methode-soort. */
function hintKeyFor(id: string): MessageKey | undefined {
  if (id === "ideal") return "checkout.payment.hint.ideal";
  if (id === "creditcard") return "checkout.payment.hint.creditcard";
  if (id.startsWith("klarna")) return "checkout.payment.hint.klarna";
  if (id === "bancontact") return "checkout.payment.hint.bancontact";
  return undefined;
}

export function PaymentMethods({
  methods,
  value,
  onChange,
  issuer,
  onIssuerChange,
  loading,
}: {
  methods: PaymentMethodInfo[];
  /** Gekozen methode-id, of null wanneer de klant nog niets koos. */
  value: string | null;
  onChange: (id: string) => void;
  /** Gekozen iDEAL-bank (issuer-id), of null. */
  issuer: string | null;
  onIssuerChange: (id: string) => void;
  loading?: boolean;
}) {
  const t = useT();
  if (loading) {
    return (
      <div className="space-y-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-[60px] animate-pulse rounded-lg border border-border bg-secondary/40" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {methods.map((m) => {
        const active = value === m.id;
        const hintKey = hintKeyFor(m.id);
        const hint = hintKey ? t(hintKey) : undefined;
        const banks = m.issuers ?? [];
        const showIssuers = active && m.id === "ideal" && banks.length > 0;
        return (
          <div key={m.id}>
            <button
              type="button"
              onClick={() => onChange(m.id)}
              aria-pressed={active}
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
              <span className="grid h-9 w-12 shrink-0 place-items-center overflow-hidden rounded border border-border bg-white p-1">
                {m.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.image} alt={m.label} className="max-h-full max-w-full object-contain" />
                ) : (
                  <span className="text-xs font-bold">{m.label.slice(0, 4)}</span>
                )}
              </span>
              <span className="flex-1">
                <span className="block text-sm font-semibold">{m.label}</span>
                {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
              </span>
            </button>

            {/* iDEAL: kies je bank al bij ons → direct door naar de juiste bank. */}
            {showIssuers && (
              <div className="mt-2 rounded-lg border border-border bg-secondary/30 p-3">
                <p className="mb-2 text-xs font-semibold text-muted-foreground">{t("checkout.payment.chooseBank")}</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {banks.map((b) => {
                    const picked = issuer === b.id;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => onIssuerChange(b.id)}
                        aria-pressed={picked}
                        className={cn(
                          "flex items-center gap-2 rounded-md border bg-white p-2 text-left transition-all",
                          picked
                            ? "border-primary ring-1 ring-primary"
                            : "border-border hover:border-primary/40",
                        )}
                      >
                        {b.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={b.image} alt={b.name} className="h-5 w-5 shrink-0 object-contain" />
                        )}
                        <span className="truncate text-xs font-medium">{b.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
