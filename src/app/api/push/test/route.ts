import { NextResponse } from "next/server";
import { getAdminSession } from "@/auth";
import { isPushEnabled, sendPushToAdmins } from "@/lib/push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stuur een testmelding naar alle geabonneerde beheerders (admin-only), zodat de
 * owner kan controleren of meldingen aankomen.
 */
export async function POST() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!isPushEnabled()) {
    return NextResponse.json({ ok: false, reason: "push-uitgeschakeld" });
  }

  await sendPushToAdmins({
    title: "KLUSR testmelding",
    body: "Meldingen werken 🎉",
    url: "/admin",
  });

  return NextResponse.json({ ok: true });
}
