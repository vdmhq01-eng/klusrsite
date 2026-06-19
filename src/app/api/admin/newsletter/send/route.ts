import { NextResponse } from "next/server";
import { getAdminSession } from "@/auth";
import { getProductById } from "@/lib/data/products";
import { newsletterEmail } from "@/lib/email/templates";
import { sendEmail } from "@/lib/email/client";
import { AUDIENCES, ensureAudienceId } from "@/lib/email/audiences";
import {
  audienceContactCount,
  createBroadcast,
  isBroadcastConfigured,
  sendBroadcast,
  NEWSLETTER_FROM,
} from "@/lib/email/broadcast";
import type { Product } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function resolveProducts(ids: unknown): Product[] {
  if (!Array.isArray(ids)) return [];
  const out: Product[] = [];
  for (const id of ids) {
    if (typeof id !== "string") continue;
    const p = getProductById(id);
    if (p) out.push(p);
  }
  return out;
}

/**
 * Admin: verstuur de nieuwsbrief.
 *  - mode "test"      → één testmail naar de admin (of `testEmail`).
 *  - mode "broadcast" → een Resend-broadcast naar de "KLUSR Nieuwsbrief"-audience.
 *
 * Body: { subject, preheader, intro, productIds, mode, testEmail?, scheduledAt? }.
 * Alles best-effort + demo-veilig: zonder RESEND_API_KEY is het een duidelijke
 * no-op met een demo-melding; nooit gooien zodat de admin niet breekt.
 */
export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const adminEmail = session.user?.email || "";

  let body: {
    subject?: string;
    preheader?: string;
    intro?: string;
    productIds?: unknown;
    mode?: string;
    testEmail?: string;
    scheduledAt?: string;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid-json" }, { status: 400 });
  }

  const subject = (body.subject || "").trim();
  const products = resolveProducts(body.productIds);
  const mode = body.mode === "broadcast" ? "broadcast" : "test";

  // Validatie: onderwerp + minstens één product vereist.
  if (!subject || products.length === 0) {
    return NextResponse.json(
      { ok: false, error: "Vul een onderwerp in en selecteer minstens één product." },
      { status: 400 },
    );
  }

  const { html, text } = newsletterEmail({
    subject,
    preheader: (body.preheader || "").trim(),
    intro: body.intro || "",
    products,
  });

  // --- Testmodus: één mail naar de admin (of opgegeven adres) ---------------
  if (mode === "test") {
    const to = (body.testEmail || "").trim() || adminEmail;
    if (!to) {
      return NextResponse.json(
        { ok: false, error: "Geen testadres bekend." },
        { status: 400 },
      );
    }
    const res = await sendEmail({ to, subject, html, text, from: NEWSLETTER_FROM });
    return NextResponse.json({ ok: res.ok, demo: res.demo, to, error: res.error });
  }

  // --- Broadcastmodus: naar de hele nieuwsbrief-audience --------------------
  if (!isBroadcastConfigured()) {
    return NextResponse.json({
      ok: false,
      demo: true,
      error: "Resend niet geconfigureerd",
    });
  }

  const audienceId = await ensureAudienceId(AUDIENCES.NEWSLETTER);
  if (!audienceId) {
    return NextResponse.json({
      ok: false,
      demo: false,
      error: "Audience 'KLUSR Nieuwsbrief' niet gevonden of niet aan te maken.",
    });
  }

  const name = `Nieuwsbrief ${new Date().toISOString().slice(0, 16).replace("T", " ")} — ${subject}`.slice(0, 200);
  const created = await createBroadcast({
    audienceId,
    from: NEWSLETTER_FROM,
    subject,
    html,
    text,
    name,
  });
  if (!created) {
    return NextResponse.json({
      ok: false,
      demo: false,
      error: "Broadcast aanmaken bij Resend mislukt.",
    });
  }

  const scheduledAt =
    typeof body.scheduledAt === "string" && body.scheduledAt.trim()
      ? body.scheduledAt.trim()
      : undefined;
  const sent = await sendBroadcast(created.id, { scheduledAt });
  if (!sent) {
    return NextResponse.json({
      ok: false,
      demo: false,
      broadcastId: created.id,
      error: "Broadcast versturen bij Resend mislukt.",
    });
  }

  const recipients = await audienceContactCount(audienceId); // best-effort, kan null zijn
  return NextResponse.json({
    ok: true,
    demo: false,
    broadcastId: created.id,
    recipients,
    scheduled: Boolean(scheduledAt),
  });
}
