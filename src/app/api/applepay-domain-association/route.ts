import { NextResponse } from "next/server";

export const runtime = "nodejs";
// Cache een dag: het bestand verandert vrijwel nooit.
export const revalidate = 86400;

const MOLLIE_ASSOC_URL =
  "https://www.mollie.com/.well-known/apple-developer-merchantid-domain-association";

/**
 * Apple Pay-domeinvalidatie.
 *
 * Apple (via Mollie) eist dat dit bestand publiek bereikbaar is op
 * https://<domein>/.well-known/apple-developer-merchantid-domain-association.
 * Het is hetzelfde bestand voor álle Mollie Apple Pay-merchants, dus we proxyen
 * het rechtstreeks van Mollie en cachen het een dag. De rewrite in
 * next.config.mjs koppelt het verplichte .well-known-pad aan deze route.
 *
 * Zo hoeven we het bestand niet handmatig te downloaden/committen en blijft het
 * altijd actueel.
 */
export async function GET() {
  try {
    const res = await fetch(MOLLIE_ASSOC_URL, { next: { revalidate: 86400 } });
    if (!res.ok) {
      return new NextResponse("Apple Pay domain association tijdelijk niet beschikbaar", {
        status: 502,
      });
    }
    const body = await res.text();
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return new NextResponse("Apple Pay domain association tijdelijk niet beschikbaar", {
      status: 502,
    });
  }
}
