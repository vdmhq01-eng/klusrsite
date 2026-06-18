"use client";

import { SessionProvider } from "next-auth/react";
import { MembershipSync } from "@/components/cart/membership-sync";

/**
 * Client-side sessiecontext. Bewust zonder vooraf geladen sessie zodat
 * statische pagina's statisch blijven; de header haalt de inlogstatus
 * client-side op via /api/auth/session.
 *
 * `MembershipSync` hangt hierbinnen zodat de winkelwagen app-breed de
 * KLUSRPAS-status (ingelogd voordeel) uit de sessie afleidt.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <MembershipSync />
      {children}
    </SessionProvider>
  );
}
