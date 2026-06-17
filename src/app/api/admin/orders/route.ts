import { NextResponse } from "next/server";
import { getAdminSession } from "@/auth";
import { listOrders } from "@/lib/store/orders";
import { isPostNLConfigured } from "@/lib/postnl";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Admin: lijst van orders (in-memory + seeded) voor het orderoverzicht. */
export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  // Testbestellingen (demo-seed / Mollie test-mode) tellen niet mee in het overzicht.
  const orders = (await listOrders()).filter((o) => !o.isTest);
  return NextResponse.json({
    orders,
    postnlConfigured: isPostNLConfigured(),
  });
}
