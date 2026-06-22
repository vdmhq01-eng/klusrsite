"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Houdt de bedankpagina actueel zolang een betaling nog "open/pending" is. De
 * echte uitkomst landt via de Mollie-webhook (meestal binnen seconden), dus we
 * pollen de server-component met `router.refresh()` totdat de status verandert.
 *
 * - Het interval staat standaard op ~4s.
 * - Een harde stop (`maxAttempts`) voorkomt eindeloos pollen wanneer een
 *   betaling lang blijft hangen; daarna kan de klant handmatig verversen.
 * - De server-component bepaalt de status; zodra die niet meer pending is,
 *   wordt deze component simpelweg niet meer gerenderd en stopt het pollen.
 */
export function PaymentStatusPoller({
  intervalMs = 4000,
  maxAttempts = 30,
}: {
  intervalMs?: number;
  maxAttempts?: number;
}) {
  const router = useRouter();
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (attempts >= maxAttempts) return;
    const id = setTimeout(() => {
      setAttempts((n) => n + 1);
      router.refresh();
    }, intervalMs);
    return () => clearTimeout(id);
  }, [attempts, intervalMs, maxAttempts, router]);

  return null;
}
