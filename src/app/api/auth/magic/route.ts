import { NextResponse } from "next/server";
import { getUser, createUser, createMagicToken } from "@/lib/store/users";
import { sendMagicLink } from "@/lib/email";

export const runtime = "nodejs";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.klus-r.nl").replace(/\/$/, "");
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Stuur een magic-link inlogmail. Maakt zo nodig een passwordless account aan. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { email?: string; name?: string };
  const email = String(body.email ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "Vul een geldig e-mailadres in." }, { status: 400 });
  }

  let user = await getUser(email);
  if (!user) {
    const r = await createUser({ email, name: String(body.name ?? ""), verified: false });
    user = r.user ?? null;
  }

  const token = await createMagicToken(email);
  await sendMagicLink({
    email,
    name: user?.name,
    url: `${SITE_URL}/inloggen/magic?token=${token}`,
  });

  // Altijd ok — geen account-enumeratie (we verklappen niet of het bestaat).
  return NextResponse.json({ ok: true });
}
