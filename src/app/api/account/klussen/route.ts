import { NextResponse } from "next/server";
import { getSession } from "@/auth";
import { listKlussenByEmail } from "@/lib/store/klus";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * De kluspakketten ("Mijn klussen") van de ingelogde klant — op het e-mailadres
 * van de sessie, nieuwste eerst. 401 als er niemand is ingelogd.
 */
export async function GET() {
  const session = await getSession();
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const klussen = await listKlussenByEmail(email);
  return NextResponse.json({ klussen });
}
