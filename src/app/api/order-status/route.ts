import { NextResponse } from "next/server";
import { getOrderByReference } from "@/lib/store/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Bestelstatus opzoeken (server-side). Vereist bestelnummer + het e-mailadres
 * waarmee besteld is — zo kan alleen de klant z'n eigen order inzien.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const ref = url.searchParams.get("ref")?.trim();
  const email = url.searchParams.get("email")?.trim().toLowerCase();

  if (!ref || !email) {
    return NextResponse.json({ found: false, error: "missing" }, { status: 400 });
  }

  const order = await getOrderByReference(ref);
  if (!order || order.customer.email.toLowerCase() !== email) {
    // Bewust dezelfde generieke uitkomst voor "niet gevonden" en "e-mail klopt niet".
    return NextResponse.json({ found: false });
  }

  return NextResponse.json({ found: true, order });
}
