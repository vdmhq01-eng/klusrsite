import { NextResponse } from "next/server";
import { getAdminSession } from "@/auth";
import { addExcludedIp, listExcludedIps, removeExcludedIp } from "@/lib/store/analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Eigen IP van de verzoeker, zodat de owner zichzelf met één klik kan toevoegen. */
function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip")?.trim() || "";
}

// Eenvoudige, soepele validatie van een IPv4- of IPv6-adres.
const IPV4 = /^(\d{1,3})(\.\d{1,3}){3}$/;
const IPV6 = /^[0-9a-fA-F:]+$/; // bevat ':' (hex-groepen), inclusief afgekorte vormen
function isPlausibleIp(value: string): boolean {
  if (IPV4.test(value)) {
    return value.split(".").every((part) => Number(part) <= 255);
  }
  return value.includes(":") && IPV6.test(value);
}

/** Admin: huidige IP-uitsluitlijst (env = read-only, custom = beheerbaar in KV). */
export async function GET(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { env, custom } = await listExcludedIps();
  return NextResponse.json({ env, custom, currentIp: clientIp(req) });
}

/** Admin: voeg een IP toe aan de uitsluitlijst. */
export async function POST(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as { ip?: unknown };
  const ip = typeof body.ip === "string" ? body.ip.trim() : "";
  if (!ip || !isPlausibleIp(ip)) {
    return NextResponse.json({ error: "Ongeldig IP-adres." }, { status: 400 });
  }
  await addExcludedIp(ip);
  const { env, custom } = await listExcludedIps();
  return NextResponse.json({ env, custom, currentIp: clientIp(req) });
}

/** Admin: verwijder een IP uit de uitsluitlijst. */
export async function DELETE(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as { ip?: unknown };
  const ip = typeof body.ip === "string" ? body.ip.trim() : "";
  if (!ip) {
    return NextResponse.json({ error: "Ongeldig IP-adres." }, { status: 400 });
  }
  await removeExcludedIp(ip);
  const { env, custom } = await listExcludedIps();
  return NextResponse.json({ env, custom, currentIp: clientIp(req) });
}
