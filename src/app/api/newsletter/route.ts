import { NextResponse } from "next/server";
import { subscribe } from "@/lib/mailchimp";
import { sendWelcomeEmail } from "@/lib/email";
import { addContact, AUDIENCES } from "@/lib/email/audiences";
import { isKvEnabled, kvSetNX } from "@/lib/store/kv";

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

    // Inschrijving als contact in de Resend-nieuwsbrief-audience (best-effort).
    void addContact({
      audience: AUDIENCES.NEWSLETTER,
      email,
      firstName,
      lastName,
    }).catch(() => {});

    // Welkomstmail: alléén de allereerste keer per adres. Het inschrijfformulier
    // zit op meerdere plekken (footer, exit-intent-popup, checkout-vinkje), dus
    // zonder deze check kreeg een terugkerend adres bij élke inschrijving opnieuw
    // een welkomstmail. kvSetNX claimt het adres atomisch (geen race); lukt de
    // claim niet, dan is de welkomstmail al eens verstuurd. Zonder KV (demo) kan
    // er niet gededupliceerd worden en valt het terug op het oude gedrag.
    const welcomeKey = `newsletter:welcomed:${email.trim().toLowerCase()}`;
    const firstSubscribe = isKvEnabled()
      ? await kvSetNX(welcomeKey, new Date().toISOString())
      : true;

    if (firstSubscribe) {
      // Branded welkomstmail (Resend; no-op zonder API-key).
      void sendWelcomeEmail({ email, firstName }).catch(() => {});
    }

    return NextResponse.json({
      ok: true,
      demo: result.demo,
      alreadySubscribed: !firstSubscribe,
      message: firstSubscribe
        ? "Bedankt voor je inschrijving! Check je inbox voor een welkomstmail."
        : "Je staat al ingeschreven — fijn dat je er bent!",
    });
  } catch (err) {
    console.error("[api/newsletter]", err);
    return NextResponse.json({ error: "Er ging iets mis." }, { status: 500 });
  }
}
