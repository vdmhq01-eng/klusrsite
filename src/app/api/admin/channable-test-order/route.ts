import { NextResponse } from "next/server";
import { getSession } from "@/auth";
import { sendTestOrder, type SendTestOrderInput } from "@/lib/channable";

/**
 * Admin-only: stuur een test-order naar Channable.
 *
 * AUTH-GUARD / PARITEIT:
 * De /admin-omgeving draait momenteel open (demo — "geen authenticatie", zie
 * src/app/admin/page.tsx) en er is geen middleware die /admin afschermt. We
 * houden hier dezelfde pariteit: de route blokkeert niet hard. Zodra echte
 * authenticatie (AUTH_SECRET + OAuth) is geconfigureerd kun je onderstaande
 * sessie-check aanzetten door de `return` te activeren. We lezen de sessie nu
 * al defensief uit zodat de overstap naar afgeschermd één regel is.
 */
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    // Defensief: sessie ophalen (crasht niet zonder auth-config). Wanneer je
    // /admin wilt afschermen, vervang de no-op hieronder door een 401.
    const session = await getSession();
    void session; // bewust ongebruikt zolang /admin in demo-modus draait.
    // if (!session) {
    //   return NextResponse.json({ error: "Niet geautoriseerd." }, { status: 401 });
    // }

    // Optionele overrides voor het test-orderregel-item (allemaal optioneel).
    let input: SendTestOrderInput = {};
    try {
      const body = (await req.json()) as SendTestOrderInput | null;
      if (body && typeof body === "object") input = body;
    } catch {
      /* lege body is prima — gebruik defaults */
    }

    const result = await sendTestOrder(input);
    // sendTestOrder gooit nooit; geef het resultaat altijd als 200 terug zodat
    // de client de gestructureerde { ok, configured, message } kan tonen.
    return NextResponse.json(result);
  } catch (err) {
    console.error("[api/admin/channable-test-order]", err);
    return NextResponse.json(
      {
        ok: false,
        status: 0,
        configured: false,
        message: "Er ging iets mis bij het versturen van de testorder.",
      },
      { status: 500 },
    );
  }
}
