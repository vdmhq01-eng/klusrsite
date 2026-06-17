"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    Mollie?: (profileId: string, opts: { locale?: string; testmode?: boolean }) => any;
  }
}

export interface MollieCardHandle {
  /** Maak een card-token aan; geeft null terug bij een fout (UI toont de fout). */
  createToken: () => Promise<string | null>;
}

/**
 * Mollie Components — ingebedde creditcard-velden (geen Mollie-pagina).
 * Laadt mollie.js, mount de vier kaartvelden en levert via de ref een
 * createToken()-methode. Faalt het laden, dan blijft `createToken` null geven en
 * valt de checkout terug op de normale (hosted) creditcard-betaling.
 */
export const MollieCard = forwardRef<MollieCardHandle, { profileId: string; testmode: boolean }>(
  function MollieCard({ profileId, testmode }, ref) {
    const mollieRef = useRef<any>(null);
    const [ready, setReady] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      let cancelled = false;

      function init() {
        if (cancelled || mollieRef.current || !window.Mollie) return;
        try {
          const mollie = window.Mollie(profileId, { locale: "nl_NL", testmode });
          mollieRef.current = mollie;
          mollie.createComponent("cardHolder").mount("#mollie-card-holder");
          mollie.createComponent("cardNumber").mount("#mollie-card-number");
          mollie.createComponent("expiryDate").mount("#mollie-expiry-date");
          mollie.createComponent("verificationCode").mount("#mollie-verification-code");
          setReady(true);
        } catch {
          setError("De kaartvelden konden niet laden. Probeer een andere betaalmethode.");
        }
      }

      if (window.Mollie) {
        init();
      } else {
        let script = document.getElementById("mollie-js") as HTMLScriptElement | null;
        if (!script) {
          script = document.createElement("script");
          script.id = "mollie-js";
          script.src = "https://js.mollie.com/v1/mollie.js";
          script.async = true;
          document.body.appendChild(script);
        }
        script.addEventListener("load", init);
        script.addEventListener("error", () =>
          setError("Mollie kon niet laden. Probeer een andere betaalmethode."),
        );
      }

      return () => {
        cancelled = true;
      };
    }, [profileId, testmode]);

    useImperativeHandle(
      ref,
      () => ({
        async createToken() {
          if (!mollieRef.current) return null;
          try {
            const { token, error: tokenError } = await mollieRef.current.createToken();
            if (tokenError) {
              setError(tokenError.message || "Controleer je kaartgegevens.");
              return null;
            }
            setError(null);
            return token ?? null;
          } catch {
            setError("Er ging iets mis met de kaartgegevens.");
            return null;
          }
        },
      }),
      [],
    );

    return (
      <div className="space-y-3">
        <Field label="Naam op kaart" id="mollie-card-holder" />
        <Field label="Kaartnummer" id="mollie-card-number" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Vervaldatum" id="mollie-expiry-date" />
          <Field label="CVC" id="mollie-verification-code" />
        </div>
        {!ready && !error && (
          <p className="text-xs text-muted-foreground">Kaartvelden laden…</p>
        )}
        {error && <p className="text-xs font-medium text-destructive">{error}</p>}
      </div>
    );
  },
);

function Field({ label, id }: { label: string; id: string }) {
  return (
    <div className="space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      <div id={id} className="min-h-[42px] rounded-md border border-input bg-card px-3 py-2.5" />
    </div>
  );
}
