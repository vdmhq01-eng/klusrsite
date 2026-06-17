import { NextResponse } from "next/server";
import { consumeAuthToken, setPassword } from "@/lib/store/users";

export const runtime = "nodejs";

/** Wissel een herstel-token in en stel het nieuwe wachtwoord in. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { token?: string; password?: string };
  const token = String(body.token ?? "");
  const password = body.password;

  if (typeof password !== "string" || password.length < 8) {
    return NextResponse.json(
      { ok: false, error: "Wachtwoord moet minstens 8 tekens zijn." },
      { status: 400 },
    );
  }

  const email = await consumeAuthToken(token);
  if (!email) {
    return NextResponse.json(
      { ok: false, error: "De herstellink is verlopen of ongeldig. Vraag een nieuwe aan." },
      { status: 400 },
    );
  }

  const ok = await setPassword(email, password);
  if (!ok) {
    return NextResponse.json(
      { ok: false, error: "De herstellink is verlopen of ongeldig. Vraag een nieuwe aan." },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true });
}
