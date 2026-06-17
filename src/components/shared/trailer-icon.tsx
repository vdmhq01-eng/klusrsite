import type { SVGProps } from "react";

/**
 * Aanhangwagen-icoon (open laadbak + dissel + wielen) in lucide-stijl, zodat
 * het naadloos naast de andere KLUSR-iconen past. Gebruikt voor de winkelwagen
 * — een knipoog naar het klus-/bouwmarktkarakter van de shop.
 */
export function TrailerIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* laadbak */}
      <path d="M3 9h15v5H3z" />
      {/* dissel / trekstang */}
      <path d="M3 13 1 14" />
      {/* wielen */}
      <circle cx="8" cy="17" r="2" />
      <circle cx="15" cy="17" r="2" />
      {/* as tussen de wielen */}
      <path d="M10 17h3" />
    </svg>
  );
}
