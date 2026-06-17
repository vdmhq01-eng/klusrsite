import { NextResponse } from "next/server";
import { getAdminSession } from "@/auth";
import { checkMollie } from "@/lib/payments";

export const runtime = "nodejs";

/** Admin: controleer de Mollie-koppeling (sleutel + geactiveerde methoden). */
export async function POST() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await checkMollie());
}
