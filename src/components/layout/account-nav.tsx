"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { useSession } from "next-auth/react";

/** Header-actie die meebeweegt met de inlogstatus (Inloggen ↔ Account). */
export function AccountNav() {
  const { data: session } = useSession();
  const href = session ? "/account" : "/inloggen";
  const label = session?.user?.name?.split(" ")[0] ?? (session ? "Account" : "Inloggen");

  return (
    <Link
      href={href}
      className="hidden flex-col items-center justify-center gap-0.5 text-xs font-medium text-foreground transition-colors hover:text-primary md:flex"
    >
      <User className="h-5 w-5" />
      <span className="hidden lg:inline">{label}</span>
    </Link>
  );
}
