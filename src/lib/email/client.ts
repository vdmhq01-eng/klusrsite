/**
 * Transactional e-mail via Resend.
 *
 * Uses the Resend REST API directly (fetch) so there is no extra dependency.
 * Degrades to a no-op (demo mode) when RESEND_API_KEY is missing, so the
 * order/newsletter flows never break the UX while developing without secrets.
 *
 * Let op: het FROM-domein moet geverifieerd zijn in Resend, anders weigert
 * Resend de verzending.
 */

const API_KEY = process.env.RESEND_API_KEY;

/** Afzender. Het domein moet geverifieerd zijn in Resend. */
const FROM = process.env.EMAIL_FROM || "KLUSR <bestellingen@klus-r.nl>";
/** Antwoorden komen bij de klantenservice terecht. */
const REPLY_TO = process.env.EMAIL_REPLY_TO || "klantenservice@klus-r.nl";

const ENDPOINT = "https://api.resend.com/emails";

export function isEmailConfigured(): boolean {
  return Boolean(API_KEY);
}

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  from?: string;
}

export interface SendEmailResult {
  ok: boolean;
  /** True wanneer er niets echt verstuurd is (geen API-key). */
  demo: boolean;
  id?: string;
  error?: string;
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  if (!API_KEY) {
    // Demo mode — log instead of sending so the flow stays testable.
    console.info("[email] demo mode — would send", {
      to: input.to,
      subject: input.subject,
    });
    return { ok: true, demo: true };
  }

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: input.from || FROM,
        to: Array.isArray(input.to) ? input.to : [input.to],
        subject: input.subject,
        html: input.html,
        ...(input.text ? { text: input.text } : {}),
        reply_to: input.replyTo || REPLY_TO,
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[email] Resend responded", res.status, detail);
      return { ok: false, demo: false, error: `Resend ${res.status}` };
    }

    const data = (await res.json().catch(() => ({}))) as { id?: string };
    return { ok: true, demo: false, id: data.id };
  } catch (err) {
    console.error("[email] send failed", err);
    return { ok: false, demo: false, error: "send failed" };
  }
}
