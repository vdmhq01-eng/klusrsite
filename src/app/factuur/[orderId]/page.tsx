import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOrder } from "@/lib/store/orders";
import { flagshipStore } from "@/lib/data/stores";
import { formatPrice } from "@/lib/utils";
import { InvoicePrintButton } from "@/components/checkout/invoice-print-button";

export const metadata: Metadata = {
  title: "Factuur | KLUSR",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const KLUSR = {
  name: "KLUSR B.V.",
  address: flagshipStore.address,
  postalCode: flagshipStore.postalCode,
  city: flagshipStore.city,
  kvk: process.env.KLUSR_KVK || "—",
  vat: process.env.KLUSR_VAT || "—",
  iban: process.env.KLUSR_IBAN || "—",
  email: process.env.EMAIL_REPLY_TO || "klantenservice@klus-r.nl",
};

const r2 = (n: number) => Math.round(n * 100) / 100;

export default async function InvoicePage({ params }: { params: { orderId: string } }) {
  const order = await getOrder(params.orderId);
  if (!order) notFound();

  const c = order.customer;
  const totalEx = r2(order.total / 1.21);
  const vat = r2(order.total - totalEx);
  const date = new Date(order.createdAt).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 print:px-0 print:py-0">
      <style>{`@media print { @page { margin: 16mm; } body { background:#fff; } header, footer, nav { display:none !important; } }`}</style>

      <div className="mb-6 flex items-center justify-between print:hidden">
        <h1 className="text-xl font-black">Factuur {order.reference}</h1>
        <InvoicePrintButton />
      </div>

      <div className="rounded-2xl border border-border bg-white p-8 text-sm text-black shadow-card print:border-0 print:shadow-none">
        {/* Kop */}
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-2xl font-black tracking-tight">
              KLUS<span className="rounded bg-primary px-1.5 text-white">R</span>
            </p>
            <p className="mt-3 text-xs leading-relaxed text-neutral-600">
              {KLUSR.name}
              <br />
              {KLUSR.address}
              <br />
              {KLUSR.postalCode} {KLUSR.city}
              <br />
              KVK {KLUSR.kvk} · BTW {KLUSR.vat}
              <br />
              {KLUSR.email}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-black uppercase tracking-wide">Factuur</p>
            <p className="mt-2 text-xs text-neutral-600">
              Factuurnr.: <span className="font-semibold text-black">{order.reference}</span>
              <br />
              Datum: <span className="font-semibold text-black">{date}</span>
              <br />
              Status:{" "}
              <span className="font-semibold text-black">
                {order.paymentStatus === "paid" || order.paymentStatus === "delivered"
                  ? "Betaald"
                  : "Open"}
              </span>
            </p>
          </div>
        </div>

        {/* Klant */}
        <div className="mt-8 rounded-lg bg-neutral-50 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-500">Factuuradres</p>
          <p className="mt-1 leading-relaxed">
            {(c.billing?.company || c.company) && (
              <span className="font-semibold">
                {c.billing?.company || c.company}
                <br />
              </span>
            )}
            {c.firstName} {c.lastName}
            <br />
            {c.billing?.street || c.street}
            <br />
            {c.billing?.postalCode || c.postalCode} {c.billing?.city || c.city}
            {c.cocNumber && <><br />KVK {c.cocNumber}</>}
            {c.vatNumber && <><br />BTW {c.vatNumber}</>}
          </p>
        </div>

        {/* Regels */}
        <table className="mt-6 w-full border-collapse text-left">
          <thead>
            <tr className="border-b-2 border-neutral-200 text-[11px] uppercase tracking-wide text-neutral-500">
              <th className="py-2">Omschrijving</th>
              <th className="py-2 text-center">Aantal</th>
              <th className="py-2 text-right">Stukprijs</th>
              <th className="py-2 text-right">Totaal</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((it) => {
              const unit = it.kluspasPrice > 0 ? it.kluspasPrice : it.price;
              return (
                <tr key={it.key} className="border-b border-neutral-100">
                  <td className="py-2">
                    {it.title}
                    {it.variantLabel && it.variantLabel !== "Standaard" ? ` · ${it.variantLabel}` : ""}
                    {it.selectedColor ? ` · ${it.selectedColor.name}` : ""}
                  </td>
                  <td className="py-2 text-center">{it.quantity}</td>
                  <td className="py-2 text-right">{formatPrice(unit)}</td>
                  <td className="py-2 text-right">{formatPrice(r2(unit * it.quantity))}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Totalen */}
        <div className="mt-4 flex justify-end">
          <div className="w-full max-w-xs space-y-1.5 text-sm">
            <Row label="Subtotaal" value={formatPrice(order.subtotal)} />
            {order.kluspasSavings > 0 && (
              <Row label="KLUSRPAS-voordeel" value={`-${formatPrice(order.kluspasSavings)}`} />
            )}
            <Row label="Verzendkosten" value={order.shipping === 0 ? "Gratis" : formatPrice(order.shipping)} />
            <div className="my-1 border-t border-neutral-200" />
            <Row label="Bedrag excl. btw" value={formatPrice(totalEx)} />
            <Row label="Btw 21%" value={formatPrice(vat)} />
            <div className="flex justify-between border-t-2 border-neutral-300 pt-2 text-base font-black">
              <span>Totaal</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-[11px] text-neutral-400">
          {KLUSR.name} · IBAN {KLUSR.iban} · Bedankt voor je bestelling bij KLUSR.
        </p>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-neutral-700">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
