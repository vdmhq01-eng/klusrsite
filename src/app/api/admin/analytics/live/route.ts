import { NextResponse } from "next/server";
import { getAdminSession } from "@/auth";
import { getHerkomstToday, getLiveSessions } from "@/lib/store/analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Admin: live-aantal + actieve sessies (huidige pagina, afreken-vlag, herkomst en
 * winkelmand) plus de herkomst-aggregatie van vandaag (bron → aantal bezoekers).
 */
export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const [sessions, herkomst] = await Promise.all([getLiveSessions(), getHerkomstToday()]);
  return NextResponse.json({ count: sessions.length, sessions, herkomst });
}
