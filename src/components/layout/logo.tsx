import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * KLUSR wordmark. The "R" sits in a red rounded tile, echoing the brand mark
 * in the supplied visuals.
 */
export function Logo({
  className,
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label="KLUSR home"
      className={cn("inline-flex items-center", className)}
    >
      <span className="text-2xl font-black tracking-tight text-klusr-black">
        KLUS
      </span>
      <span className="ml-0.5 grid h-7 w-7 place-items-center rounded-md bg-primary text-2xl font-black leading-none text-white">
        R
      </span>
    </Link>
  );
}
