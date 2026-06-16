import { NextResponse } from "next/server";
import { getAdminSession } from "@/auth";
import { sendTestOrder, type SendTestOrderInput } from "@/lib/channable";

/**
 * Admin-only: stuur een test-order naar Channable. Afgeschermd via de
 * ADMIN_EMAILS-allowlist (zie src/auth.ts).
 */
export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Niet geautoriseerd." }, { status: 401 });
  }
  try {
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
