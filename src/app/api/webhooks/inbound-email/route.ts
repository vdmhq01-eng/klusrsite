import { NextResponse } from "next/server";
import { createTicket, addMessage, findByReference } from "@/lib/store/tickets";
import { logEvent } from "@/lib/store/analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Inkomende e-mail (klantenservice@klus-r.nl) → ticket.
 *
 * Koppel deze URL als inbound webhook (bv. Resend Inbound of een
 * e-mail-forwardingdienst):
 *   https://klus-r.nl/api/webhooks/inbound-email?token=INBOUND_EMAIL_SECRET
 *
 * Auth via gedeeld geheim (querytoken of header) zodat we dependency-vrij
 * blijven. Zonder INBOUND_EMAIL_SECRET draait de route in demo-modus (accepteert
 * alles) zodat hij lokaal te testen is.
 */
const SECRET = process.env.INBOUND_EMAIL_SECRET;

function authorized(req: Request): boolean {
  if (!SECRET) return true; // demo
  const url = new URL(req.url);
  const token = url.searchParams.get("token") || req.headers.get("x-webhook-token");
  return token === SECRET;
}

/** "Naam <mail@x.nl>" → { name, email }. Accepteert ook objecten. */
function parseFrom(from: unknown): { name?: string; email: string } | null {
  if (!from) return null;
  if (typeof from === "object") {
    const o = from as { address?: string; email?: string; name?: string };
    const email = (o.address || o.email || "").trim();
    if (!email) return null;
    return { name: o.name?.trim() || undefined, email: email.toLowerCase() };
  }
  if (typeof from !== "string") return null;
  const m = from.match(/^\s*(?:"?([^"<]*)"?\s*)?<?([^<>\s]+@[^<>\s]+)>?\s*$/);
  if (!m) return null;
  return { name: m[1]?.trim() || undefined, email: m[2].trim().toLowerCase() };
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|tr|li|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function POST(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid-json" }, { status: 400 });
  }

  // Resend verpakt de e-mail in `data`; generieke shapes staan op het topniveau.
  const data = (payload.data && typeof payload.data === "object"
    ? (payload.data as Record<string, unknown>)
    : payload) as Record<string, unknown>;

  const sender = parseFrom(data.from);
  if (!sender) {
    return NextResponse.json({ ok: false, error: "no-sender" }, { status: 400 });
  }

  const subject = (typeof data.subject === "string" ? data.subject : "").trim() || "(geen onderwerp)";
  const text = typeof data.text === "string" ? data.text : "";
  const html = typeof data.html === "string" ? data.html : "";
  const body = (text || (html ? stripHtml(html) : "")).trim() || "(lege e-mail)";

  // Threading: bestaand ticketnummer in de onderwerpregel?
  const refMatch = subject.match(/KLUSR-[A-Z0-9]{6}/i);
  if (refMatch) {
    const existing = await findByReference(refMatch[0]);
    if (existing) {
      await addMessage(existing.id, {
        from: "customer",
        body,
        authorName: sender.name,
        authorEmail: sender.email,
      });
      void logEvent("support_ticket", { reference: existing.reference, channel: "email", reply: true });
      return NextResponse.json({ ok: true, reference: existing.reference, threaded: true });
    }
  }

  const ticket = await createTicket({
    subject: subject.replace(/^\s*(re|fwd?):\s*/i, "").trim() || subject,
    customerEmail: sender.email,
    customerName: sender.name,
    body,
    channel: "email",
  });
  void logEvent("support_ticket", { reference: ticket.reference, channel: "email" });

  return NextResponse.json({ ok: true, reference: ticket.reference });
}
