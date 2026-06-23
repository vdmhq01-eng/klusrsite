import { NextResponse } from "next/server";
import { getAdminSession } from "@/auth";
import { getSafetyStock, setSafetyStock } from "@/lib/store/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Admin: lees/zet de veiligheidsvoorraad (drempel waaronder niet online verkocht wordt). */
export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ safetyStock: await getSafetyStock() });
}

export async function POST(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as { safetyStock?: unknown };
  const safetyStock = await setSafetyStock(Number(body.safetyStock));
  return NextResponse.json({ safetyStock });
}
