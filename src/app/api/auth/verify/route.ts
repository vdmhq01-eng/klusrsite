import { NextResponse } from "next/server";
import { consumeAuthToken, setVerified } from "@/lib/store/users";

export const runtime = "nodejs";

/** Bevestig een e-mailadres via de token uit de verificatiemail. */
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token") ?? "";
  const email = token ? await consumeAuthToken(token) : null;
  if (email) await setVerified(email);
  return NextResponse.redirect(
    new URL(email ? "/inloggen?verify=ok" : "/inloggen?verify=invalid", req.url),
  );
}
