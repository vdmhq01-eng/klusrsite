import { NextResponse } from "next/server";
import { getAdminSession } from "@/auth";
import {
  listTickets,
  addMessage,
  setStatus,
  getTicket,
  type TicketStatus,
} from "@/lib/store/tickets";
import { sendSupportReply, isEmailConfigured } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Admin: alle klantenservice-tickets. */
export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    tickets: await listTickets(),
    emailConfigured: isEmailConfigured(),
  });
}

/**
 * Admin-acties op een ticket:
 *   { action: "reply", id, body }   → mail de klant + log het antwoord
 *   { action: "status", id, status } → open / pending / closed
 */
export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let data: Record<string, unknown>;
  try {
    data = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid-json" }, { status: 400 });
  }

  const action = typeof data.action === "string" ? data.action : "";
  const id = typeof data.id === "string" ? data.id : "";
  if (!id) return NextResponse.json({ ok: false, error: "missing-id" }, { status: 400 });

  if (action === "reply") {
    const body = typeof data.body === "string" ? data.body.trim() : "";
    if (body.length < 2) {
      return NextResponse.json({ ok: false, error: "empty-reply" }, { status: 400 });
    }
    const ticket = await getTicket(id);
    if (!ticket) return NextResponse.json({ ok: false, error: "not-found" }, { status: 404 });

    const updated = await addMessage(id, {
      from: "agent",
      body,
      authorName: "KLUSR Klantenservice",
      authorEmail: session.user?.email ?? undefined,
    });

    const result = await sendSupportReply({
      email: ticket.customerEmail,
      name: ticket.customerName,
      reference: ticket.reference,
      body,
    });

    return NextResponse.json({ ok: true, ticket: updated, email: result });
  }

  if (action === "status") {
    const status = data.status as TicketStatus;
    if (!["open", "pending", "closed"].includes(status)) {
      return NextResponse.json({ ok: false, error: "invalid-status" }, { status: 400 });
    }
    const updated = await setStatus(id, status);
    if (!updated) return NextResponse.json({ ok: false, error: "not-found" }, { status: 404 });
    return NextResponse.json({ ok: true, ticket: updated });
  }

  return NextResponse.json({ ok: false, error: "unknown-action" }, { status: 400 });
}
