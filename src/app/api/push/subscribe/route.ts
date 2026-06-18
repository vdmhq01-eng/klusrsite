import { NextResponse } from "next/server";
import { getAdminSession } from "@/auth";
import { addSubscription, type StoredSubscription } from "@/lib/push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Bewaar het push-abonnement van een beheerder (admin-only). De body is het
 * `PushSubscription`-object uit de browser (met `endpoint` + `keys`).
 */
export async function POST(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let sub: StoredSubscription | null = null;
  try {
    sub = (await req.json()) as StoredSubscription;
  } catch {
    return NextResponse.json({ error: "ongeldige body" }, { status: 400 });
  }

  if (!sub || typeof sub.endpoint !== "string" || !sub.endpoint) {
    return NextResponse.json({ error: "geen geldig abonnement" }, { status: 400 });
  }

  await addSubscription(sub);
  return NextResponse.json({ ok: true });
}
