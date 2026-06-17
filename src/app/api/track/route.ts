import { NextResponse } from "next/server";
import { logEvent, recordVisit } from "@/lib/store/analytics";

export const runtime = "nodejs";

// Client-events die we serverside vastleggen.
const ALLOWED = new Set([
  "search",
  "view",
  "color_selected",
  "pageview",
  "heartbeat",
  "view_item",
]);

// Eigen/interne IP's uitsluiten van de statistieken (INTERNAL_IPS="1.2.3.4, 5.6.7.8").
const INTERNAL_IPS = (process.env.INTERNAL_IPS || "")
  .split(/[\s,;]+/)
  .map((s) => s.trim())
  .filter(Boolean);

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip")?.trim() || "";
}

export async function POST(req: Request) {
  // Eigen verkeer niet meetellen.
  const ip = clientIp(req);
  if (ip && INTERNAL_IPS.includes(ip)) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const body = (await req.json().catch(() => ({}))) as {
    type?: string;
    query?: string;
    path?: string;
    visitorId?: string;
    productId?: string;
    title?: string;
  };
  const type = String(body.type || "");
  if (!ALLOWED.has(type)) return NextResponse.json({ ok: false }, { status: 400 });

  const visitorId = body.visitorId ? String(body.visitorId).slice(0, 64) : undefined;
  const path = body.path ? String(body.path).slice(0, 200) : undefined;

  if (type === "pageview" || type === "view") {
    await recordVisit({ visitorId, path, logType: "pageview" });
  } else if (type === "heartbeat") {
    await recordVisit({ visitorId, path, logType: null });
  } else if (type === "view_item") {
    await recordVisit({
      visitorId,
      path,
      productId: body.productId ? String(body.productId).slice(0, 64) : undefined,
      title: body.title ? String(body.title).slice(0, 160) : undefined,
      logType: "view_item",
    });
  } else {
    await logEvent(type, {
      query: body.query ? String(body.query).slice(0, 120) : undefined,
      path,
    });
  }

  return NextResponse.json({ ok: true });
}
