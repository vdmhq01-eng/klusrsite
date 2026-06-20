import { NextResponse } from "next/server";
import { subscribe } from "@/lib/mailchimp";
import { sendWelcomeEmail } from "@/lib/email";
import { addContact, AUDIENCES } from "@/lib/email/audiences";
import { isKvEnabled, kvSetNX } from "@/lib/store/kv";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** In-memory terugval voor de welkomstmail-dedup wanneer KV uit staat (per instance). */
const memWelcomed = new Set<string>();

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

    // Welkomstmail: hooguit één keer per adres. Het inschrijfformulier zit op
    // meerdere plekken (footer, exit-intent-popup, checkout-vinkje), dus zonder
    // deze check kreeg een terugkerend adres bij élke inschrijving opnieuw een
    // welkomstmail. Met KV claimt kvSetNX het adres atomisch (dedup tussen
    // instances én deploys); zonder KV is er een in-memory terugval per instance.
    const normEmail = email.trim().toLowerCase();
    const welcomeKey = `newsletter:welcomed:${normEmail}`;
    let firstSubscribe: boolean;
    if (isKvEnabled()) {
      firstSubscribe = await kvSetNX(welcomeKey, new Date().toISOString());
    } else {
      firstSubscribe = !memWelcomed.has(normEmail);
      if (firstSubscribe) memWelcomed.add(normEmail);
    }

    // Inschrijven vanuit de checkout stuurt géén losse welkomstmail: die klant
    // krijgt al een bestelbevestiging en is (ingelogd) al "welkom geheten". Zo
    // krijg je geen welkomstmail meer terwijl je gewoon een bestelling plaatst.
    const fromCheckout = source === "checkout";

    if (firstSubscribe && !fromCheckout) {
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
