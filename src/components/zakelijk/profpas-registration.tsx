"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePricingMode } from "@/lib/store/pricing-mode";

const FIELDS = [
  { name: "company", label: "Bedrijfsnaam", type: "text", required: true, autoComplete: "organization" },
  { name: "kvk", label: "KvK-nummer", type: "text", required: true },
  { name: "vat", label: "Btw-nummer", type: "text", required: false },
  { name: "name", label: "Contactpersoon", type: "text", required: true, autoComplete: "name" },
  { name: "email", label: "Zakelijk e-mailadres", type: "email", required: true, autoComplete: "email" },
  { name: "phone", label: "Telefoonnummer", type: "tel", required: false, autoComplete: "tel" },
] as const;

const inputClass =
  "w-full rounded-md border border-input bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

export function ProfpasRegistration() {
  const registerProfpas = usePricingMode((s) => s.registerProfpas);
  const registered = usePricingMode((s) => s.profpasRegistered);
  const [done, setDone] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Demo: er is nog geen echte zakelijke accountkoppeling. We activeren de
    // ProfPas-prijzen lokaal en bevestigen de aanvraag.
    registerProfpas();
    setDone(true);
  }

  if (done || registered) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-klusr-stock/10 text-klusr-stock">
          <Check className="h-6 w-6" strokeWidth={3} />
        </div>
        <h2 className="text-xl font-extrabold">Welkom bij de KLUSR ProfPas</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Je zakelijke prijzen staan nu aan: je ziet overal de <strong>ProfPas-prijs
          (10% korting) excl. btw</strong>. Schakelen kan altijd via{" "}
          <em>Particulier / Zakelijk</em> bovenaan de pagina.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/categorie/verf">Start met bestellen</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/kluspas">Over de KLUSRPAS</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-card p-6 shadow-card"
    >
      <h2 className="text-xl font-extrabold">Vraag je ProfPas aan</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Gratis en vrijblijvend. Na registratie reken je af tegen ProfPas-prijzen.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {FIELDS.map((f) => (
          <label key={f.name} className="flex flex-col gap-1 text-sm font-medium">
            <span>
              {f.label}
              {f.required && <span className="text-primary"> *</span>}
            </span>
            <input
              name={f.name}
              type={f.type}
              required={f.required}
              autoComplete={"autoComplete" in f ? f.autoComplete : undefined}
              className={inputClass}
            />
          </label>
        ))}
      </div>
      <Button type="submit" size="lg" className="mt-5 w-full sm:w-auto">
        ProfPas activeren
      </Button>
      <p className="mt-3 text-xs text-muted-foreground">
        Door te registreren ga je akkoord met de zakelijke voorwaarden. Prijzen worden
        zakelijk (excl. btw) getoond.
      </p>
    </form>
  );
}
