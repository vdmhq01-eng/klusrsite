import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Nederlandse adres-lookup via de (gratis) PDOK Locatieserver — geen API-key.
 * GET /api/address-lookup?postcode=7442CK&number=3 → { found, street, city }.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const postcode = (url.searchParams.get("postcode") || "").replace(/\s/g, "").toUpperCase();
  const number = (url.searchParams.get("number") || "").trim();

  if (!/^\d{4}[A-Z]{2}$/.test(postcode) || !number) {
    return NextResponse.json({ error: "Ongeldige postcode of huisnummer." }, { status: 400 });
  }

  try {
    const q = encodeURIComponent(`${postcode} ${number}`);
    const res = await fetch(
      `https://api.pdok.nl/bzk/locatieserver/search/v3_1/free?q=${q}&rows=1&fq=type:adres`,
      { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(8000) },
    );
    if (!res.ok) {
      return NextResponse.json({ error: "Adres ophalen mislukt." }, { status: 502 });
    }
    const data = (await res.json()) as {
      response?: { docs?: { straatnaam?: string; woonplaatsnaam?: string }[] };
    };
    const doc = data?.response?.docs?.[0];
    if (!doc?.straatnaam) {
      return NextResponse.json({ found: false });
    }
    return NextResponse.json({
      found: true,
      street: doc.straatnaam,
      city: doc.woonplaatsnaam ?? "",
    });
  } catch {
    return NextResponse.json({ error: "Adres ophalen mislukt." }, { status: 502 });
  }
}
