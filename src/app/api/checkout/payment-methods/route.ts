import { NextResponse } from "next/server";
import { listPaymentMethods } from "@/lib/payments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Geef de geactiveerde betaalmethoden terug (met officiële logo's en, voor
 * iDEAL, de banklijst). Optioneel ?amount=12.34 om op bedrag te filteren.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const amountParam = url.searchParams.get("amount");
  const amount = amountParam ? Number(amountParam) : undefined;
  const country = url.searchParams.get("country") || undefined;
  const result = await listPaymentMethods(
    Number.isFinite(amount) ? amount : undefined,
    country,
  );
  return NextResponse.json(result);
}
