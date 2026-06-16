import { NextResponse } from "next/server";
import { logEvent } from "@/lib/store/analytics";

export const runtime = "nodejs";

// Client-events die we serverside vastleggen (zoeken, paginaweergave, kleurkeuze).
const ALLOWED = new Set(["search", "view", "color_selected"]);

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    type?: string;
    query?: string;
    path?: string;
  };
  const type = String(body.type || "");
  if (!ALLOWED.has(type)) return NextResponse.json({ ok: false }, { status: 400 });
  await logEvent(type, {
    query: body.query ? String(body.query).slice(0, 120) : undefined,
    path: body.path ? String(body.path).slice(0, 200) : undefined,
  });
  return NextResponse.json({ ok: true });
}
