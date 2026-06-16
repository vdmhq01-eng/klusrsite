"use client";

import { SessionProvider } from "next-auth/react";

/**
 * Client-side sessiecontext. Bewust zonder vooraf geladen sessie zodat
 * statische pagina's statisch blijven; de header haalt de inlogstatus
 * client-side op via /api/auth/session.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
