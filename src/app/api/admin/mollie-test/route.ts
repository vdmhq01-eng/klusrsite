import { NextResponse } from "next/server";
import { checkMollie } from "@/lib/payments";

export const runtime = "nodejs";

/** Admin: controleer de Mollie-koppeling (sleutel + geactiveerde methoden). */
export async function POST() {
  return NextResponse.json(await checkMollie());
}
