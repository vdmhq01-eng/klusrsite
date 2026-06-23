import { NextResponse } from "next/server";
import { listOrders, claimReviewRequest, releaseReviewRequest } from "@/lib/store/orders";
import { sendReviewRequest } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CRON_SECRET = process.env.CRON_SECRET;
const MIN_AGE_MS = 3 * 24 * 60 * 60 * 1000; // pas 3 dagen NA verzending vragen
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // geen oude backlog meer aanschrijven
const MAX_PER_RUN = 50; // veiligheidslimiet per run (voorkomt timeouts)

/**
 * Stuurt ~3 dagen na verzending een reviewverzoek naar de klant. Bedoeld als
 * Vercel Cron-route (zie vercel.json) — dagelijks. Eén verzoek per order: de
 * claim (`reviewRequestedAt`) voorkomt dubbele mails, ook over serverless-
 * instances heen. Testorders en orders zonder verzendlabel slaan we over.
 */
export async function GET(req: Request) {
  // Net als de andere cron-routes: met CRON_SECRET vereisen we de Bearer-header
  // die Vercel Cron meestuurt. Zonder secret staat de route open.
  if (CRON_SECRET) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const now = Date.now();
  const orders = await listOrders();
  let sent = 0;
  let eligible = 0;

  for (const o of orders) {
    if (o.isTest || o.reviewRequestedAt || !o.customer.email) continue;
    // "Verzonden" = er is een PostNL-label aangemaakt. Pas 3 dagen later vragen.
    const shippedAt = o.shipment?.labelCreatedAt;
    if (!shippedAt) continue;
    const age = now - new Date(shippedAt).getTime();
    if (age < MIN_AGE_MS || age > MAX_AGE_MS) continue;
    eligible++;
    if (sent >= MAX_PER_RUN) break;

    // Claim eerst (idempotent), dan pas mailen. Bij een echte verzendfout geven
    // we de claim vrij zodat een volgende run het opnieuw probeert.
    if (!(await claimReviewRequest(o.id))) continue;
    const res = await sendReviewRequest(o);
    if (res.ok || res.demo) sent++;
    else await releaseReviewRequest(o.id);
  }

  return NextResponse.json({ ok: true, eligible, sent });
}
