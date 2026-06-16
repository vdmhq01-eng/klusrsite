import { NextResponse } from "next/server";
import { createUser, createVerifyToken } from "@/lib/store/users";
import { sendVerificationEmail, isEmailConfigured } from "@/lib/email";

export const runtime = "nodejs";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.klus-r.nl").replace(/\/$/, "");
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Registreer een nieuw account en stuur een e-mailbevestiging. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
    name?: string;
  };
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const name = String(body.name ?? "").trim();

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "Vul een geldig e-mailadres in." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json(
      { ok: false, error: "Kies een wachtwoord van minimaal 8 tekens." },
      { status: 400 },
    );
  }

  // Zonder Resend kunnen we niet verifiëren → account meteen actief (demo/test).
  // Met Resend geconfigureerd vereisen we e-mailbevestiging.
  const autoVerify = !isEmailConfigured();
  const res = await createUser({ email, name, password, verified: autoVerify });
  if (!res.ok) {
    return NextResponse.json(
      { ok: false, error: "Er bestaat al een account met dit e-mailadres." },
      { status: 409 },
    );
  }

  if (!autoVerify) {
    const token = await createVerifyToken(email);
    await sendVerificationEmail({
      email,
      name: res.user?.name,
      url: `${SITE_URL}/api/auth/verify?token=${token}`,
    });
  }

  return NextResponse.json({ ok: true, verified: autoVerify });
}
