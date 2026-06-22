import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/auth";
import { getProfile, saveProfile, type CustomerProfile } from "@/lib/store/profile";
import { listOrdersByEmail } from "@/lib/store/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Splits het samengestelde order-adres ("Straatnaam 12-A") terug naar losse velden. */
function splitStreet(full?: string): {
  street?: string;
  houseNumber?: string;
  houseNumberAddition?: string;
} {
  const s = (full ?? "").trim();
  const m = s.match(/^(.*?)\s+(\d+)\s*[-/\s]?\s*(.*)$/);
  if (!m) return { street: s || undefined };
  return {
    street: m[1].trim() || undefined,
    houseNumber: m[2] || undefined,
    houseNumberAddition: m[3].trim() || undefined,
  };
}

/**
 * Leid een profiel-voorzet af uit de laatste bestelling van de klant — zodat een
 * terugkerende klant zijn adres meteen voorgevuld ziet, ook vóór er ooit een
 * profiel is opgeslagen. Wordt niet bewaard; pas bij de volgende bestelling (of
 * een "opslaan" in het account) wordt het echt vastgelegd.
 */
async function profileFromLastOrder(email: string): Promise<CustomerProfile | null> {
  const orders = await listOrdersByEmail(email);
  const last = orders[0];
  if (!last) return null;
  const c = last.customer;
  const { street, houseNumber, houseNumberAddition } = splitStreet(c.street);
  return {
    email,
    name: [c.firstName, c.lastName].filter(Boolean).join(" ") || undefined,
    phone: c.phone,
    company: c.company,
    cocNumber: c.cocNumber,
    vatNumber: c.vatNumber,
    address: {
      firstName: c.firstName,
      lastName: c.lastName,
      street,
      houseNumber,
      houseNumberAddition,
      postalCode: c.postalCode,
      city: c.city,
      country: c.country || "NL",
    },
  };
}

/**
 * Profiel van de ingelogde klant: bewaard bezorgadres, telefoon en (zakelijke)
 * gegevens. Wordt gebruikt om de checkout voor te vullen en om de "Gegevens"-tab
 * in het account te beheren. Altijd afgeschermd op de sessie.
 */
export async function GET() {
  const session = await getSession();
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const stored = await getProfile(email);
  if (stored) {
    return NextResponse.json({ profile: stored });
  }
  // Nog geen opgeslagen profiel: val terug op het adres uit de laatste bestelling,
  // anders op enkel naam/e-mail uit de sessie.
  const fromOrder = await profileFromLastOrder(email);
  const profile = fromOrder ?? { email, name: session?.user?.name ?? undefined };
  return NextResponse.json({ profile });
}

const addressSchema = z.object({
  firstName: z.string().max(80).optional(),
  lastName: z.string().max(80).optional(),
  street: z.string().max(120).optional(),
  houseNumber: z.string().max(20).optional(),
  houseNumberAddition: z.string().max(20).optional(),
  postalCode: z.string().max(16).optional(),
  city: z.string().max(80).optional(),
  country: z.string().max(2).optional(),
});

const bodySchema = z.object({
  name: z.string().max(160).optional(),
  phone: z.string().max(40).optional(),
  address: addressSchema.optional(),
  company: z.string().max(160).optional(),
  cocNumber: z.string().max(40).optional(),
  vatNumber: z.string().max(40).optional(),
});

export async function PUT(req: Request) {
  const session = await getSession();
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Ongeldige gegevens", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const profile = await saveProfile(email, parsed.data);
  return NextResponse.json({ ok: true, profile });
}
