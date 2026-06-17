import type { Metadata } from "next";
import { listOrders } from "@/lib/store/orders";
import { getProductById } from "@/lib/data/products";
import { categories } from "@/lib/data/categories";
import { flagshipStore } from "@/lib/data/stores";
import { InvoicePrintButton } from "@/components/checkout/invoice-print-button";

export const metadata: Metadata = {
  title: "Looplijst | KLUSR",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const CAT_TITLE: Record<string, string> = Object.fromEntries(
  categories.map((c) => [c.slug, c.title]),
);

interface Line {
  key: string;
  brand: string;
  title: string;
  variant: string;
  color?: string;
  sku: string;
  category: string;
  qty: number;
  refs: { ref: string; qty: number }[];
}

export default async function LooplijstPage() {
  const orders = (await listOrders()).filter(
    (o) =>
      (o.paymentStatus === "paid" || o.paymentStatus === "authorized") && !o.shipment,
  );

  // Items over alle openstaande orders samenvoegen.
  const map = new Map<string, Line>();
  for (const o of orders) {
    for (const it of o.items) {
      const category = getProductById(it.productId)?.category ?? "overig";
      const key = `${it.productId}__${it.variantLabel}__${it.selectedColor?.code ?? ""}`;
      const existing = map.get(key);
      if (existing) {
        existing.qty += it.quantity;
        existing.refs.push({ ref: o.reference, qty: it.quantity });
      } else {
        map.set(key, {
          key,
          brand: it.brand,
          title: it.title,
          variant: it.variantLabel && it.variantLabel !== "Standaard" ? it.variantLabel : "",
          color: it.selectedColor ? `${it.selectedColor.name}${it.selectedColor.code ? ` (${it.selectedColor.code})` : ""}` : undefined,
          sku: String(it.productId).replace(/^tilroy-/, ""),
          category,
          qty: it.quantity,
          refs: [{ ref: o.reference, qty: it.quantity }],
        });
      }
    }
  }

  const lines = [...map.values()];
  // Groeperen op categorie en sorteren op merk + titel (handige looproute).
  const groups = new Map<string, Line[]>();
  for (const l of lines) {
    const arr = groups.get(l.category) ?? [];
    arr.push(l);
    groups.set(l.category, arr);
  }
  const groupList = [...groups.entries()]
    .map(([cat, arr]) => ({
      cat,
      title: CAT_TITLE[cat] ?? "Overig",
      lines: arr.sort((a, b) => `${a.brand} ${a.title}`.localeCompare(`${b.brand} ${b.title}`)),
    }))
    .sort((a, b) => a.title.localeCompare(b.title));

  const totalUnits = lines.reduce((s, l) => s + l.qty, 0);
  const date = new Date().toLocaleString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 print:px-0 print:py-0">
      <style>{`@media print { @page { margin: 14mm; } body { background:#fff; } header, footer, nav { display:none !important; } }`}</style>

      <div className="mb-6 flex items-center justify-between print:hidden">
        <h1 className="text-xl font-black">Looplijst</h1>
        <InvoicePrintButton />
      </div>

      <div className="rounded-2xl border border-border bg-white p-8 text-sm text-black shadow-card print:border-0 print:p-0 print:shadow-none">
        {/* Kop */}
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-2xl font-black tracking-tight">
              KLUS<span className="rounded bg-primary px-1.5 text-white">R</span>
            </p>
            <p className="mt-2 text-xs text-neutral-600">
              {flagshipStore.address}, {flagshipStore.postalCode} {flagshipStore.city}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-black uppercase tracking-wide">Looplijst</p>
            <p className="mt-2 text-xs text-neutral-600">
              {date}
              <br />
              <span className="font-semibold text-black">{orders.length}</span> order(s) ·{" "}
              <span className="font-semibold text-black">{lines.length}</span> regels ·{" "}
              <span className="font-semibold text-black">{totalUnits}</span> stuks
            </p>
          </div>
        </div>

        {lines.length === 0 ? (
          <p className="mt-10 text-center text-neutral-500">
            Geen openstaande orders om te picken.
          </p>
        ) : (
          <div className="mt-8 space-y-7">
            {groupList.map((g) => (
              <div key={g.cat}>
                <h2 className="mb-2 border-b-2 border-neutral-200 pb-1 text-sm font-black uppercase tracking-wide">
                  {g.title}
                </h2>
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="text-[11px] uppercase tracking-wide text-neutral-500">
                      <th className="w-8 py-1.5 text-center">✓</th>
                      <th className="py-1.5">Artikel</th>
                      <th className="py-1.5 text-right">SKU</th>
                      <th className="w-16 py-1.5 text-center">Aantal</th>
                      <th className="py-1.5">Voor order(s)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.lines.map((l) => (
                      <tr key={l.key} className="border-b border-neutral-100 align-top">
                        <td className="py-2 text-center">
                          <span className="inline-block h-4 w-4 rounded-sm border border-neutral-400" />
                        </td>
                        <td className="py-2">
                          <span className="text-[11px] font-bold uppercase text-neutral-500">{l.brand}</span>
                          <br />
                          <span className="font-semibold">{l.title}</span>
                          {l.variant ? ` · ${l.variant}` : ""}
                          {l.color ? <span className="text-neutral-600"> · kleur {l.color}</span> : null}
                        </td>
                        <td className="py-2 text-right text-xs text-neutral-500">{l.sku}</td>
                        <td className="py-2 text-center text-base font-black">{l.qty}</td>
                        <td className="py-2 text-xs text-neutral-600">
                          {l.refs.map((r) => `${r.ref}${r.qty > 1 ? ` ×${r.qty}` : ""}`).join(", ")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}

        <p className="mt-8 text-[11px] text-neutral-400">
          Looplijst gegenereerd op {date} · KLUSR B.V. — pik alle artikelen en vink af; maak
          daarna per order de pakbon en het verzendlabel aan.
        </p>
      </div>
    </div>
  );
}
