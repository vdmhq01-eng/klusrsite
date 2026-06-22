import { NextResponse } from "next/server";
import { getMollieApiKey } from "@/lib/payments";

export const runtime = "nodejs";

/**
 * Apple Pay merchant-validatie (stap 1 van de native Apple Pay-flow).
 *
 * De browser levert in `onvalidatemerchant` een `validationURL` van Apple aan.
 * Die mogen we niet zelf naar Apple sturen — dat doet Mollie voor ons via
 * `POST /v2/wallets/applepay/sessions`. Mollie geeft een ondertekende merchant-
 * sessie terug die we 1-op-1 doorgeven aan `session.completeMerchantValidation`.
 *
 * Beveiliging: we accepteren alleen een `validationUrl` waarvan de host op
 * `apple.com` eindigt, zodat dit endpoint niet als open proxy misbruikt kan
 * worden. Het domein dat we aan Mollie meesturen is óns geverifieerde domein
 * (NEXT_PUBLIC_SITE_URL, terugval op www.klus-r.nl) — niet de validationUrl.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as
      | { validationUrl?: unknown }
      | null;
    const validationUrl = body?.validationUrl;

    // 1. Valideer de validationUrl: het moet een string zijn met een Apple-host.
    if (typeof validationUrl !== "string" || !validationUrl) {
      return NextResponse.json({ error: "Ongeldige validationUrl" }, { status: 400 });
    }
    let host: string;
    try {
      host = new URL(validationUrl).hostname;
    } catch {
      return NextResponse.json({ error: "Ongeldige validationUrl" }, { status: 400 });
    }
    if (host !== "apple.com" && !host.endsWith(".apple.com")) {
      return NextResponse.json({ error: "validationUrl is geen Apple-host" }, { status: 400 });
    }

    // 2. Mollie-sleutel (zelfde normalisatie als payments.ts).
    const key = getMollieApiKey();
    if (!key) {
      return NextResponse.json(
        { error: "Mollie is niet geconfigureerd" },
        { status: 400 },
      );
    }

    // 3. Ons eigen, in Mollie geverifieerde Apple Pay-domein (zonder protocol).
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.klus-r.nl";
    let domain = "www.klus-r.nl";
    try {
      domain = new URL(siteUrl).hostname;
    } catch {
      domain = "www.klus-r.nl";
    }

    // 4. Vraag Mollie de Apple Pay merchant-sessie aan.
    const res = await fetch("https://api.mollie.com/v2/wallets/applepay/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ domain, validationUrl }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      // Geef de Mollie-foutinhoud door zodat fouten te diagnosticeren zijn.
      return NextResponse.json(
        { error: "Apple Pay-sessie aanvragen mislukt", mollie: data },
        { status: 502 },
      );
    }

    // 5. De merchant-sessie 1-op-1 teruggeven aan de client.
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    // Nooit throwen: de client breekt de Apple Pay-sheet netjes af op een fout.
    console.error("[api/checkout/applepay-session]", err);
    return NextResponse.json(
      { error: "Apple Pay-sessie aanvragen mislukt" },
      { status: 502 },
    );
  }
}
