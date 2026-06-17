import { NextResponse } from "next/server";
import { getAdminSession } from "@/auth";
import { getLiveSessions } from "@/lib/store/analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Admin: live-aantal + actieve sessies (huidige pagina + afreken-vlag). */
export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const sessions = await getLiveSessions();
  return NextResponse.json({ count: sessions.length, sessions });
}
