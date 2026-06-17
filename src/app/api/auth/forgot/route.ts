import { NextResponse } from "next/server";
import { getUser, createResetToken } from "@/lib/store/users";
import { sendPasswordReset } from "@/lib/email";

export const runtime = "nodejs";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.klus-r.nl").replace(/\/$/, "");
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Stuur een wachtwoord-herstellink. Alleen voor accounts mét wachtwoord. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { email?: string };
  const email = String(body.email ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "Vul een geldig e-mailadres in." }, { status: 400 });
  }

  // Alleen versturen wanneer er een account mét wachtwoord bestaat — magic-link-only
  // accounts hebben geen wachtwoord om te herstellen.
  const user = await getUser(email);
  if (user && user.passwordHash) {
    const token = await createResetToken(email);
    await sendPasswordReset({
      email,
      name: user.name,
      url: `${SITE_URL}/wachtwoord-herstellen?token=${token}`,
    });
  }

  // Altijd ok — geen account-enumeratie (we verklappen niet of het bestaat).
  return NextResponse.json({ ok: true });
}
