"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useCart } from "@/lib/store/cart";

/**
 * Houdt de winkelwagen-status (`kluspasActive`) gelijk aan de login. De KLUSRPAS-
 * prijs is een ingelogd voordeel: elke geregistreerde gebruiker heeft de gratis
 * KLUSRPAS, dus zodra er een sessie is rekent de winkelwagen met de pasprijs;
 * uitgelogd valt alles terug op de normale prijs.
 *
 * Bewust een los, onzichtbaar component dat náást de SessionProvider hangt zodat
 * de cart app-breed de inlogstatus volgt zonder dat individuele pagina's er iets
 * voor hoeven te doen. `kluspasActive` wordt niet gepersisteerd (zie cart.ts),
 * dus deze sync is de enige bron van waarheid na het laden.
 */
export function MembershipSync() {
  const { data: session } = useSession();
  useEffect(() => {
    useCart.getState().setMembership(Boolean(session));
  }, [session]);
  return null;
}
