"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const KEY = "klusr-consent";

interface Consent {
  analytics: boolean;
  marketing: boolean;
  ts: number;
}

/** Push een Consent Mode v2-update + dataLayer-event op basis van de keuze. */
function applyConsent(c: Consent) {
  const w = window as unknown as { dataLayer: unknown[] };
  w.dataLayer = w.dataLayer || [];
  // Google Consent Mode verwacht een gtag()-aanroep (het arguments-object).
  const gtag: (...args: unknown[]) => void = function () {
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer.push(arguments);
  };
  gtag("consent", "update", {
    analytics_storage: c.analytics ? "granted" : "denied",
    ad_storage: c.marketing ? "granted" : "denied",
    ad_user_data: c.marketing ? "granted" : "denied",
    ad_personalization: c.marketing ? "granted" : "denied",
    personalization_storage: c.marketing ? "granted" : "denied",
  });
  w.dataLayer.push({
    event: "consent_update",
    consent_analytics: c.analytics,
    consent_marketing: c.marketing,
  });
}

/**
 * AVG-cookiebanner (CMP) gekoppeld aan Google Consent Mode v2.
 *
 * Standaard alles geweigerd (zie ConsentDefault). De bezoeker kiest hier; de
 * keuze wordt bewaard en als consent-update doorgegeven aan GTM. Heropenen kan
 * via het event `klusr:open-consent` (bv. vanuit het cookiebeleid).
 */
export function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(true);

  useEffect(() => {
    let has = false;
    try {
      has = Boolean(localStorage.getItem(KEY));
    } catch {
      has = false;
    }
    if (!has) setOpen(true);

    const reopen = () => {
      setShowPrefs(true);
      setOpen(true);
    };
    window.addEventListener("klusr:open-consent", reopen);
    return () => window.removeEventListener("klusr:open-consent", reopen);
  }, []);

  function save(c: Consent) {
    try {
      localStorage.setItem(KEY, JSON.stringify(c));
    } catch {
      /* ignore */
    }
    applyConsent(c);
    setOpen(false);
    setShowPrefs(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-4">
      <div className="container-klusr">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-5 shadow-card-hover sm:p-6">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <Cookie className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-extrabold">Cookies op KLUSR</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                We gebruiken cookies om de webshop te laten werken, het gebruik te analyseren en
                (met jouw toestemming) relevante aanbiedingen te tonen. Kies hieronder. Meer info
                in ons <Link href="/cookiebeleid" className="font-medium text-primary hover:underline">cookiebeleid</Link>.
              </p>

              {showPrefs && (
                <div className="mt-4 space-y-2">
                  <PrefRow
                    title="Noodzakelijk"
                    desc="Nodig om de website en je bestelling te laten werken. Altijd aan."
                    checked
                    disabled
                  />
                  <PrefRow
                    title="Analytisch"
                    desc="Anoniem meten hoe de site gebruikt wordt, zodat we 'm kunnen verbeteren."
                    checked={analytics}
                    onChange={setAnalytics}
                  />
                  <PrefRow
                    title="Marketing"
                    desc="Relevante advertenties en het meten van campagnes (Google Ads)."
                    checked={marketing}
                    onChange={setMarketing}
                  />
                </div>
              )}

              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Button
                  onClick={() => save({ analytics: true, marketing: true, ts: Date.now() })}
                  className="sm:order-3 sm:flex-1"
                >
                  Alles accepteren
                </Button>
                {showPrefs ? (
                  <Button
                    variant="outline"
                    onClick={() => save({ analytics, marketing, ts: Date.now() })}
                    className="sm:order-2"
                  >
                    Mijn keuze bewaren
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setShowPrefs(true)}
                    className="sm:order-2"
                  >
                    Voorkeuren
                  </Button>
                )}
                <Button
                  variant="ghost"
                  onClick={() => save({ analytics: false, marketing: false, ts: Date.now() })}
                  className="sm:order-1"
                >
                  Alleen noodzakelijk
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PrefRow({
  title,
  desc,
  checked,
  disabled,
  onChange,
}: {
  title: string;
  desc: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <label
      className={cn(
        "flex items-start gap-3 rounded-lg border border-border p-3",
        disabled && "opacity-70",
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="mt-0.5 h-4 w-4 accent-primary"
      />
      <span className="min-w-0">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="block text-xs text-muted-foreground">{desc}</span>
      </span>
    </label>
  );
}
