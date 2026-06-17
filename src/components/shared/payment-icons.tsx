import { cn } from "@/lib/utils";

/**
 * Vertrouwens-iconen: betaalmethodes + verzendpartner, als nette inline-SVG
 * (geen externe requests, scherp op elk scherm). Bewust herkenbare, vereenvoudigde
 * merkmarkeringen in de juiste merkkleuren — puur als "wij accepteren dit"-indicatie.
 */

function Tile({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <span
      title={label}
      aria-label={label}
      className="inline-flex h-[30px] min-w-[46px] items-center justify-center rounded-[5px] border border-black/10 bg-white px-1.5 shadow-sm"
    >
      {children}
    </span>
  );
}

/* ----------------------------------------------------------- betaalmethodes */

function Ideal() {
  return (
    <svg viewBox="0 0 50 28" className="h-[18px] w-auto">
      <rect x="1" y="4" width="13" height="20" rx="3" fill="#cc0066" />
      <text x="7.5" y="19.5" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="14" fontWeight="900" fill="#fff">i</text>
      <text x="16" y="20" fontFamily="Arial,sans-serif" fontSize="14" fontWeight="800" letterSpacing="-0.5" fill="#0a0a0a">DEAL</text>
    </svg>
  );
}

function Bancontact() {
  return (
    <svg viewBox="0 0 44 24" className="h-[15px] w-auto">
      <path d="M7 6 H23 L18 18 H2 Z" fill="#005498" />
      <path d="M24 6 H40 L35 18 H19 Z" fill="#ffd800" />
    </svg>
  );
}

function Mastercard() {
  return (
    <svg viewBox="0 0 40 24" className="h-[17px] w-auto">
      <circle cx="16" cy="12" r="7.5" fill="#eb001b" />
      <circle cx="24" cy="12" r="7.5" fill="#f79e1b" />
      <path d="M20 6.2a7.5 7.5 0 0 0 0 11.6 7.5 7.5 0 0 0 0-11.6Z" fill="#ff5f00" />
    </svg>
  );
}

function Maestro() {
  return (
    <svg viewBox="0 0 40 24" className="h-[17px] w-auto">
      <circle cx="16" cy="12" r="7.5" fill="#0099df" />
      <circle cx="24" cy="12" r="7.5" fill="#ed0006" />
      <path d="M20 6.2a7.5 7.5 0 0 0 0 11.6 7.5 7.5 0 0 0 0-11.6Z" fill="#6c6bbd" />
    </svg>
  );
}

function Visa() {
  return (
    <svg viewBox="0 0 48 20" className="h-[14px] w-auto">
      <text x="24" y="16" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="16" fontStyle="italic" fontWeight="800" letterSpacing="0.5" fill="#1a1f71">VISA</text>
    </svg>
  );
}

function Paypal() {
  return (
    <svg viewBox="0 0 56 20" className="h-[14px] w-auto">
      <text x="28" y="16" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="15" fontStyle="italic" fontWeight="800">
        <tspan fill="#003087">Pay</tspan>
        <tspan fill="#009cde">Pal</tspan>
      </text>
    </svg>
  );
}

function Klarna() {
  return (
    <svg viewBox="0 0 56 28" className="h-[20px] w-auto">
      <rect width="56" height="28" rx="5" fill="#ffb3c7" />
      <text x="28" y="19" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="13" fontWeight="800" fill="#0b051d">Klarna</text>
    </svg>
  );
}

function ApplePay() {
  return (
    <svg viewBox="0 0 50 24" className="h-[16px] w-auto">
      <g transform="translate(3 2) scale(0.85)" fill="#000">
        <path d="M13.5 3.2c.66-.82 1.1-1.94.98-3.07-.95.04-2.1.64-2.78 1.45-.6.7-1.14 1.85-.99 2.93 1.06.08 2.13-.54 2.79-1.31Z" />
        <path d="M14.46 4.9c-1.54-.09-2.85.87-3.59.87-.74 0-1.87-.83-3.08-.81-1.58.02-3.05.92-3.86 2.34-1.65 2.86-.42 7.09 1.18 9.41.78 1.14 1.71 2.42 2.93 2.37 1.17-.05 1.62-.76 3.04-.76 1.42 0 1.82.76 3.06.74 1.27-.02 2.07-1.16 2.85-2.3.9-1.32 1.27-2.6 1.29-2.66-.03-.01-2.47-.95-2.49-3.76-.02-2.35 1.92-3.47 2.01-3.53-1.1-1.62-2.81-1.8-3.41-1.84Z" />
      </g>
      <text x="22" y="17" fontFamily="Arial,sans-serif" fontSize="14" fontWeight="600" fill="#000">Pay</text>
    </svg>
  );
}

function GooglePay() {
  return (
    <svg viewBox="0 0 54 24" className="h-[16px] w-auto">
      <g transform="translate(2 3)">
        <path fill="#4285f4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.62Z" />
        <path fill="#34a853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.34 0-4.33-1.58-5.04-3.71H.96v2.33A9 9 0 0 0 9 18Z" />
        <path fill="#fbbc05" d="M3.96 10.71a5.41 5.41 0 0 1 0-3.42V4.96H.96a9 9 0 0 0 0 8.08l3-2.33Z" />
        <path fill="#ea4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.96l3 2.33C4.67 5.16 6.66 3.58 9 3.58Z" />
      </g>
      <text x="22" y="16" fontFamily="Arial,sans-serif" fontSize="13" fontWeight="600" fill="#5f6368">Pay</text>
    </svg>
  );
}

const METHODS: { key: string; label: string; Mark: () => JSX.Element }[] = [
  { key: "ideal", label: "iDEAL", Mark: Ideal },
  { key: "mastercard", label: "Mastercard", Mark: Mastercard },
  { key: "visa", label: "Visa", Mark: Visa },
  { key: "maestro", label: "Maestro", Mark: Maestro },
  { key: "bancontact", label: "Bancontact", Mark: Bancontact },
  { key: "paypal", label: "PayPal", Mark: Paypal },
  { key: "klarna", label: "Klarna", Mark: Klarna },
  { key: "applepay", label: "Apple Pay", Mark: ApplePay },
  { key: "googlepay", label: "Google Pay", Mark: GooglePay },
];

export function PaymentIcons({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {METHODS.map(({ key, label, Mark }) => (
        <Tile key={key} label={label}>
          <Mark />
        </Tile>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------ verzendpartner */

/** PostNL-verzendbadge: oranje merkwoord op een witte tegel. */
export function PostNlBadge({ className }: { className?: string }) {
  return (
    <span
      title="PostNL"
      aria-label="Verzending met PostNL"
      className={cn(
        "inline-flex h-[30px] items-center justify-center rounded-[5px] border border-black/10 bg-white px-2.5 shadow-sm",
        className,
      )}
    >
      <svg viewBox="0 0 68 22" className="h-[16px] w-auto">
        <text
          x="0"
          y="17"
          fontFamily="Arial,Helvetica,sans-serif"
          fontSize="18"
          fontWeight="800"
          letterSpacing="-0.5"
          fill="#ff6900"
        >
          PostNL
        </text>
      </svg>
    </span>
  );
}
