import { NextResponse } from "next/server";
import { getAdminSession } from "@/auth";
import { getRecentMovements } from "@/lib/store/stock-ledger";
import { isMollieTerminalConfigured } from "@/lib/payments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Admin: kassastatus — koppelingsconfig + recente voorraadmutaties (web + POS). */
export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const movements = await getRecentMovements(40);
  return NextResponse.json({
    movements,
    terminalConfigured: isMollieTerminalConfigured(),
    printAgentConfigured: Boolean((process.env.NEXT_PUBLIC_POS_PRINT_AGENT_URL || "").trim()),
  });
}
