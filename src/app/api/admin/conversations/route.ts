import { NextResponse } from "next/server";
import { getAdminSession } from "@/auth";
import { listConversations, getConversation } from "@/lib/store/conversations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Admin: read-only inzage in de website-chatgesprekken ("de Klushulp").
 *   GET                → { conversations: [...] }  (recente index, nieuwste eerst)
 *   GET ?id=<cid>      → { conversation: {...} }    (één volledig gesprek)
 */
export async function GET(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const id = new URL(req.url).searchParams.get("id");
  if (id) {
    return NextResponse.json({ conversation: await getConversation(id) });
  }
  return NextResponse.json({ conversations: await listConversations() });
}
