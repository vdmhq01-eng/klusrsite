import { NextResponse } from "next/server";
import { getPublicKey } from "@/lib/push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Geef de publieke VAPID-sleutel terug zodat de browser zich kan abonneren. De
 * publieke sleutel is veilig om openbaar te maken. Een lege string betekent dat
 * push (nog) niet is geconfigureerd op de server.
 */
export async function GET() {
  return NextResponse.json({ key: getPublicKey() });
}
