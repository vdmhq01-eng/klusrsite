import { cn } from "@/lib/utils";

/**
 * Vertrouwens-iconen: betaalmethodes (echte, officiële logo's) + verzendpartner.
 *
 * De betaallogo's zijn de officiële merk-SVG's uit /public/payment
 * (Shopify `activemerchant/payment_icons`, MIT-licentie — zie
 * public/payment/LICENSE.txt). Merken zijn eigendom van hun eigenaren en worden
 * hier uitsluitend getoond als "wij accepteren dit"-indicatie. Elke badge staat
 * op een witte tegel zodat ook de zwarte Apple Pay-badge leesbaar is op de
 * donkere footer.
 */

const METHODS: { id: string; label: string }[] = [
  { id: "ideal", label: "iDEAL" },
  { id: "mastercard", label: "Mastercard" },
  { id: "visa", label: "Visa" },
  { id: "maestro", label: "Maestro" },
  { id: "bancontact", label: "Bancontact" },
  { id: "paypal", label: "PayPal" },
  { id: "klarna", label: "Klarna" },
  { id: "applepay", label: "Apple Pay" },
  { id: "googlepay", label: "Google Pay" },
];

export function PaymentIcons({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {METHODS.map((m) => (
        <span
          key={m.id}
          title={m.label}
          className="inline-flex h-[30px] min-w-[44px] items-center justify-center rounded-[5px] border border-black/10 bg-white px-1.5 shadow-sm"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/payment/${m.id}.svg`}
            alt={m.label}
            width={38}
            height={24}
            loading="lazy"
            className="h-[18px] w-auto"
          />
        </span>
      ))}
    </div>
  );
}

/** PostNL-verzendbadge: het officiële PostNL-logo op een witte tegel. */
export function PostNlBadge({ className }: { className?: string }) {
  return (
    <span
      title="PostNL"
      aria-label="Verzending met PostNL"
      className={cn(
        "inline-flex h-[30px] items-center justify-center rounded-[5px] border border-black/10 bg-white px-2 shadow-sm",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/postnl-logo.png"
        alt="PostNL"
        width={24}
        height={24}
        loading="lazy"
        className="h-[24px] w-auto"
      />
    </span>
  );
}
