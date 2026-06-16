import { NextResponse } from "next/server";
import { subscribe } from "@/lib/mailchimp";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const { email, firstName, lastName, tags, source } = await req.json();

    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json(
        { error: "Vul een geldig e-mailadres in." },
        { status: 400 },
      );
    }

    const result = await subscribe({
      email,
      firstName,
      lastName,
      tags,
      source: source ?? "site",
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: "Inschrijven lukte niet, probeer het later opnieuw." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      demo: result.demo,
      message: "Bedankt voor je inschrijving! Check je inbox voor een welkomstmail.",
    });
  } catch (err) {
    console.error("[api/newsletter]", err);
    return NextResponse.json({ error: "Er ging iets mis." }, { status: 500 });
  }
}
