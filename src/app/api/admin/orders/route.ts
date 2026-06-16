import { NextResponse } from "next/server";
import { listOrders } from "@/lib/store/orders";
import { isPostNLConfigured } from "@/lib/postnl";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Admin: lijst van orders (in-memory + seeded) voor het orderoverzicht. */
export async function GET() {
  return NextResponse.json({
    orders: listOrders(),
    postnlConfigured: isPostNLConfigured(),
  });
}
