import { NextResponse } from "next/server";
import { getAdminSession } from "@/auth";
import { removeSubscription } from "@/lib/push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Verwijder een push-abonnement (admin-only). Body: `{ endpoint }` óf het hele
 * abonnementsobject met een `endpoint`.
 */
export async function POST(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let endpoint = "";
  try {
    const body = (await req.json()) as { endpoint?: unknown };
    if (typeof body?.endpoint === "string") endpoint = body.endpoint;
  } catch {
    /* lege/ongeldige body → niets te doen */
  }

  if (!endpoint) {
    return NextResponse.json({ error: "geen endpoint" }, { status: 400 });
  }

  await removeSubscription(endpoint);
  return NextResponse.json({ ok: true });
}
